-- =====================================================================
-- FIX: "Author not in allowed_users" — practices can't post comments.
--
-- ROOT CAUSE
-- `allowed_users.id` is deliberately MUTABLE: `link_current_user()` rewrites
-- it to `auth.uid()` on login (needed when a user's Supabase auth account is
-- recreated and they get a new auth id). The original schema supports this —
-- notification_emails_log / practice_members / practice_onboarding_emails all
-- declare their FKs with ON UPDATE CASCADE.
--
-- FKs added by later features (comments, bug reports, POI, god mode) omitted
-- ON UPDATE CASCADE. Once a user had e.g. a `comment_targets` row, the id
-- rewrite in link_current_user raised a foreign-key violation, the function
-- aborted, and `allowed_users.id` stayed pinned to the OLD auth id forever.
--
-- Downstream symptom: `add_selection_comment` resolves the author with
--   SELECT role FROM allowed_users WHERE id = auth.uid()
-- which then finds nothing -> "Author not in allowed_users". The practice can
-- still SEE the thread (fetched by selection_id) but can never post.
--
-- FIX: bring these 6 FKs in line with the schema's intent (ON UPDATE CASCADE),
-- so the login-time re-link succeeds and self-heals drifted users.
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- (The one-off data re-link for already-drifted users is a separate,
--  PROD-only script — see supabase_relink_drifted_users.sql)
-- =====================================================================

-- comments
ALTER TABLE public.comment_targets
  DROP CONSTRAINT IF EXISTS comment_targets_user_id_fkey;
ALTER TABLE public.comment_targets
  ADD CONSTRAINT comment_targets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.allowed_users(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.selection_comments
  DROP CONSTRAINT IF EXISTS selection_comments_author_user_id_fkey;
ALTER TABLE public.selection_comments
  ADD CONSTRAINT selection_comments_author_user_id_fkey
  FOREIGN KEY (author_user_id) REFERENCES public.allowed_users(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- bug reports
ALTER TABLE public.bug_reports
  DROP CONSTRAINT IF EXISTS bug_reports_created_by_fkey;
ALTER TABLE public.bug_reports
  ADD CONSTRAINT bug_reports_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.allowed_users(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE public.bug_reports
  DROP CONSTRAINT IF EXISTS bug_reports_closed_by_fkey;
ALTER TABLE public.bug_reports
  ADD CONSTRAINT bug_reports_closed_by_fkey
  FOREIGN KEY (closed_by) REFERENCES public.allowed_users(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- practices of interest
ALTER TABLE public.practices_of_interest
  DROP CONSTRAINT IF EXISTS practices_of_interest_user_id_fkey;
ALTER TABLE public.practices_of_interest
  ADD CONSTRAINT practices_of_interest_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.allowed_users(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

-- god mode audit log
ALTER TABLE public.god_mode_log
  DROP CONSTRAINT IF EXISTS god_mode_log_actor_user_id_fkey;
ALTER TABLE public.god_mode_log
  ADD CONSTRAINT god_mode_log_actor_user_id_fkey
  FOREIGN KEY (actor_user_id) REFERENCES public.allowed_users(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- Verify: every FK referencing allowed_users should now be ON UPDATE CASCADE
SELECT c.conname, src.relname AS child_table,
       CASE c.confupdtype WHEN 'c' THEN 'CASCADE' ELSE 'NOT CASCADE <-- PROBLEM' END AS on_update
FROM pg_constraint c
JOIN pg_class src ON src.oid = c.conrelid
JOIN pg_class tgt ON tgt.oid = c.confrelid
WHERE c.contype = 'f' AND tgt.relname = 'allowed_users'
ORDER BY on_update, src.relname;
