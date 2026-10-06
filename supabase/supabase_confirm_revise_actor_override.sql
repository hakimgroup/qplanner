-- Add optional p_actor_user_id to confirm_assets and request_revision so the
-- magic-link feedback endpoints can invoke them server-side (no auth.uid()).
-- Authenticated client calls remain unchanged: auth.uid() takes precedence
-- over the override, so a logged-in user cannot impersonate someone else.

CREATE OR REPLACE FUNCTION public.confirm_assets(p_selection_id uuid, p_note text DEFAULT NULL::text, p_self_print boolean DEFAULT false, p_actor_user_id uuid DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_selection RECORD;
  v_practice RECORD;
  v_notification_id UUID;
  v_payload JSONB;
  v_recipients_json JSONB;
  v_chosen_creative_label TEXT;
BEGIN
  -- 1. Get current user
  v_user_id := COALESCE(auth.uid(), p_actor_user_id);
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Fetch the selection with related data
  SELECT
    s.*,
    COALESCE(cc.name, bc.name) AS campaign_name,
    COALESCE(cc.description, bc.description) AS campaign_description,
    COALESCE(cc.category, bc.category) AS campaign_category,
    COALESCE(cc.objectives, bc.objectives) AS campaign_objectives,
    COALESCE(cc.topics, bc.topics) AS campaign_topics,
    COALESCE(s.assets->>'creative', NULL) AS chosen_creative,
    s.markup_link,
    s.assets_link,
    bc.reference_links AS bespoke_links,
    bc.requirements    AS bespoke_requirements
  INTO v_selection
  FROM selections s
  LEFT JOIN campaigns_catalog cc ON cc.id = s.campaign_id
  LEFT JOIN bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
  WHERE s.id = p_selection_id;

  IF v_selection IS NULL THEN
    RAISE EXCEPTION 'Selection not found';
  END IF;

  -- 3. Verify access
  IF NOT public.is_admin() AND NOT EXISTS (
    SELECT 1 FROM practice_members pm
    WHERE pm.practice_id = v_selection.practice_id
      AND pm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You do not have access to this practice';
  END IF;

  -- 4. Practice info
  SELECT * INTO v_practice
  FROM practices
  WHERE id = v_selection.practice_id;

  -- 4b. Resolve the chosen creative label by walking notifications newest -> oldest
  IF v_selection.chosen_creative IS NOT NULL THEN
    SELECT elem->>'label' INTO v_chosen_creative_label
    FROM (
      SELECT n.payload->'creatives' AS arr, n.payload->>'chosen_creative_label' AS label_in_payload
      FROM public.notifications n
      WHERE n.selection_id = p_selection_id
        AND n.payload IS NOT NULL
      ORDER BY n.created_at DESC
    ) src,
    LATERAL jsonb_array_elements(COALESCE(src.arr, '[]'::jsonb)) AS elem
    WHERE elem->>'url' = v_selection.chosen_creative
    LIMIT 1;

    -- Fallback: if not found in any creatives array, try chosen_creative_label key directly
    IF v_chosen_creative_label IS NULL THEN
      SELECT n.payload->>'chosen_creative_label'
        INTO v_chosen_creative_label
      FROM public.notifications n
      WHERE n.selection_id = p_selection_id
        AND n.payload->>'chosen_creative_label' IS NOT NULL
      ORDER BY n.created_at DESC
      LIMIT 1;
    END IF;
  END IF;

  -- 5. Update selection
  UPDATE selections
  SET status = 'confirmed', self_print = p_self_print, updated_at = NOW()
  WHERE id = p_selection_id;

  -- 6. Build payload
  v_payload := jsonb_build_object(
    'name', v_selection.campaign_name,
    'description', v_selection.campaign_description,
    'category', v_selection.campaign_category,
    'from_date', v_selection.from_date,
    'to_date', v_selection.to_date,
    'note', p_note,
    'chosen_creative', v_selection.chosen_creative,
    'chosen_creative_label', v_chosen_creative_label,
    'markup_link', v_selection.markup_link,
    'assets_link', v_selection.assets_link,
    'assets', v_selection.assets,
    'is_bespoke', v_selection.bespoke,
    'campaign_id', COALESCE(v_selection.campaign_id, v_selection.bespoke_campaign_id),
    'reference_links', COALESCE(v_selection.bespoke_links, v_selection.reference_links, '[]'::jsonb),
    'original_notes', v_selection.notes,
    'requirements', v_selection.bespoke_requirements,
    'self_print', p_self_print
  );

  -- 7. Notification
  INSERT INTO notifications (
    type, selection_id, campaign_id, practice_id, actor_user_id, audience,
    title, message, payload, created_at
  )
  VALUES (
    'confirmed', p_selection_id, v_selection.campaign_id, v_selection.practice_id,
    v_user_id, 'admins',
    v_practice.name || ' confirmed assets',
    'Assets for ' || v_selection.campaign_name || ' have been confirmed by the practice.'
      || CASE WHEN p_self_print THEN ' Practice will print their own assets.' ELSE '' END,
    v_payload, NOW()
  )
  RETURNING id INTO v_notification_id;

  -- 8. Targets
  INSERT INTO notification_targets (notification_id, user_id, practice_id, created_at)
  SELECT v_notification_id, au.id, v_selection.practice_id, NOW()
  FROM allowed_users au
  WHERE au.role IN ('admin', 'super_admin') AND au.id IS NOT NULL;

  -- 9. Recipients for history
  SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'name',  NULLIF(trim(coalesce(au.first_name,'') || ' ' || coalesce(au.last_name,'')), ''),
               'email', au.email
             )
           ),
           '[]'::jsonb
         )
    INTO v_recipients_json
  FROM public.notification_targets nt
  JOIN public.allowed_users au ON au.id = nt.user_id
  WHERE nt.notification_id = v_notification_id;

  -- 10. Status history
  INSERT INTO selection_status_history (
    selection_id, from_status, to_status, actor_user_id, note, message, recipient, practice, created_at
  )
  VALUES (
    p_selection_id, v_selection.status, 'confirmed', v_user_id, p_note,
    'Practice confirmed the assets'
      || CASE WHEN p_self_print THEN ' (self-printing)' ELSE '' END,
    v_recipients_json,
    jsonb_build_object('id', v_practice.id, 'name', v_practice.name),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', v_notification_id,
    'selection_id', p_selection_id,
    'new_status', 'confirmed'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$

;

CREATE OR REPLACE FUNCTION public.request_revision(p_selection_id uuid, p_feedback text, p_actor_user_id uuid DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_selection RECORD;
  v_practice RECORD;
  v_notification_id UUID;
  v_payload JSONB;
  v_recipients_json JSONB;
  v_chosen_creative_label TEXT;
BEGIN
  IF p_feedback IS NULL OR TRIM(p_feedback) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Feedback is required');
  END IF;

  v_user_id := COALESCE(auth.uid(), p_actor_user_id);
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT
    s.*,
    COALESCE(cc.name, bc.name) AS campaign_name,
    COALESCE(cc.description, bc.description) AS campaign_description,
    COALESCE(cc.category, bc.category) AS campaign_category,
    COALESCE(s.assets->>'creative', NULL) AS chosen_creative,
    s.markup_link,
    s.assets_link,
    bc.reference_links AS bespoke_links,
    bc.requirements    AS bespoke_requirements
  INTO v_selection
  FROM selections s
  LEFT JOIN campaigns_catalog cc ON cc.id = s.campaign_id
  LEFT JOIN bespoke_campaigns bc ON bc.id = s.bespoke_campaign_id
  WHERE s.id = p_selection_id;

  IF v_selection IS NULL THEN
    RAISE EXCEPTION 'Selection not found';
  END IF;

  IF NOT public.is_admin() AND NOT EXISTS (
    SELECT 1 FROM practice_members pm
    WHERE pm.practice_id = v_selection.practice_id
      AND pm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You do not have access to this practice';
  END IF;

  SELECT * INTO v_practice
  FROM practices
  WHERE id = v_selection.practice_id;

  -- Resolve chosen creative label from existing notifications
  IF v_selection.chosen_creative IS NOT NULL THEN
    SELECT elem->>'label' INTO v_chosen_creative_label
    FROM (
      SELECT n.payload->'creatives' AS arr
      FROM public.notifications n
      WHERE n.selection_id = p_selection_id
        AND n.payload IS NOT NULL
      ORDER BY n.created_at DESC
    ) src,
    LATERAL jsonb_array_elements(COALESCE(src.arr, '[]'::jsonb)) AS elem
    WHERE elem->>'url' = v_selection.chosen_creative
    LIMIT 1;

    IF v_chosen_creative_label IS NULL THEN
      SELECT n.payload->>'chosen_creative_label'
        INTO v_chosen_creative_label
      FROM public.notifications n
      WHERE n.selection_id = p_selection_id
        AND n.payload->>'chosen_creative_label' IS NOT NULL
      ORDER BY n.created_at DESC
      LIMIT 1;
    END IF;
  END IF;

  UPDATE selections
  SET status = 'inProgress', updated_at = NOW()
  WHERE id = p_selection_id;

  v_payload := jsonb_build_object(
    'name', v_selection.campaign_name,
    'description', v_selection.campaign_description,
    'category', v_selection.campaign_category,
    'from_date', v_selection.from_date,
    'to_date', v_selection.to_date,
    'feedback', p_feedback,
    'chosen_creative', v_selection.chosen_creative,
    'chosen_creative_label', v_chosen_creative_label,
    'markup_link', v_selection.markup_link,
    'assets_link', v_selection.assets_link,
    'assets', v_selection.assets,
    'is_bespoke', v_selection.bespoke,
    'campaign_id', COALESCE(v_selection.campaign_id, v_selection.bespoke_campaign_id),
    'reference_links', COALESCE(v_selection.bespoke_links, v_selection.reference_links, '[]'::jsonb),
    'original_notes', v_selection.notes,
    'requirements', v_selection.bespoke_requirements
  );

  INSERT INTO notifications (
    type, selection_id, campaign_id, practice_id, actor_user_id, audience,
    title, message, payload, created_at
  )
  VALUES (
    'feedbackRequested', p_selection_id, v_selection.campaign_id, v_selection.practice_id,
    v_user_id, 'admins',
    v_practice.name || ' requested changes',
    'Revision requested for ' || v_selection.campaign_name || ': ' || LEFT(p_feedback, 100),
    v_payload, NOW()
  )
  RETURNING id INTO v_notification_id;

  INSERT INTO notification_targets (notification_id, user_id, practice_id, created_at)
  SELECT v_notification_id, au.id, v_selection.practice_id, NOW()
  FROM allowed_users au
  WHERE au.role IN ('admin', 'super_admin') AND au.id IS NOT NULL;

  SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'name',  NULLIF(trim(coalesce(au.first_name,'') || ' ' || coalesce(au.last_name,'')), ''),
               'email', au.email
             )
           ),
           '[]'::jsonb
         )
    INTO v_recipients_json
  FROM public.notification_targets nt
  JOIN public.allowed_users au ON au.id = nt.user_id
  WHERE nt.notification_id = v_notification_id;

  INSERT INTO selection_status_history (
    selection_id, from_status, to_status, actor_user_id, note, message, recipient, practice, created_at
  )
  VALUES (
    p_selection_id, v_selection.status, 'inProgress', v_user_id, p_feedback,
    'Practice requested revisions',
    v_recipients_json,
    jsonb_build_object('id', v_practice.id, 'name', v_practice.name),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', v_notification_id,
    'selection_id', p_selection_id,
    'new_status', 'inProgress'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$

;
