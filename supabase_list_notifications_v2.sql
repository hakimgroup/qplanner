-- list_notifications v2: Add p_as_practice parameter
-- When p_as_practice = true AND caller is admin, return practice-audience
-- notifications for practices the admin is a member of (instead of admin-audience).

-- Drop the old overloaded version (with p_only_unread) to avoid ambiguity
DROP FUNCTION IF EXISTS public.list_notifications(text, uuid, boolean, integer, integer, text, date, date);

-- Drop current version and recreate with new parameter
DROP FUNCTION IF EXISTS public.list_notifications(text, uuid, integer, integer, text, date, date, text);

CREATE OR REPLACE FUNCTION public.list_notifications(
  p_type text DEFAULT NULL::text,
  p_practice_id uuid DEFAULT NULL::uuid,
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0,
  p_category text DEFAULT NULL::text,
  p_start_date date DEFAULT NULL::date,
  p_end_date date DEFAULT NULL::date,
  p_read_status text DEFAULT NULL::text,
  p_as_practice boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  type text,
  practice_id uuid,
  practice_name text,
  selection_id uuid,
  campaign_id uuid,
  title text,
  message text,
  payload jsonb,
  created_at timestamp with time zone,
  read_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_admin_practice_ids uuid[];
BEGIN

  IF p_as_practice IS TRUE AND public.is_admin() THEN
    ------------------------------------------------------------------
    -- ADMIN AS PRACTICE USER VIEW
    -- Show practice-audience notifications.
    -- Super admins: see ALL practices (no membership filter).
    -- Regular admins: see only their assigned practices.
    ------------------------------------------------------------------

    IF NOT public.is_super_admin() THEN
      -- Regular admin: get practice IDs they are a member of
      SELECT array_agg(pm.practice_id)
        INTO v_admin_practice_ids
      FROM public.practice_members pm
      WHERE pm.user_id = auth.uid();
    END IF;

    RETURN QUERY
    SELECT
      n.id,
      n.type,
      n.practice_id,
      p.name AS practice_name,
      n.selection_id,
      n.campaign_id,
      n.title,
      n.message,
      (
        n.payload
        || jsonb_build_object(
             'description',
             COALESCE(
               CASE WHEN s.bespoke THEN bc.description ELSE c.description END,
               ''
             )
           )
      ) AS payload,
      n.created_at,
      nt.read_at
    FROM public.notifications n
    LEFT JOIN public.notification_targets nt
      ON nt.notification_id = n.id
     AND nt.user_id = auth.uid()
    LEFT JOIN public.selections s         ON s.id = n.selection_id
    LEFT JOIN public.campaigns_catalog c  ON c.id = s.campaign_id
    LEFT JOIN public.bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
    LEFT JOIN public.practices p          ON p.id = n.practice_id
    WHERE
      n.audience = 'practice'
      -- Super admins see all practices; regular admins filtered by membership
      AND (v_admin_practice_ids IS NULL OR n.practice_id = ANY(v_admin_practice_ids))
      AND (p_type IS NULL OR n.type = p_type)
      AND (p_practice_id IS NULL OR n.practice_id = p_practice_id)
      AND (
        p_category IS NULL
        OR LOWER(n.payload->>'category') = LOWER(p_category)
      )
      AND (
        p_start_date IS NULL
        OR ((n.payload->>'from_date')::date >= p_start_date)
      )
      AND (
        p_end_date IS NULL
        OR ((n.payload->>'to_date')::date <= p_end_date)
      )
      AND (
        p_read_status IS NULL
        OR (
          (LOWER(p_read_status) = 'unread' AND nt.read_at IS NULL)
          OR (LOWER(p_read_status) = 'read'   AND nt.read_at IS NOT NULL)
        )
      )
    ORDER BY n.created_at DESC
    LIMIT GREATEST(p_limit, 1)
    OFFSET GREATEST(p_offset, 0);

  ELSIF public.is_admin() THEN
    ------------------------------------------------------------------
    -- ADMIN VIEW (audience='admins')
    ------------------------------------------------------------------
    RETURN QUERY
    SELECT
      n.id,
      n.type,
      n.practice_id,
      p.name AS practice_name,
      n.selection_id,
      n.campaign_id,
      n.title,
      n.message,
      (
        n.payload
        || jsonb_build_object(
             'description',
             COALESCE(
               CASE WHEN s.bespoke THEN bc.description ELSE c.description END,
               ''
             )
           )
      ) AS payload,
      n.created_at,
      nt.read_at
    FROM public.notifications n
    LEFT JOIN public.notification_targets nt
      ON nt.notification_id = n.id
     AND nt.user_id = auth.uid()
    LEFT JOIN public.selections s         ON s.id = n.selection_id
    LEFT JOIN public.campaigns_catalog c  ON c.id = s.campaign_id
    LEFT JOIN public.bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
    LEFT JOIN public.practices p          ON p.id = n.practice_id
    WHERE
      n.audience = 'admins'
      AND (p_type IS NULL OR n.type = p_type)
      AND (p_practice_id IS NULL OR n.practice_id = p_practice_id)
      AND (
        p_category IS NULL
        OR LOWER(n.payload->>'category') = LOWER(p_category)
      )
      AND (
        p_start_date IS NULL
        OR ((n.payload->>'from_date')::date >= p_start_date)
      )
      AND (
        p_end_date IS NULL
        OR ((n.payload->>'to_date')::date <= p_end_date)
      )
      AND (
        p_read_status IS NULL
        OR (
          (LOWER(p_read_status) = 'unread' AND nt.read_at IS NULL)
          OR (LOWER(p_read_status) = 'read'   AND nt.read_at IS NOT NULL)
        )
      )
    ORDER BY n.created_at DESC
    LIMIT GREATEST(p_limit, 1)
    OFFSET GREATEST(p_offset, 0);

  ELSE
    ------------------------------------------------------------------
    -- PRACTICE USER VIEW (audience='practice' + targeted)
    ------------------------------------------------------------------
    RETURN QUERY
    SELECT
      n.id,
      n.type,
      n.practice_id,
      p.name AS practice_name,
      n.selection_id,
      n.campaign_id,
      n.title,
      n.message,
      (
        n.payload
        || jsonb_build_object(
             'description',
             COALESCE(
               CASE WHEN s.bespoke THEN bc.description ELSE c.description END,
               ''
             )
           )
      ) AS payload,
      n.created_at,
      nt.read_at
    FROM public.notification_targets nt
    JOIN public.notifications n          ON n.id = nt.notification_id
    LEFT JOIN public.selections s         ON s.id = n.selection_id
    LEFT JOIN public.campaigns_catalog c  ON c.id = s.campaign_id
    LEFT JOIN public.bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
    LEFT JOIN public.practices p          ON p.id = n.practice_id
    WHERE
      nt.user_id = auth.uid()
      AND n.audience = 'practice'
      AND (p_type IS NULL OR n.type = p_type)
      AND (p_practice_id IS NULL OR n.practice_id = p_practice_id)
      AND (
        p_category IS NULL
        OR LOWER(n.payload->>'category') = LOWER(p_category)
      )
      AND (
        p_start_date IS NULL
        OR ((n.payload->>'from_date')::date >= p_start_date)
      )
      AND (
        p_end_date IS NULL
        OR ((n.payload->>'to_date')::date <= p_end_date)
      )
      AND (
        p_read_status IS NULL
        OR (
          (LOWER(p_read_status) = 'unread' AND nt.read_at IS NULL)
          OR (LOWER(p_read_status) = 'read'   AND nt.read_at IS NOT NULL)
        )
      )
    ORDER BY n.created_at DESC
    LIMIT GREATEST(p_limit, 1)
    OFFSET GREATEST(p_offset, 0);
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.list_notifications(text, uuid, integer, integer, text, date, date, text, boolean) TO anon, authenticated, service_role;
