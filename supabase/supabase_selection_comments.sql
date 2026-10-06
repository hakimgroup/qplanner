-- Comments feature: per-selection conversation threads + per-user inbox.
-- Two tables (mirrors the existing notifications + notification_targets pattern).
-- 8 RPCs for the full lifecycle.

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.selection_comments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  selection_id    uuid NOT NULL REFERENCES public.selections(id) ON DELETE CASCADE,
  author_user_id  uuid NOT NULL REFERENCES public.allowed_users(id) ON DELETE SET NULL,
  body            text NOT NULL,
  edited_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT selection_comments_body_length CHECK (length(body) > 0 AND length(body) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_selection_comments_selection_created
  ON public.selection_comments (selection_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.comment_targets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  uuid NOT NULL REFERENCES public.selection_comments(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.allowed_users(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES public.practices(id) ON DELETE CASCADE,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_targets_user_unread
  ON public.comment_targets (user_id, read_at, created_at DESC);

-- ============================================================
-- 2. RLS
-- ============================================================

ALTER TABLE public.selection_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_targets    ENABLE ROW LEVEL SECURITY;

-- selection_comments: anyone with access to the selection sees the thread.
DROP POLICY IF EXISTS selection_comments_select ON public.selection_comments;
CREATE POLICY selection_comments_select
  ON public.selection_comments
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.selections s
      WHERE s.id = selection_comments.selection_id
        AND public.is_member_of(s.practice_id)
    )
  );

-- Writes are funneled through RPCs (SECURITY DEFINER). Block direct table writes.
DROP POLICY IF EXISTS selection_comments_no_direct_write ON public.selection_comments;
CREATE POLICY selection_comments_no_direct_write
  ON public.selection_comments
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- comment_targets: caller sees only their own row.
DROP POLICY IF EXISTS comment_targets_select_own ON public.comment_targets;
CREATE POLICY comment_targets_select_own
  ON public.comment_targets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS comment_targets_no_direct_write ON public.comment_targets;
CREATE POLICY comment_targets_no_direct_write
  ON public.comment_targets
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 3. RPCs
-- ============================================================

-- 3.1 add_selection_comment ----------------------------------
-- Inserts the comment, fans out to the counterpart audience, returns the
-- comment row + the count of targets created.
CREATE OR REPLACE FUNCTION public.add_selection_comment(
  p_selection_id uuid,
  p_body         text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id     uuid := auth.uid();
  v_role        text;
  v_selection   record;
  v_comment_id  uuid;
  v_targets_count int := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_body IS NULL OR length(btrim(p_body)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment body cannot be empty');
  END IF;

  IF length(p_body) > 2000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment exceeds 2000 character limit');
  END IF;

  -- Look up selection + verify access
  SELECT s.id, s.practice_id, s.status
    INTO v_selection
  FROM public.selections s
  WHERE s.id = p_selection_id;

  IF v_selection IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Selection not found');
  END IF;

  IF v_selection.status = 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot comment on a draft selection');
  END IF;

  -- Role of the author (drives audience routing)
  SELECT role INTO v_role
  FROM public.allowed_users
  WHERE id = v_user_id;

  IF v_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Author not in allowed_users');
  END IF;

  -- Access check: admins can comment on any non-completed selection;
  -- practice users must be a member of the selection's practice.
  IF v_role IN ('admin', 'super_admin') THEN
    -- Admins blocked from completed-stage commentary? Spec says "active campaign"
    -- but we allow on every status except draft for both sides. Keep parity.
    NULL;
  ELSE
    IF NOT public.is_member_of(v_selection.practice_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'You do not have access to this practice');
    END IF;
  END IF;

  -- Insert the comment
  INSERT INTO public.selection_comments (selection_id, author_user_id, body)
  VALUES (p_selection_id, v_user_id, p_body)
  RETURNING id INTO v_comment_id;

  -- Fan out targets to the counterpart audience.
  -- Author themselves is always excluded.
  IF v_role IN ('admin', 'super_admin') THEN
    -- Admin commenting → notify practice user-members of this practice.
    INSERT INTO public.comment_targets (comment_id, user_id, practice_id)
    SELECT v_comment_id, pm.user_id, v_selection.practice_id
    FROM public.practice_members pm
    JOIN public.allowed_users au ON au.id = pm.user_id
    WHERE pm.practice_id = v_selection.practice_id
      AND LOWER(COALESCE(pm.role, '')) = 'user'
      AND pm.user_id IS DISTINCT FROM v_user_id
    ON CONFLICT (comment_id, user_id) DO NOTHING;
  ELSE
    -- Practice user commenting → notify practice admins of this practice + global super_admins.
    INSERT INTO public.comment_targets (comment_id, user_id, practice_id)
    SELECT DISTINCT v_comment_id, target_id, v_selection.practice_id
    FROM (
      -- Admins on this practice (practice_members with role='admin')
      SELECT pm.user_id AS target_id
      FROM public.practice_members pm
      WHERE pm.practice_id = v_selection.practice_id
        AND LOWER(COALESCE(pm.role, '')) = 'admin'
        AND pm.user_id IS NOT NULL

      UNION

      -- Global super_admins (always in the loop)
      SELECT au.id
      FROM public.allowed_users au
      WHERE au.role = 'super_admin'
        AND au.id IS NOT NULL
    ) t
    WHERE target_id IS DISTINCT FROM v_user_id
    ON CONFLICT (comment_id, user_id) DO NOTHING;
  END IF;

  GET DIAGNOSTICS v_targets_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'comment_id', v_comment_id,
    'targets_count', v_targets_count,
    'author_role', v_role
  );
END;
$$;

-- 3.2 edit_selection_comment ---------------------------------
CREATE OR REPLACE FUNCTION public.edit_selection_comment(
  p_comment_id uuid,
  p_body       text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_author  uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_body IS NULL OR length(btrim(p_body)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment body cannot be empty');
  END IF;

  IF length(p_body) > 2000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment exceeds 2000 character limit');
  END IF;

  SELECT author_user_id INTO v_author
  FROM public.selection_comments
  WHERE id = p_comment_id;

  IF v_author IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment not found');
  END IF;

  IF v_author IS DISTINCT FROM v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only edit your own comments');
  END IF;

  UPDATE public.selection_comments
  SET body = p_body, edited_at = now()
  WHERE id = p_comment_id;

  RETURN jsonb_build_object('success', true, 'comment_id', p_comment_id);
END;
$$;

-- 3.3 delete_selection_comment -------------------------------
CREATE OR REPLACE FUNCTION public.delete_selection_comment(
  p_comment_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_author  uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT author_user_id INTO v_author
  FROM public.selection_comments
  WHERE id = p_comment_id;

  IF v_author IS NULL THEN
    -- Already gone — idempotent success
    RETURN jsonb_build_object('success', true, 'comment_id', p_comment_id, 'already_deleted', true);
  END IF;

  IF v_author IS DISTINCT FROM v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only delete your own comments');
  END IF;

  DELETE FROM public.selection_comments WHERE id = p_comment_id;

  RETURN jsonb_build_object('success', true, 'comment_id', p_comment_id);
END;
$$;

-- 3.4 list_selection_comments --------------------------------
CREATE OR REPLACE FUNCTION public.list_selection_comments(
  p_selection_id uuid
)
RETURNS TABLE (
  id              uuid,
  selection_id    uuid,
  author_user_id  uuid,
  author_name     text,
  author_email    text,
  author_role     text,
  body            text,
  edited_at       timestamptz,
  created_at      timestamptz,
  is_mine         boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
#variable_conflict use_column
DECLARE
  v_user_id    uuid := auth.uid();
  v_practice   uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Access check
  SELECT s.practice_id INTO v_practice
  FROM public.selections s
  WHERE s.id = p_selection_id;

  IF v_practice IS NULL THEN
    RAISE EXCEPTION 'Selection not found';
  END IF;

  IF NOT public.is_admin()
     AND NOT public.is_super_admin()
     AND NOT public.is_member_of(v_practice)
  THEN
    RAISE EXCEPTION 'You do not have access to this selection';
  END IF;

  RETURN QUERY
  SELECT
    sc.id,
    sc.selection_id,
    sc.author_user_id,
    btrim(COALESCE(au.first_name, '') || ' ' || COALESCE(au.last_name, '')) AS author_name,
    au.email                                                                AS author_email,
    au.role                                                                 AS author_role,
    sc.body,
    sc.edited_at,
    sc.created_at,
    (sc.author_user_id = v_user_id)                                         AS is_mine
  FROM public.selection_comments sc
  LEFT JOIN public.allowed_users au ON au.id = sc.author_user_id
  WHERE sc.selection_id = p_selection_id
  ORDER BY sc.created_at ASC;
END;
$$;

-- 3.5 list_my_comment_inbox ----------------------------------
CREATE OR REPLACE FUNCTION public.list_my_comment_inbox(
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  target_id       uuid,
  comment_id      uuid,
  selection_id    uuid,
  practice_id     uuid,
  practice_name   text,
  campaign_name   text,
  is_bespoke      boolean,
  author_user_id  uuid,
  author_name     text,
  author_role     text,
  body            text,
  read_at         timestamptz,
  created_at      timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
#variable_conflict use_column
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    ct.id                                                                   AS target_id,
    sc.id                                                                   AS comment_id,
    s.id                                                                    AS selection_id,
    s.practice_id,
    p.name                                                                  AS practice_name,
    COALESCE(cc.name, bc.name)                                              AS campaign_name,
    s.bespoke                                                               AS is_bespoke,
    sc.author_user_id,
    btrim(COALESCE(au.first_name, '') || ' ' || COALESCE(au.last_name, '')) AS author_name,
    au.role                                                                 AS author_role,
    sc.body,
    ct.read_at,
    sc.created_at
  FROM public.comment_targets ct
  JOIN public.selection_comments sc ON sc.id = ct.comment_id
  JOIN public.selections s          ON s.id  = sc.selection_id
  LEFT JOIN public.practices p          ON p.id  = s.practice_id
  LEFT JOIN public.campaigns_catalog cc ON cc.id = s.campaign_id
  LEFT JOIN public.bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
  LEFT JOIN public.allowed_users au     ON au.id = sc.author_user_id
  WHERE ct.user_id = v_user_id
  ORDER BY sc.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 10), 1);
END;
$$;

-- 3.6 mark_comment_read --------------------------------------
CREATE OR REPLACE FUNCTION public.mark_comment_read(
  p_comment_id uuid
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

  UPDATE public.comment_targets
  SET read_at = now()
  WHERE comment_id = p_comment_id
    AND user_id    = v_user_id
    AND read_at IS NULL;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 3.7 mark_all_comments_read ---------------------------------
CREATE OR REPLACE FUNCTION public.mark_all_comments_read()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_count   int;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.comment_targets
  SET read_at = now()
  WHERE user_id = v_user_id
    AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'marked', v_count);
END;
$$;

-- 3.8 unread_comment_count -----------------------------------
CREATE OR REPLACE FUNCTION public.unread_comment_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::int
  FROM public.comment_targets
  WHERE user_id  = auth.uid()
    AND read_at IS NULL;
$$;

-- ============================================================
-- 4. GRANTS (RPCs run as SECURITY DEFINER; only need EXECUTE)
-- ============================================================

GRANT EXECUTE ON FUNCTION public.add_selection_comment(uuid, text)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.edit_selection_comment(uuid, text)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_selection_comment(uuid)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_selection_comments(uuid)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_comment_inbox(integer)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_comment_read(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_comments_read()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.unread_comment_count()               TO authenticated;
