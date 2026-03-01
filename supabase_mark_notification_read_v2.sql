-- mark_notification_read v2: Upsert instead of UPDATE-only
-- This allows admins viewing practice notifications (who don't have
-- notification_targets rows) to mark them as read by inserting a new row.

DROP FUNCTION IF EXISTS public.mark_notification_read(uuid);

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_practice_id uuid;
BEGIN
  -- Get the practice_id from the notification (needed for INSERT)
  SELECT n.practice_id INTO v_practice_id
  FROM public.notifications n
  WHERE n.id = p_notification_id;

  -- Upsert: update if exists, insert if not
  INSERT INTO public.notification_targets (notification_id, user_id, practice_id, read_at)
  VALUES (p_notification_id, auth.uid(), COALESCE(v_practice_id, '00000000-0000-0000-0000-000000000000'::uuid), NOW())
  ON CONFLICT (notification_id, user_id)
  DO UPDATE SET read_at = NOW()
  WHERE public.notification_targets.read_at IS NULL;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid) TO anon, authenticated, service_role;
