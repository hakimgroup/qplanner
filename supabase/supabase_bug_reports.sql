-- =====================================================================
-- Bug Reports feature: private storage bucket + bug_reports table + RPCs.
-- Admins (role in admin/super_admin, via public.is_admin()) can create
-- reports with attachments, view the ticket tracker, and close/reopen tickets.
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Private storage bucket for attachments (images / video / files)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('bug-attachments', 'bug-attachments', false, 104857600)  -- 100 MB cap
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = 104857600;

-- Storage RLS: only admins may upload / read / delete objects in this bucket.
-- Reads matter because the client mints signed URLs (createSignedUrl needs SELECT).
DROP POLICY IF EXISTS bug_attachments_insert_admin ON storage.objects;
CREATE POLICY bug_attachments_insert_admin ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bug-attachments' AND public.is_admin());

DROP POLICY IF EXISTS bug_attachments_select_admin ON storage.objects;
CREATE POLICY bug_attachments_select_admin ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'bug-attachments' AND public.is_admin());

DROP POLICY IF EXISTS bug_attachments_delete_admin ON storage.objects;
CREATE POLICY bug_attachments_delete_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'bug-attachments' AND public.is_admin());

-- ---------------------------------------------------------------------
-- 2. bug_reports table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  description    text NOT NULL,
  severity       text NOT NULL DEFAULT 'medium'
                   CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status         text NOT NULL DEFAULT 'open'
                   CHECK (status IN ('open', 'closed')),
  -- [{ path, name, type, size }]
  attachments    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by     uuid REFERENCES public.allowed_users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  closed_by      uuid REFERENCES public.allowed_users(id) ON DELETE SET NULL,
  closed_at      timestamptz,
  resolution_note text
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status_created
  ON public.bug_reports (status, created_at DESC);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Reads happen via list_bug_reports (SECURITY DEFINER); this policy is a
-- convenience for any direct admin read. Writes go through the RPCs only.
DROP POLICY IF EXISTS bug_reports_select_admin ON public.bug_reports;
CREATE POLICY bug_reports_select_admin ON public.bug_reports
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS bug_reports_no_direct_write ON public.bug_reports;
CREATE POLICY bug_reports_no_direct_write ON public.bug_reports
  FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------
-- 3. RPCs
-- ---------------------------------------------------------------------

-- 3.1 create_bug_report
CREATE OR REPLACE FUNCTION public.create_bug_report(
  p_title       text,
  p_description text,
  p_severity    text DEFAULT 'medium',
  p_attachments jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_id      uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admins only');
  END IF;
  IF p_title IS NULL OR length(btrim(p_title)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Title is required');
  END IF;
  IF p_description IS NULL OR length(btrim(p_description)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Description is required');
  END IF;
  IF COALESCE(p_severity, 'medium') NOT IN ('low', 'medium', 'high', 'critical') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid severity');
  END IF;

  INSERT INTO public.bug_reports (title, description, severity, attachments, created_by)
  VALUES (
    p_title,
    p_description,
    COALESCE(p_severity, 'medium'),
    COALESCE(p_attachments, '[]'::jsonb),
    v_user_id
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 3.2 list_bug_reports
CREATE OR REPLACE FUNCTION public.list_bug_reports(
  p_status text DEFAULT NULL  -- 'open' | 'closed' | NULL (all)
)
RETURNS TABLE (
  id              uuid,
  title           text,
  description     text,
  severity        text,
  status          text,
  attachments     jsonb,
  created_by      uuid,
  created_by_name text,
  created_at      timestamptz,
  closed_by       uuid,
  closed_by_name  text,
  closed_at       timestamptz,
  resolution_note text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admins only';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.description,
    b.severity,
    b.status,
    b.attachments,
    b.created_by,
    btrim(COALESCE(cu.first_name, '') || ' ' || COALESCE(cu.last_name, '')) AS created_by_name,
    b.created_at,
    b.closed_by,
    btrim(COALESCE(xu.first_name, '') || ' ' || COALESCE(xu.last_name, '')) AS closed_by_name,
    b.closed_at,
    b.resolution_note
  FROM public.bug_reports b
  LEFT JOIN public.allowed_users cu ON cu.id = b.created_by
  LEFT JOIN public.allowed_users xu ON xu.id = b.closed_by
  WHERE (p_status IS NULL OR b.status = p_status)
  ORDER BY
    CASE b.status WHEN 'open' THEN 0 ELSE 1 END,   -- open first
    b.created_at DESC;
END;
$$;

-- 3.3 close_bug_report
CREATE OR REPLACE FUNCTION public.close_bug_report(
  p_id             uuid,
  p_resolution_note text DEFAULT NULL
)
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

  UPDATE public.bug_reports
  SET status = 'closed',
      closed_by = v_user_id,
      closed_at = now(),
      resolution_note = p_resolution_note
  WHERE id = p_id AND status <> 'closed';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ticket not found or already closed');
  END IF;

  RETURN jsonb_build_object('success', true, 'id', p_id);
END;
$$;

-- 3.4 reopen_bug_report
CREATE OR REPLACE FUNCTION public.reopen_bug_report(
  p_id uuid
)
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

  UPDATE public.bug_reports
  SET status = 'open',
      closed_by = NULL,
      closed_at = NULL,
      resolution_note = NULL
  WHERE id = p_id AND status = 'closed';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ticket not found or already open');
  END IF;

  RETURN jsonb_build_object('success', true, 'id', p_id);
END;
$$;

-- ---------------------------------------------------------------------
-- 4. Grants
-- ---------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.create_bug_report(text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_bug_reports(text)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_bug_report(uuid, text)               TO authenticated;
GRANT EXECUTE ON FUNCTION public.reopen_bug_report(uuid)                    TO authenticated;
