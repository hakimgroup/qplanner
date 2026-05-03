-- copy_practice_campaigns_v2 (catalog-only)
-- Bespoke campaigns are inherently per-practice (custom briefs) — cloning them
-- across practices doesn't model anything real, and historically the copy was
-- pulling in invisible orphan bespoke_campaigns. This variant copies ONLY
-- catalog selections from source to target.
--
-- Catalog rows with a chosen creative on source → cloned at 'inProgress' (with notification).
-- Catalog rows without a chosen creative → cloned at 'draft' (silent, practice configures + submits).

CREATE OR REPLACE FUNCTION public.copy_practice_campaigns_v2(p_source text, p_target text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_src uuid := p_source::uuid;
  v_dst uuid := p_target::uuid;
  sel record;
  new_selection_id uuid;
  copied_selections int := 0;

  v_practice record;
  v_chosen_url text;
  v_chosen_label text;
  v_payload jsonb;
  v_notification_id uuid;
  v_practice_admins uuid[];
  v_global_supers uuid[];
  v_target_users uuid[];
  v_actor uuid := auth.uid();
BEGIN
  IF NOT (
    auth.role() = 'service_role'
    OR public.is_admin()
    OR (public.is_member_of(v_src) AND public.is_member_of(v_dst))
  ) THEN
    RAISE EXCEPTION 'Not authorized to copy between these practices';
  END IF;

  SELECT * INTO v_practice FROM public.practices WHERE id = v_dst;

  SELECT COALESCE(array_agg(pm.user_id), '{}') INTO v_practice_admins
  FROM public.practice_members pm
  WHERE pm.practice_id = v_dst AND LOWER(COALESCE(pm.role, '')) = 'admin';
  SELECT COALESCE(array_agg(au.id), '{}') INTO v_global_supers
  FROM public.allowed_users au WHERE LOWER(COALESCE(au.role, '')) = 'super_admin';
  v_target_users := COALESCE(v_practice_admins, '{}') || COALESCE(v_global_supers, '{}');

  -- Catalog campaigns only. Bespoke campaigns/events are intentionally NOT cloned.
  FOR sel IN
    SELECT s.* FROM public.selections s
    WHERE s.practice_id = v_src AND s.campaign_id IS NOT NULL
  LOOP
    IF EXISTS (
      SELECT 1 FROM public.selections t
      WHERE t.practice_id = v_dst AND t.campaign_id = sel.campaign_id
    ) THEN
      CONTINUE;
    END IF;

    v_chosen_url := sel.assets->>'creative';

    INSERT INTO public.selections (
      practice_id, campaign_id, created_by, assets, reference_links,
      source, from_date, to_date, status, notes, bespoke, bespoke_campaign_id
    )
    VALUES (
      v_dst, sel.campaign_id, sel.created_by, sel.assets, sel.reference_links,
      'copied', sel.from_date, sel.to_date,
      CASE WHEN v_chosen_url IS NOT NULL THEN 'inProgress' ELSE 'draft' END,
      sel.notes, sel.bespoke, NULL
    )
    RETURNING id INTO new_selection_id;
    copied_selections := copied_selections + 1;

    -- Only fire notification + status history when going to inProgress.
    -- Drafts are practice-only and silent until the practice submits them.
    IF v_chosen_url IS NOT NULL THEN
      SELECT elem->>'label' INTO v_chosen_label
      FROM public.campaigns_catalog c,
           LATERAL jsonb_array_elements(COALESCE(c.creatives, '[]'::jsonb)) AS elem
      WHERE c.id = sel.campaign_id AND elem->>'url' = v_chosen_url
      LIMIT 1;

      v_payload := jsonb_build_object(
        'name', (SELECT name FROM public.campaigns_catalog WHERE id = sel.campaign_id),
        'category', (SELECT category FROM public.campaigns_catalog WHERE id = sel.campaign_id),
        'description', (SELECT description FROM public.campaigns_catalog WHERE id = sel.campaign_id),
        'tier', (SELECT tier FROM public.campaigns_catalog WHERE id = sel.campaign_id),
        'from_date', sel.from_date, 'to_date', sel.to_date,
        'campaign_id', sel.campaign_id, 'bespoke_id', NULL, 'is_bespoke', false,
        'chosen_creative', v_chosen_url, 'chosen_creative_label', v_chosen_label,
        'assets', sel.assets,
        'creatives', COALESCE((SELECT creatives FROM public.campaigns_catalog WHERE id = sel.campaign_id), '[]'::jsonb),
        'note', sel.notes,
        'reference_links', COALESCE(sel.reference_links, '[]'::jsonb),
        'original_notes', sel.notes, 'requirements', NULL,
        'copied_from', v_src
      );

      INSERT INTO public.notifications (
        type, selection_id, campaign_id, practice_id, actor_user_id,
        audience, title, message, payload
      )
      VALUES (
        'inProgress', new_selection_id, sel.campaign_id, v_dst, v_actor,
        'admins', 'Assets submitted (copied)',
        'Practice copied a campaign with asset choices from another practice.',
        v_payload
      )
      RETURNING id INTO v_notification_id;

      IF cardinality(v_target_users) > 0 THEN
        INSERT INTO public.notification_targets (notification_id, user_id, practice_id)
        SELECT DISTINCT v_notification_id, uid, v_dst
        FROM unnest(v_target_users) AS t(uid)
        ON CONFLICT DO NOTHING;
      END IF;

      INSERT INTO public.selection_status_history (
        selection_id, from_status, to_status, actor_user_id, message, practice
      )
      VALUES (
        new_selection_id, NULL, 'inProgress', v_actor,
        'Selection copied from another practice with asset choices.',
        jsonb_build_object('id', v_dst, 'name', v_practice.name)
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'copied_selections', copied_selections,
    'copied_bespoke_campaigns', 0
  );
END;
$$;
