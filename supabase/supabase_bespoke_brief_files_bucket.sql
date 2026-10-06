-- =====================================================================
-- Bespoke form revamp — Phase 0.3
-- Storage bucket for bespoke brief uploads (content copy, imagery,
-- design examples).
--
-- PUBLIC bucket (unlike bug-attachments) because the design team opens
-- these files from Trello cards outside the app — a durable public URL
-- is needed there, and signed URLs would expire. Paths are UUID-based
-- (unguessable); contents are the practice's own marketing brief assets
-- (low sensitivity). 25 MB/file, images + PDF + Office docs.
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bespoke-brief-files', 'bespoke-brief-files', true, 26214400,  -- 25 MB
  ARRAY[
    'image/png','image/jpeg','image/jpg','image/gif','image/webp','image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 26214400,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS on objects in this bucket.
-- INSERT: any authenticated user (practice members upload their brief files).
DROP POLICY IF EXISTS bespoke_brief_insert_auth ON storage.objects;
CREATE POLICY bespoke_brief_insert_auth ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bespoke-brief-files');

-- SELECT: authenticated (public bucket also serves objects via public URL).
DROP POLICY IF EXISTS bespoke_brief_select_auth ON storage.objects;
CREATE POLICY bespoke_brief_select_auth ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'bespoke-brief-files');

-- DELETE: admins only (cleanup).
DROP POLICY IF EXISTS bespoke_brief_delete_admin ON storage.objects;
CREATE POLICY bespoke_brief_delete_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'bespoke-brief-files' AND public.is_admin());
