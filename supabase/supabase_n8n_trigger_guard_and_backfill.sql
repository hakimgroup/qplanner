-- Narrow the n8n webhook trigger + backfill the 111 selections whose status
-- was silently overwritten from 'confirmed' to 'completed' by the n8n workflow.
--
-- Background: the `n8n` trigger on notifications was firing on every INSERT OR
-- UPDATE, regardless of notification type. n8n was originally written to react
-- only to `inProgress` notifications (its job is to advance them to
-- `awaitingApproval` once artwork is ready), but the unfiltered webhook caused
-- it to also react to `confirmed` (and others) and silently set
-- selections.status='completed' without touching updated_at or writing to
-- selection_status_history.

BEGIN;

-- 1. Replace the trigger with a narrowed version: INSERT only.
--    Allowed types: 'inProgress' (artwork pickup) and 'feedbackRequested'
--    (Airtable + Trello status update with practice's revision comment).
--    Other types (confirmed, awaitingApproval, requested, actor types) stay
--    filtered because n8n's workflow misbehaved on them (defaulted to
--    status='completed') — see the May 26 investigation.
DROP TRIGGER IF EXISTS n8n ON public.notifications;

CREATE TRIGGER n8n
AFTER INSERT ON public.notifications
FOR EACH ROW
WHEN (NEW.type IN ('inProgress', 'feedbackRequested'))
EXECUTE FUNCTION supabase_functions.http_request(
  'https://hakimgroup.app.n8n.cloud/webhook/86eed194-4a80-4cf2-821d-f73cd8d9afe8',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

-- 2. Build the affected set: status='completed', to_date still in the future,
--    and the most recent status_history entry says the legitimate status is
--    something other than 'completed' (in practice always 'confirmed').
CREATE TEMP TABLE affected_selections AS
SELECT s.id, lh.to_status AS restore_to
FROM public.selections s
JOIN LATERAL (
  SELECT to_status, created_at
  FROM public.selection_status_history h
  WHERE h.selection_id = s.id
  ORDER BY h.created_at DESC
  LIMIT 1
) lh ON true
WHERE s.status = 'completed'
  AND s.to_date >= current_date
  AND lh.to_status <> 'completed';

-- 3. Restore status. Leave updated_at untouched so the original confirm time stays accurate.
UPDATE public.selections s
SET status = a.restore_to
FROM affected_selections a
WHERE s.id = a.id;

-- 4. Audit entry per restored row.
INSERT INTO public.selection_status_history
  (selection_id, from_status, to_status, actor_user_id, note, created_at, god_mode)
SELECT
  a.id,
  'completed',
  a.restore_to,
  '00000000-0000-0000-0000-000000000000',
  'Auto-restored: status was silently overwritten by n8n webhook after confirm. Trigger now scoped to inProgress notifications only.',
  now(),
  false
FROM affected_selections a;

-- 5. Sanity check: post-restore counts.
SELECT
  (SELECT count(*) FROM affected_selections)                                                   AS rows_restored,
  (SELECT count(*) FROM public.selections WHERE status='completed' AND to_date >= current_date) AS still_bad;

COMMIT;
