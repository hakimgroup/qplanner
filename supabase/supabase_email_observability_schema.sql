-- Email observability — schema migration
-- Extends notification_emails_log to capture pre-server attempts and
-- Resend reconciliation state.
--
-- Lifecycle of a row:
--   1. status='attempted'   — earliest known attempt (client / pg_net / cron / server)
--   2. status='dispatched'  — server reached Resend and got a 2xx (no recipient yet for batch)
--   3. status='sent'        — Resend accepted for this recipient (per-recipient row)
--   4. status='failed'      — send failed (either at our app or at Resend)
--   5. status='bounced'     — reconciliation found Resend marked it bounced
--   6. status='complaint'   — reconciliation found Resend received a spam complaint
--
-- New columns:
--   attempt_source    — where the attempt was logged from
--                       ('client' / 'server' / 'pg_net' / 'god_mode' / 'cron')
--   attempted_at      — when the attempt began (may precede sent_at by seconds-to-never)
--   resend_message_id — Resend's id, filled by reconciliation, used for the join

BEGIN;

-- Allow new status values
ALTER TABLE public.notification_emails_log
  DROP CONSTRAINT IF EXISTS notification_emails_log_status_check;

ALTER TABLE public.notification_emails_log
  ADD CONSTRAINT notification_emails_log_status_check
  CHECK (status = ANY (ARRAY[
    'attempted'::text,
    'dispatched'::text,
    'sent'::text,
    'failed'::text,
    'bounced'::text,
    'complaint'::text
  ]));

-- Allow pre-server attempt rows (client/pg_net) where recipient isn't known yet
ALTER TABLE public.notification_emails_log
  ALTER COLUMN recipient_email DROP NOT NULL;

-- sent_at should be null until Resend actually accepted the send
ALTER TABLE public.notification_emails_log
  ALTER COLUMN sent_at DROP NOT NULL,
  ALTER COLUMN sent_at DROP DEFAULT;

-- Backfill existing rows so existing data still satisfies invariants:
-- everything that's currently status='sent' but sent_at is the row's created_at
-- by default — that's fine, just keep it.
-- (no data backfill needed; the DROP DEFAULT only affects new rows)

ALTER TABLE public.notification_emails_log
  ADD COLUMN IF NOT EXISTS attempt_source text,
  ADD COLUMN IF NOT EXISTS attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS resend_message_id text;

-- attempt_source check (loose — keep flexible for future sources)
ALTER TABLE public.notification_emails_log
  DROP CONSTRAINT IF EXISTS notification_emails_log_attempt_source_check;
ALTER TABLE public.notification_emails_log
  ADD CONSTRAINT notification_emails_log_attempt_source_check
  CHECK (
    attempt_source IS NULL
    OR attempt_source = ANY (ARRAY[
      'client'::text, 'server'::text, 'pg_net'::text,
      'god_mode'::text, 'cron'::text
    ])
  );

-- Existing rows: treat them as 'server' outcomes attempted at created_at
UPDATE public.notification_emails_log
SET attempt_source = COALESCE(attempt_source, 'server'),
    attempted_at   = COALESCE(attempted_at, created_at);

-- Indexes for the admin UI + reconciliation queries
CREATE INDEX IF NOT EXISTS idx_email_log_status_created
  ON public.notification_emails_log (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_log_attempt_source_created
  ON public.notification_emails_log (attempt_source, created_at DESC);

-- Reconciliation lookup: by recipient + window
CREATE INDEX IF NOT EXISTS idx_email_log_recipient_sent_at
  ON public.notification_emails_log (recipient_email, sent_at DESC)
  WHERE sent_at IS NOT NULL;

-- Reconciliation reverse lookup once the Resend id is filled
CREATE INDEX IF NOT EXISTS idx_email_log_resend_message_id
  ON public.notification_emails_log (resend_message_id)
  WHERE resend_message_id IS NOT NULL;

COMMIT;

-- Sanity:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='notification_emails_log'
  AND column_name IN ('status', 'recipient_email', 'sent_at', 'attempt_source', 'attempted_at', 'resend_message_id')
ORDER BY ordinal_position;
