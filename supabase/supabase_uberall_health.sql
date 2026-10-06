-- =====================================================================
-- Uberall integration — Phase 5: Health summary RPC (super-admin only).
-- Powers the "Uberall Health" admin page. Recent log rows are read directly
-- from uberall_sync_log (RLS SELECT = is_super_admin()); this RPC provides the
-- aggregate counters + the unresolved-practice cleanup list in one call.
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_uberall_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
    'users', (
      SELECT jsonb_build_object(
        'total',         count(*),
        'linked',        count(*) FILTER (WHERE uberall_user_id IS NOT NULL),
        'created',       count(*) FILTER (WHERE uberall_provision_status = 'created'),
        'adopted',       count(*) FILTER (WHERE uberall_provision_status IN ('adopted','adopted_admin')),
        'failed',        count(*) FILTER (WHERE uberall_provision_status = 'failed'),
        'unprovisioned', count(*) FILTER (WHERE uberall_user_id IS NULL)
      ) FROM public.allowed_users
    ),
    'practices', (
      SELECT jsonb_build_object(
        'with_business_id', count(*) FILTER (WHERE uberall_business_id IS NOT NULL AND btrim(uberall_business_id) <> ''),
        'resolved',         count(*) FILTER (WHERE uberall_location_id IS NOT NULL),
        'unresolved',       count(*) FILTER (WHERE uberall_business_id IS NOT NULL AND btrim(uberall_business_id) <> '' AND uberall_location_id IS NULL)
      ) FROM public.practices
    ),
    'unresolved_list', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'value', uberall_business_id) ORDER BY name), '[]'::jsonb)
      FROM (
        SELECT id, name, uberall_business_id
        FROM public.practices
        WHERE uberall_business_id IS NOT NULL AND btrim(uberall_business_id) <> '' AND uberall_location_id IS NULL
        ORDER BY name LIMIT 300
      ) q
    ),
    'log_counts', (
      SELECT jsonb_build_object(
        'synced',    count(*) FILTER (WHERE status = 'synced'),
        'failed',    count(*) FILTER (WHERE status = 'failed'),
        'skipped',   count(*) FILTER (WHERE status = 'skipped'),
        'attempted', count(*) FILTER (WHERE status = 'attempted')
      ) FROM public.uberall_sync_log WHERE created_at > now() - interval '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_uberall_health() TO authenticated;
