-- =====================================================================
-- Track when the practice opens the markup link from the awaiting-approval
-- modal. Drives admin visibility into "stuck after view" cases and is the
-- foundation for the 3-day reminder email in PR 2.
--
-- Apply to STAGING first via psql, verify, then to PROD.
-- Idempotent.
-- =====================================================================

-- 1. Column on selections — null until the practice first opens the markup.
ALTER TABLE public.selections
  ADD COLUMN IF NOT EXISTS markup_opened_at timestamptz;

COMMENT ON COLUMN public.selections.markup_opened_at IS
  'When the practice user first opened the markup link from the awaitingApproval modal. Stays null until they click. Drives the feedback-reminder cron and admin "stuck after view" indicator.';

-- 2. Index for the cron query (find selections at awaitingApproval with
--    markup_opened_at in a date range, no later decision recorded).
CREATE INDEX IF NOT EXISTS idx_selections_markup_opened_at
  ON public.selections (markup_opened_at)
  WHERE markup_opened_at IS NOT NULL;

-- 3. RPC — record the open event.
--
--    Behaviour:
--    - Only the practice's user-role members or admins can record it for now.
--    - Idempotent: first call sets the timestamp, subsequent calls leave it
--      alone (we want "first opened at", not "most recently opened at").
--    - Returns the timestamp regardless, so the client can rely on it being
--      populated after a successful call.
CREATE OR REPLACE FUNCTION public.record_markup_opened(
  p_selection_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_practice  uuid;
  v_status    text;
  v_opened_at timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT s.practice_id, s.status INTO v_practice, v_status
  FROM public.selections s
  WHERE s.id = p_selection_id;

  IF v_practice IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Selection not found');
  END IF;

  -- Access check: admin/super_admin OR member of the practice.
  IF NOT public.is_admin()
     AND NOT public.is_super_admin()
     AND NOT public.is_member_of(v_practice)
  THEN
    RETURN jsonb_build_object('success', false, 'error', 'No access to this selection');
  END IF;

  -- Idempotent: only set on first call. Subsequent calls return the existing value.
  UPDATE public.selections
  SET markup_opened_at = now()
  WHERE id = p_selection_id
    AND markup_opened_at IS NULL
  RETURNING markup_opened_at INTO v_opened_at;

  IF v_opened_at IS NULL THEN
    SELECT markup_opened_at INTO v_opened_at
    FROM public.selections
    WHERE id = p_selection_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'opened_at', v_opened_at,
    'first_open', (v_opened_at = (
      SELECT markup_opened_at FROM public.selections WHERE id = p_selection_id
    ))
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_markup_opened(uuid) TO authenticated;
