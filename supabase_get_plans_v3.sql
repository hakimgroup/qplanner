-- Drop old 6-param overload (if exists) to avoid ambiguity
DROP FUNCTION IF EXISTS public.get_plans(uuid[], text, text, text, text, boolean);

CREATE OR REPLACE FUNCTION public.get_plans(
  p_practice_ids uuid[] DEFAULT NULL::uuid[],
  p_status text DEFAULT NULL::text,
  p_category text DEFAULT NULL::text,
  p_source text DEFAULT NULL::text,
  p_tier text DEFAULT NULL::text,
  p_is_bespoke boolean DEFAULT false,
  p_limit integer DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH my_practices AS (
  SELECT p.id, p.name
  FROM public.practices p
  WHERE
    (
      EXISTS (
        SELECT 1
        FROM public.allowed_users au
        WHERE au.id = auth.uid()
          AND LOWER(COALESCE(au.role, '')) = 'super_admin'
      )
      OR EXISTS (
        SELECT 1
        FROM public.practice_members pm
        WHERE pm.practice_id = p.id
          AND pm.user_id = auth.uid()
      )
    )
    AND (p_practice_ids IS NULL OR p.id = ANY(p_practice_ids))
),
base_rows AS (
  SELECT
    s.id                                                                AS id,
    s.practice_id                                                       AS "practiceId",
    mp.name                                                             AS practice,
    COALESCE(bc.name, c.name)                                           AS campaign,
    COALESCE(c.category, bc.category, 'Campaign')                       AS category,
    CASE WHEN s.bespoke THEN COALESCE(bc.source, s.source) ELSE s.source END AS source,
    c.tier                                                              AS tier,
    s.status                                                            AS status,
    s.notes                                                             AS notes,
    COALESCE(
      s.reference_links,
      CASE WHEN s.bespoke THEN bc.reference_links ELSE c.reference_links END,
      '[]'::jsonb
    )                                                                   AS reference_links,
    s.from_date                                                         AS "from",
    s.to_date                                                           AS "end",
    s.updated_at                                                        AS updated_at,
    s.bespoke_campaign_id                                               AS bespoke_id,
    CASE WHEN s.bespoke
      THEN COALESCE(bc.objectives, '[]'::jsonb)
      ELSE COALESCE(c.objectives, '[]'::jsonb)
    END                                                                 AS objectives,
    CASE WHEN s.bespoke
      THEN COALESCE(bc.topics, '[]'::jsonb)
      ELSE COALESCE(c.topics, '[]'::jsonb)
    END                                                                 AS topics,
    CASE
      WHEN s.bespoke IS TRUE
        THEN COALESCE(bc.assets, '{}'::jsonb)
      WHEN s.status = 'onPlan'
        THEN COALESCE(c.assets, '{}'::jsonb)
      ELSE
        COALESCE(s.assets, '{}'::jsonb)
    END                                                                 AS assets,
    CASE WHEN COALESCE(c.category, bc.category, 'Campaign') = 'Event'
         THEN bc.event_type
         ELSE NULL
    END                                                                 AS event_type,
    CASE
      WHEN s.bespoke IS DISTINCT FROM TRUE AND s.status = 'onPlan'
        THEN COALESCE(c.creatives, '[]'::jsonb)
      ELSE NULL
    END                                                                 AS creatives,
    s.markup_link                                                       AS markup_link,
    s.assets_link                                                       AS assets_link
  FROM public.selections s
  JOIN my_practices mp
    ON mp.id = s.practice_id
  LEFT JOIN public.campaigns_catalog c
    ON c.id = s.campaign_id
  LEFT JOIN public.bespoke_campaigns bc
    ON bc.id = s.bespoke_campaign_id
  WHERE
    (p_status IS NULL OR s.status = p_status)
    AND (
      p_source IS NULL
      OR LOWER(p_source) = 'bespoke'
      OR (CASE WHEN s.bespoke THEN COALESCE(bc.source, s.source) ELSE s.source END) = p_source
    )
    AND (p_category IS NULL OR COALESCE(c.category, bc.category, 'Campaign') = p_category)
    AND (p_tier IS NULL OR c.tier = p_tier)
    AND (
      NOT (p_is_bespoke OR LOWER(COALESCE(p_source, '')) = 'bespoke')
      OR s.bespoke = TRUE
    )
    AND (
      p_search IS NULL
      OR LOWER(COALESCE(mp.name, '') || ' ' || COALESCE(bc.name, c.name, ''))
        LIKE '%' || LOWER(p_search) || '%'
    )
),
meta AS (
  SELECT
    COALESCE(SUM((status = 'onPlan')::int), 0)            AS "onPlan",
    COALESCE(SUM((status = 'requested')::int), 0)         AS "requested",
    COALESCE(SUM((status = 'inProgress')::int), 0)        AS "inProgress",
    COALESCE(SUM((status = 'awaitingApproval')::int), 0)  AS "awaitingApproval",
    COALESCE(SUM((status = 'confirmed')::int), 0)         AS "confirmed",
    COALESCE(SUM((status = 'live')::int), 0)              AS "live"
  FROM base_rows
),
total AS (
  SELECT COUNT(*)::int AS total FROM base_rows
),
data_agg AS (
  SELECT COALESCE(
           jsonb_agg(to_jsonb(br) ORDER BY br.updated_at DESC, br.practice, br.campaign),
           '[]'::jsonb
         ) AS data
  FROM (
    SELECT * FROM base_rows
    ORDER BY updated_at DESC, practice, campaign
    LIMIT p_limit
    OFFSET p_offset
  ) br
)
SELECT jsonb_build_object(
  'data', data_agg.data,
  'meta', jsonb_build_object(
    'onPlan',           meta."onPlan",
    'requested',        meta."requested",
    'inProgress',       meta."inProgress",
    'awaitingApproval', meta."awaitingApproval",
    'confirmed',        meta."confirmed",
    'live',             meta."live",
    'total',            total.total
  )
)
FROM meta
CROSS JOIN data_agg
CROSS JOIN total;
$function$;
