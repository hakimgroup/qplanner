-- log_email_attempt
-- Writes an 'attempted' row in notification_emails_log before any external
-- network call. Returns the inserted row id so the caller can update it with
-- the outcome later.
--
-- p_notification_id: optional FK (NULL for cron/custom emails)
-- p_email_type:      one of the allowed email_type values
-- p_attempt_source:  'client' / 'server' / 'pg_net' / 'god_mode' / 'cron'
-- p_recipient_email: optional — present when the caller already knows the recipient

CREATE OR REPLACE FUNCTION public.log_email_attempt(
  p_notification_id uuid DEFAULT NULL,
  p_email_type text DEFAULT NULL,
  p_attempt_source text DEFAULT 'server',
  p_recipient_email text DEFAULT NULL,
  p_practice_id uuid DEFAULT NULL,
  p_selection_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notification_emails_log (
    notification_id, email_type, recipient_email, selection_id, practice_id,
    status, attempt_source, attempted_at, created_at, sent_at
  )
  VALUES (
    p_notification_id, p_email_type, p_recipient_email, p_selection_id, p_practice_id,
    'attempted', p_attempt_source, NOW(), NOW(), NULL
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_email_attempt(uuid, text, text, text, uuid, uuid)
  TO authenticated, service_role;

-- finalise_email_attempt
-- Updates an attempt row to a terminal outcome. Idempotent — if the row was
-- already updated by the server-side handler (with full recipient breakdown),
-- the client's failure call should NOT overwrite a successful outcome. We
-- only update if current status is still 'attempted'.

CREATE OR REPLACE FUNCTION public.finalise_email_attempt(
  p_attempt_id uuid,
  p_status text,
  p_error_message text DEFAULT NULL,
  p_resend_message_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated int;
BEGIN
  IF p_status NOT IN ('dispatched', 'sent', 'failed', 'bounced', 'complaint') THEN
    RAISE EXCEPTION 'invalid terminal status: %', p_status;
  END IF;

  UPDATE public.notification_emails_log
  SET status = p_status,
      error_message = COALESCE(p_error_message, error_message),
      resend_message_id = COALESCE(p_resend_message_id, resend_message_id),
      sent_at = CASE
                  WHEN p_status IN ('sent','dispatched') THEN COALESCE(sent_at, NOW())
                  ELSE sent_at
                END
  WHERE id = p_attempt_id
    AND status = 'attempted'; -- only update if still pending

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalise_email_attempt(uuid, text, text, text)
  TO authenticated, service_role;
