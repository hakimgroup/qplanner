-- Allow the new email_type values used by the feedback reminder + escalation cron.
ALTER TABLE public.notification_emails_log
  DROP CONSTRAINT IF EXISTS notification_emails_log_email_type_check;

ALTER TABLE public.notification_emails_log
  ADD CONSTRAINT notification_emails_log_email_type_check
  CHECK (email_type = ANY (ARRAY[
    'assets_requested',
    'assets_requested_bulk',
    'assets_submitted',
    'assets_confirmed',
    'feedback_requested',
    'awaiting_approval',
    'campaign_added',
    'campaign_added_bulk',
    'campaign_updated',
    'campaign_deleted',
    'bespoke_added',
    'bespoke_event_added',
    'campaigns_copied',
    'planner_overview',
    'comment_added',
    'feedback_reminder',
    'feedback_escalation'
  ]));
