-- Fix latent bug — log_email_attempt was failing the email_type NOT NULL
-- constraint silently whenever the caller didn't pass p_email_type but did
-- pass a notification_id (e.g. the client wrapper for sendNotificationEmail).
-- Derive the type from the notification when missing.

DROP FUNCTION IF EXISTS public.log_email_attempt(uuid, text, text, text, uuid, uuid);

CREATE OR REPLACE FUNCTION public.log_email_attempt(
  p_notification_id uuid DEFAULT NULL,
  p_email_type      text DEFAULT NULL,
  p_attempt_source  text DEFAULT 'server',
  p_recipient_email text DEFAULT NULL,
  p_practice_id     uuid DEFAULT NULL,
  p_selection_id    uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_id    uuid;
  v_type  text := p_email_type;
  v_ntype text;
BEGIN
  -- If email_type wasn't supplied but a notification_id was, map the
  -- notification's type to the corresponding email_type. Mirror of the
  -- same mapping the Express server uses when actually sending.
  IF v_type IS NULL AND p_notification_id IS NOT NULL THEN
    SELECT type INTO v_ntype
    FROM public.notifications
    WHERE id = p_notification_id;

    v_type := CASE v_ntype
      WHEN 'requested'          THEN 'assets_requested'
      WHEN 'inProgress'         THEN 'assets_submitted'
      WHEN 'confirmed'          THEN 'assets_confirmed'
      WHEN 'feedbackRequested'  THEN 'feedback_requested'
      WHEN 'awaitingApproval'   THEN 'awaiting_approval'
      WHEN 'campaignAdded'      THEN 'campaign_added'
      WHEN 'campaignUpdated'    THEN 'campaign_updated'
      WHEN 'campaignDeleted'    THEN 'campaign_deleted'
      WHEN 'bespokeAdded'       THEN 'bespoke_added'
      WHEN 'bespokeEventAdded'  THEN 'bespoke_event_added'
      WHEN 'campaignsCopied'    THEN 'campaigns_copied'
      ELSE NULL
    END;
  END IF;

  -- If we still can't determine the type, surface a clear error so the
  -- caller's silent-fail path logs something useful. Better than inserting
  -- a placeholder that pollutes telemetry.
  IF v_type IS NULL THEN
    RAISE EXCEPTION
      'log_email_attempt: cannot determine email_type (pass p_email_type or a p_notification_id whose type is in the mapping)';
  END IF;

  INSERT INTO public.notification_emails_log (
    notification_id, email_type, recipient_email, selection_id, practice_id,
    status, attempt_source, attempted_at, created_at, sent_at
  )
  VALUES (
    p_notification_id, v_type, p_recipient_email, p_selection_id, p_practice_id,
    'attempted', p_attempt_source, NOW(), NOW(), NULL
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.log_email_attempt(uuid, text, text, text, uuid, uuid) TO authenticated;
