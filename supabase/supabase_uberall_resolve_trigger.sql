-- =====================================================================
-- Uberall integration — auto-resolve a practice's Location id.
--
-- When a practice is created (or its uberall_business_id is edited), resolve
-- the identifier to a numeric Location id via the server, which stores it on
-- practices.uberall_location_id. Storing that then fires the existing
-- location-change trigger, which re-syncs the practice's members — so a new
-- practice + assigned user works end-to-end. Unresolvable identifiers store
-- NULL (safely skipped + surfaced on the Health page); the nightly reconcile
-- retries them.
--
-- SECRET: replace __CRON_SECRET__ on apply. SERVER URL is env-specific
-- (staging below; swap to qplanner-server.vercel.app for PROD).
--
-- Apply to STAGING first. Idempotent.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.uberall_resolve_on_practice_identifier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT'
        AND NEW.uberall_business_id IS NOT NULL
        AND btrim(NEW.uberall_business_id) <> '')
     OR (TG_OP = 'UPDATE'
        AND NEW.uberall_business_id IS DISTINCT FROM OLD.uberall_business_id) THEN
    PERFORM net.http_post(
      url     := 'https://qplanner-server-staging.vercel.app/uberall/resolve-practice',
      body    := jsonb_build_object('practice_id', NEW.id, 'source', 'trigger-practice-identifier'),
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer __CRON_SECRET__')
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_uberall_resolve_practice ON public.practices;
CREATE TRIGGER trg_uberall_resolve_practice
AFTER INSERT OR UPDATE OF uberall_business_id ON public.practices
FOR EACH ROW EXECUTE FUNCTION public.uberall_resolve_on_practice_identifier();
