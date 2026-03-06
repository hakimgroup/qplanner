-- Step 1: Make selection_id nullable and change FK to SET NULL
-- This preserves history rows when selections are deleted
ALTER TABLE public.selection_status_history
  ALTER COLUMN selection_id DROP NOT NULL;

ALTER TABLE public.selection_status_history
  DROP CONSTRAINT selection_status_history_selection_id_fkey,
  ADD CONSTRAINT selection_status_history_selection_id_fkey
    FOREIGN KEY (selection_id) REFERENCES public.selections(id)
    ON DELETE SET NULL;

-- Step 2: Update the RLS policy to allow viewing rows with null selection_id (deleted campaigns)
-- Admins should see all history; practice members see their own practice's history
DROP POLICY IF EXISTS "read history for my practice or admin" ON public.selection_status_history;

CREATE POLICY "read history for my practice or admin" ON public.selection_status_history
  FOR SELECT TO authenticated
  USING (
    is_super_admin()
    OR is_admin()
    OR (
      selection_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM selections s
        WHERE s.id = selection_status_history.selection_id
          AND is_member_of(s.practice_id)
      )
    )
    OR (
      selection_id IS NULL
      AND practice IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM practice_members pm
        WHERE pm.practice_id = (practice->>'id')::uuid
          AND pm.user_id = auth.uid()
      )
    )
  );

-- Step 3: Update the delete_selection RPC to log communication history
DROP FUNCTION IF EXISTS public.delete_selection(uuid);

CREATE OR REPLACE FUNCTION public.delete_selection(p_selection_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sel record;
  v_practice record;
  v_campaign_name text;
  v_recipients_json jsonb;
BEGIN
  -- Load the selection
  SELECT *
    INTO v_sel
  FROM public.selections
  WHERE id = p_selection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selection % not found', p_selection_id;
  END IF;

  -- Permission check: admin OR member of the selection's practice
  IF NOT (public.is_admin() OR public.is_member_of(v_sel.practice_id)) THEN
    RAISE EXCEPTION 'Not authorized to archive/delete this selection';
  END IF;

  -- Get practice info
  SELECT id, name
    INTO v_practice
  FROM public.practices
  WHERE id = v_sel.practice_id;

  -- Get campaign name
  IF v_sel.bespoke_campaign_id IS NOT NULL THEN
    SELECT name INTO v_campaign_name
    FROM public.bespoke_campaigns
    WHERE id = v_sel.bespoke_campaign_id;
  ELSIF v_sel.campaign_id IS NOT NULL THEN
    SELECT name INTO v_campaign_name
    FROM public.campaigns_catalog
    WHERE id = v_sel.campaign_id;
  END IF;

  v_campaign_name := COALESCE(v_campaign_name, 'Campaign');

  -- Build recipients: practice admins + super admins
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object('name', sub.full_name, 'email', sub.email)
  ), '[]'::jsonb)
  INTO v_recipients_json
  FROM (
    SELECT DISTINCT ON (au.email)
      TRIM(COALESCE(au.first_name, '') || ' ' || COALESCE(au.last_name, '')) AS full_name,
      au.email
    FROM public.practice_members pm
    JOIN public.allowed_users au ON au.id = pm.user_id
    WHERE pm.practice_id = v_sel.practice_id
      AND pm.role = 'admin'
      AND au.id IS NOT NULL
    UNION
    SELECT
      TRIM(COALESCE(au.first_name, '') || ' ' || COALESCE(au.last_name, '')) AS full_name,
      au.email
    FROM public.allowed_users au
    WHERE au.role = 'super_admin'
  ) sub;

  -- 1) Insert into archive
  INSERT INTO public.archived_selections
  SELECT s.*
  FROM public.selections s
  WHERE s.id = p_selection_id;

  -- 2) Force archived status to 'onPlan'
  UPDATE public.archived_selections
     SET status = 'onPlan'
   WHERE id = p_selection_id;

  -- 3) Delete from live table (FK will SET NULL on history rows)
  DELETE FROM public.selections
   WHERE id = p_selection_id;

  -- 4) Log to communication history AFTER delete (selection_id = NULL since it's deleted)
  INSERT INTO public.selection_status_history
    (selection_id, from_status, to_status, actor_user_id, message, recipient, practice)
  VALUES (
    NULL,
    v_sel.status,
    'deleted',
    auth.uid(),
    '"' || v_campaign_name || '" was removed from ' || COALESCE(v_practice.name, 'the practice') || '''s plan.',
    v_recipients_json,
    jsonb_build_object('id', v_practice.id, 'name', v_practice.name)
  );

  RETURN jsonb_build_object(
    'id', p_selection_id,
    'archived', true,
    'deleted',  true
  );
END;
$function$;
