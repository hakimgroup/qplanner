-- =====================================================================
-- Tracking columns for the feedback reminder + admin escalation cron.
-- Apply to STAGING first via psql, verify, then to PROD.
-- Idempotent.
-- =====================================================================

ALTER TABLE public.selections
  ADD COLUMN IF NOT EXISTS feedback_reminder_sent_at   timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_admin_escalated_at timestamptz;

COMMENT ON COLUMN public.selections.feedback_reminder_sent_at IS
  'When the magic-link reminder email was sent to the practice. Set by the /send-feedback-reminders cron.';

COMMENT ON COLUMN public.selections.feedback_admin_escalated_at IS
  'When the practice has remained unresponsive and an escalation email was sent to admins. Set by the same cron.';

-- Index that supports the cron query: find selections at awaitingApproval
-- with markup_opened_at set in a window relevant to either reminder or escalation.
CREATE INDEX IF NOT EXISTS idx_selections_awaiting_with_markup_opened
  ON public.selections (status, markup_opened_at, feedback_reminder_sent_at, feedback_admin_escalated_at)
  WHERE status = 'awaitingApproval' AND markup_opened_at IS NOT NULL;
