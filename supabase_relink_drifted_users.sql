-- =====================================================================
-- ONE-OFF PROD DATA REPAIR (run once, PROD only — staging has different data)
--
-- Re-links `allowed_users.id` to the current `auth.users.id` for users whose
-- id drifted (their Supabase auth account was recreated, and the login-time
-- re-link in link_current_user() was blocked by the missing ON UPDATE CASCADE
-- FKs — see supabase_fix_allowed_users_id_cascade.sql, which MUST be applied
-- first).
--
-- Order matters: columns holding a user id WITHOUT an FK are remapped first,
-- while allowed_users.id still holds the OLD value. The FK-backed children
-- (comment_targets, selection_comments, bug_reports, practices_of_interest,
-- god_mode_log, practice_members, notification_emails_log,
-- practice_onboarding_emails) cascade automatically on the final UPDATE.
-- =====================================================================

BEGIN;

-- Snapshot the drift set so every statement uses the same old -> new mapping.
CREATE TEMP TABLE drift ON COMMIT DROP AS
SELECT au.id AS old_id, u.id AS new_id, au.email, u.last_sign_in_at
FROM public.allowed_users au
JOIN auth.users u ON lower(u.email) = lower(au.email)
WHERE au.id <> u.id;

SELECT count(*) AS users_to_relink FROM drift;

-- 1. Non-FK columns (these will NOT cascade) -------------------------------
UPDATE public.notification_targets t
SET user_id = d.new_id FROM drift d WHERE t.user_id = d.old_id;

UPDATE public.selections s
SET created_by = d.new_id FROM drift d WHERE s.created_by = d.old_id;

UPDATE public.selection_status_history h
SET actor_user_id = d.new_id FROM drift d WHERE h.actor_user_id = d.old_id;

UPDATE public.notifications n
SET actor_user_id = d.new_id FROM drift d WHERE n.actor_user_id = d.old_id;

-- 2. The re-link itself (FK children cascade from here) ---------------------
UPDATE public.allowed_users au
SET id = d.new_id,
    last_login = COALESCE(d.last_sign_in_at, au.last_login)
FROM drift d
WHERE au.id = d.old_id;

-- 3. Verify: should return 0 rows -----------------------------------------
SELECT count(*) AS still_mismatched
FROM public.allowed_users au
JOIN auth.users u ON lower(u.email) = lower(au.email)
WHERE au.id <> u.id;

COMMIT;
