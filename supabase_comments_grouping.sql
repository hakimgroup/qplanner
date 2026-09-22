-- =====================================================================
-- Comments inbox — per-campaign grouping (Instagram-style).
--
-- Collapses the caller's comment inbox so all comments for one campaign
-- (selection) show as a SINGLE row: campaign + latest comment + counts.
--
-- v2 convention: NEW functions alongside the existing per-comment ones
-- (list_my_comment_inbox / unread_comment_count stay untouched). The
-- client switches to the grouped variants; old ones remain for back-compat.
--
-- Apply to STAGING first, then PROD. Idempotent (CREATE OR REPLACE).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Grouped inbox: one row per conversation (selection) for the caller.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_my_comment_inbox_grouped(p_limit integer DEFAULT 10)
RETURNS TABLE(
  selection_id        uuid,
  practice_id         uuid,
  practice_name       text,
  campaign_name       text,
  is_bespoke          boolean,
  comment_count       bigint,
  unread_count        bigint,
  last_comment_id     uuid,
  last_author_user_id uuid,
  last_author_name    text,
  last_author_role    text,
  last_body           text,
  last_created_at     timestamptz,
  last_read_at        timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
#variable_conflict use_column
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      s.id                       AS selection_id,
      s.practice_id              AS practice_id,
      p.name                     AS practice_name,
      COALESCE(cc.name, bc.name) AS campaign_name,
      s.bespoke                  AS is_bespoke,
      sc.id                      AS comment_id,
      sc.author_user_id          AS author_user_id,
      btrim(COALESCE(au.first_name,'') || ' ' || COALESCE(au.last_name,'')) AS author_name,
      au.role                    AS author_role,
      sc.body                    AS body,
      sc.created_at              AS created_at,
      ct.read_at                 AS read_at
    FROM public.comment_targets ct
    JOIN public.selection_comments sc ON sc.id = ct.comment_id
    JOIN public.selections s          ON s.id  = sc.selection_id
    LEFT JOIN public.practices p          ON p.id  = s.practice_id
    LEFT JOIN public.campaigns_catalog cc ON cc.id = s.campaign_id
    LEFT JOIN public.bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
    LEFT JOIN public.allowed_users au     ON au.id = sc.author_user_id
    WHERE ct.user_id = v_user_id
  ),
  agg AS (
    SELECT
      b.selection_id,
      count(*)                                  AS comment_count,
      count(*) FILTER (WHERE b.read_at IS NULL) AS unread_count,
      max(b.created_at)                         AS last_created_at
    FROM base b
    GROUP BY b.selection_id
  )
  SELECT
    a.selection_id,
    latest.practice_id,
    latest.practice_name,
    latest.campaign_name,
    latest.is_bespoke,
    a.comment_count,
    a.unread_count,
    latest.comment_id      AS last_comment_id,
    latest.author_user_id  AS last_author_user_id,
    latest.author_name     AS last_author_name,
    latest.author_role     AS last_author_role,
    latest.body            AS last_body,
    latest.created_at      AS last_created_at,
    latest.read_at         AS last_read_at
  FROM agg a
  JOIN LATERAL (
    SELECT b.*
    FROM base b
    WHERE b.selection_id = a.selection_id
    ORDER BY b.created_at DESC
    LIMIT 1
  ) latest ON true
  ORDER BY a.last_created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 10), 1);
END;
$function$;

-- ---------------------------------------------------------------------
-- 2. Mark ALL of a selection's comments read for the caller (group open).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_selection_comments_read(p_selection_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.comment_targets ct
  SET read_at = now()
  FROM public.selection_comments sc
  WHERE ct.comment_id = sc.id
    AND sc.selection_id = p_selection_id
    AND ct.user_id = v_user_id
    AND ct.read_at IS NULL;

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- ---------------------------------------------------------------------
-- 3. Count of CONVERSATIONS (selections) with unread comments — badge.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unread_comment_conversations_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT count(DISTINCT sc.selection_id)
    INTO v_count
  FROM public.comment_targets ct
  JOIN public.selection_comments sc ON sc.id = ct.comment_id
  WHERE ct.user_id = v_user_id
    AND ct.read_at IS NULL;

  RETURN COALESCE(v_count, 0);
END;
$function$;

-- Grants (mirror existing comment RPCs).
GRANT EXECUTE ON FUNCTION public.list_my_comment_inbox_grouped(integer)      TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_selection_comments_read(uuid)          TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unread_comment_conversations_count()        TO anon, authenticated, service_role;
