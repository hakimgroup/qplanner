-- =====================================================================
-- Uberall integration — Phase 6: deprovision-on-delete + trigger auth.
--
-- (1) Adds a trigger on allowed_users DELETE → deactivates the user's Uberall
--     account (only for accounts the Planner CREATED; adopted ones are left).
-- (2) SUPERSEDES the Phase 3 sync trigger functions (supabase_uberall_sync_triggers.sql)
--     — recreated here to carry the shared-secret Authorization header, so the
--     trigger-called endpoints (/uberall/sync-user, /uberall/deprovision-user)
--     can require auth instead of being open.
--
-- SECRET: replace __CRON_SECRET__ with the CRON_SECRET value on apply (kept out
-- of the committed file). SERVER URL is env-specific: staging url below; swap to
-- qplanner-server.vercel.app for PROD.
--
-- Apply to STAGING first (with the secret substituted). Idempotent.
-- =====================================================================

-- ---- (1) sync on membership change (now with auth header) ----
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
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer __CRON_SECRET__')
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ---- (2) sync when a practice's Uberall Location id changes (with auth) ----
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
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer __CRON_SECRET__')
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- ---- (3) deprovision on user delete ----
CREATE OR REPLACE FUNCTION public.uberall_deprovision_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only deactivate accounts the Planner CREATED. Adopted (pre-existing) accounts
  -- and unlinked users are left untouched.
  IF OLD.uberall_user_id IS NOT NULL AND OLD.uberall_provision_status = 'created' THEN
    PERFORM net.http_post(
      url     := 'https://qplanner-server-staging.vercel.app/uberall/deprovision-user',
      body    := jsonb_build_object('email', OLD.email, 'uberall_user_id', OLD.uberall_user_id, 'source', 'trigger-delete'),
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer __CRON_SECRET__')
    );
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_uberall_deprovision ON public.allowed_users;
CREATE TRIGGER trg_uberall_deprovision
AFTER DELETE ON public.allowed_users
FOR EACH ROW EXECUTE FUNCTION public.uberall_deprovision_on_delete();
