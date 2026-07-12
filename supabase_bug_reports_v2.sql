-- Bug reports v2: raise the attachment size cap (screen recordings are large)
-- and add a delete RPC. Apply to STAGING first, then PROD. Idempotent.
--
-- NOTE: the bucket limit is capped by the project-wide "Upload file size limit"
-- (Supabase Dashboard → Project Settings → Storage). Raise that to match
-- (>= 200 MB) on BOTH staging and prod, otherwise large uploads still fail.

UPDATE storage.buckets
SET file_size_limit = 209715200  -- 200 MB
WHERE id = 'bug-attachments';

CREATE OR REPLACE FUNCTION public.delete_bug_report(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admins only');
  END IF;

  DELETE FROM public.bug_reports WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ticket not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_bug_report(uuid) TO authenticated;
