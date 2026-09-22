-- =====================================================================
-- Uberall integration — Phase 1 schema
-- Planner-side mapping + sync observability. All additive & nullable;
-- the current app ignores these columns/table, so this is safe to apply
-- ahead of any code.
--
-- Identity mapping keys on EMAIL, never on allowed_users.id (link_current_user()
-- rewrites that id to auth.uid() on login). uberall_user_id is a plain scalar
-- column so it rides the id rewrite for free — no FK needed.
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

-- 1. allowed_users — per-user Uberall mapping (non-secret identifiers only)
ALTER TABLE public.allowed_users
  ADD COLUMN IF NOT EXISTS uberall_user_id        text,
  ADD COLUMN IF NOT EXISTS uberall_provision_status text,   -- pending | created | failed | inactive
  ADD COLUMN IF NOT EXISTS uberall_synced_at      timestamptz;

COMMENT ON COLUMN public.allowed_users.uberall_user_id IS
  'Uberall numeric user id (as text). Correlated to the Planner user by EMAIL, not by allowed_users.id.';
COMMENT ON COLUMN public.allowed_users.uberall_provision_status IS
  'pending | created | failed | inactive — drives backfill retries + the Uberall Health page.';

-- 2. practices — resolved numeric Uberall Location id.
--    uberall_business_id (existing, mis-named) stays as the human-entered
--    identifier; uberall_location_id holds the numeric Location id resolved
--    once from GET /locations?identifier=<uberall_business_id>.
ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS uberall_location_id text;

COMMENT ON COLUMN public.practices.uberall_location_id IS
  'Uberall numeric Location id (as text), resolved from uberall_business_id via GET /locations?identifier=. NULL = unresolved/absent; such practices are skipped by Uberall sync and surfaced in the Health page.';

-- 3. uberall_sync_log — audit of every provision/sync/sso/deprovision attempt
--    (mirrors notification_emails_log). Holds NO secrets or tokens.
CREATE TABLE IF NOT EXISTS public.uberall_sync_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email      text,
  uberall_user_id text,
  action          text NOT NULL
                    CHECK (action IN ('provision','sync','deprovision','sso','resolve')),
  status          text NOT NULL DEFAULT 'attempted'
                    CHECK (status IN ('attempted','synced','failed','skipped')),
  source          text,                 -- client | server | cron | backfill | trigger
  requested_scope jsonb,                -- the managedLocations we tried to set
  error_message   text,
  attempted_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uberall_sync_log_status_created
  ON public.uberall_sync_log (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uberall_sync_log_source_created
  ON public.uberall_sync_log (source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uberall_sync_log_email
  ON public.uberall_sync_log (user_email);

ALTER TABLE public.uberall_sync_log ENABLE ROW LEVEL SECURITY;

-- Super-admins can read (powers the Health page via anon key + RLS, exactly
-- like EmailHealth reads notification_emails_log). Writes go through the
-- server's service-role client only — no client insert/update policy.
DROP POLICY IF EXISTS uberall_sync_log_select_super ON public.uberall_sync_log;
CREATE POLICY uberall_sync_log_select_super ON public.uberall_sync_log
  FOR SELECT TO authenticated
  USING (public.is_super_admin());
