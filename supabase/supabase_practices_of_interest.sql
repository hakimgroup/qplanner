-- Practices of Interest
-- Per-user list of practices a super-admin "watches". When the admin toggles
-- view mode to POI, every practice-aware admin screen scopes its data to
-- this list (hard scope — non-POI practices disappear from filter dropdowns
-- and tables everywhere except the practices directory).
--
-- Many-to-many: a user can watch many practices, a practice can be on many
-- users' lists. RLS limits each user to managing their own rows.

CREATE TABLE IF NOT EXISTS public.practices_of_interest (
  user_id     uuid NOT NULL REFERENCES public.allowed_users(id) ON DELETE CASCADE,
  practice_id uuid NOT NULL REFERENCES public.practices(id)     ON DELETE CASCADE,
  added_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, practice_id)
);

CREATE INDEX IF NOT EXISTS idx_poi_user ON public.practices_of_interest (user_id);
CREATE INDEX IF NOT EXISTS idx_poi_practice ON public.practices_of_interest (practice_id);

-- RLS — only the row's owner (super-admin) can read/write their POI
ALTER TABLE public.practices_of_interest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS poi_select_own ON public.practices_of_interest;
CREATE POLICY poi_select_own ON public.practices_of_interest
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS poi_insert_own ON public.practices_of_interest;
CREATE POLICY poi_insert_own ON public.practices_of_interest
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS poi_delete_own ON public.practices_of_interest;
CREATE POLICY poi_delete_own ON public.practices_of_interest
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================
-- RPC: list_practices_of_interest
-- Returns the caller's POI list joined with practice details.
-- =============================================================
CREATE OR REPLACE FUNCTION public.list_practices_of_interest()
RETURNS TABLE(
  practice_id uuid,
  practice_name text,
  address text,
  post_code text,
  added_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.id          AS practice_id,
    p.name        AS practice_name,
    p.address     AS address,
    p.post_code   AS post_code,
    poi.added_at  AS added_at
  FROM public.practices_of_interest poi
  JOIN public.practices p ON p.id = poi.practice_id
  WHERE poi.user_id = auth.uid()
  ORDER BY p.name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.list_practices_of_interest() TO authenticated;

-- =============================================================
-- RPC: add_practice_of_interest (idempotent)
-- Only super-admins should be calling this; gated by role check.
-- =============================================================
CREATE OR REPLACE FUNCTION public.add_practice_of_interest(p_practice_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_role text;
BEGIN
  SELECT LOWER(COALESCE(role, '')) INTO v_role
  FROM public.allowed_users WHERE id = v_actor;

  IF v_role <> 'super_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'super_admin only');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.practices WHERE id = p_practice_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'practice not found');
  END IF;

  INSERT INTO public.practices_of_interest (user_id, practice_id)
  VALUES (v_actor, p_practice_id)
  ON CONFLICT (user_id, practice_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'practice_id', p_practice_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_practice_of_interest(uuid) TO authenticated;

-- =============================================================
-- RPC: remove_practice_of_interest
-- =============================================================
CREATE OR REPLACE FUNCTION public.remove_practice_of_interest(p_practice_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_role text;
  v_deleted int;
BEGIN
  SELECT LOWER(COALESCE(role, '')) INTO v_role
  FROM public.allowed_users WHERE id = v_actor;

  IF v_role <> 'super_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'super_admin only');
  END IF;

  DELETE FROM public.practices_of_interest
  WHERE user_id = v_actor AND practice_id = p_practice_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'removed', v_deleted);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_practice_of_interest(uuid) TO authenticated;
