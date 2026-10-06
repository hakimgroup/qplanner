-- =====================================================================
-- Uberall integration — Phase 3: event-driven access sync
--
-- A single trigger on practice_members is the DRY choke point that covers
-- EVERY grant/revoke path (assign_user_to_practice, unassign_user_from_practice,
-- update_user's diff) — instead of patching each RPC. It fires our own server's
-- /uberall/sync-user endpoint via pg_net (same template as the n8n /
-- awaiting-approval triggers). A second trigger re-syncs a practice's members
-- when its Uberall Location id changes. The endpoint is idempotent (recompute +
-- PATCH the full array), so duplicate fires are harmless.
--
-- SERVER URL is environment-specific (like on_selection_awaiting_approval):
--   staging → qplanner-server-staging.vercel.app
--   prod    → qplanner-server.vercel.app
-- This file uses the STAGING url. Swap the two occurrences when applying to prod.
--
-- Apply to STAGING first. The endpoint must be DEPLOYED for the fire to land;
-- until then pg_net posts harmlessly 404 (async, never blocks the transaction).
-- Idempotent.
-- =====================================================================

-- 1. Membership change → re-sync that user.
CREATE OR REPLACE FUNCTION public.uberall_sync_on_membership_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text := COALESCE(NEW.email, OLD.email);
BEGIN
  IF v_email IS NOT NULL THEN
    PERFORM net.http_post(
      url     := 'https://qplanner-server-staging.vercel.app/uberall/sync-user',
      body    := jsonb_build_object('email', v_email, 'source', 'trigger-membership'),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_uberall_sync_membership ON public.practice_members;
CREATE TRIGGER trg_uberall_sync_membership
AFTER INSERT OR UPDATE OR DELETE ON public.practice_members
FOR EACH ROW EXECUTE FUNCTION public.uberall_sync_on_membership_change();

-- 2. A practice's Uberall Location id changed → re-sync all its members.
CREATE OR REPLACE FUNCTION public.uberall_sync_on_practice_location_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
BEGIN
  IF NEW.uberall_location_id IS DISTINCT FROM OLD.uberall_location_id THEN
    FOR r IN SELECT email FROM public.practice_members WHERE practice_id = NEW.id LOOP
      PERFORM net.http_post(
        url     := 'https://qplanner-server-staging.vercel.app/uberall/sync-user',
        body    := jsonb_build_object('email', r.email, 'source', 'trigger-practice'),
        headers := '{"Content-Type": "application/json"}'::jsonb
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_uberall_sync_practice_loc ON public.practices;
CREATE TRIGGER trg_uberall_sync_practice_loc
AFTER UPDATE OF uberall_location_id ON public.practices
FOR EACH ROW EXECUTE FUNCTION public.uberall_sync_on_practice_location_change();
