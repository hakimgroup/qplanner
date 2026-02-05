-- confirm_assets v2: adds reference_links, original_notes, requirements to notification payload
CREATE OR REPLACE FUNCTION public.confirm_assets(
  p_selection_id uuid,
  p_note text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_selection RECORD;
  v_campaign RECORD;
  v_practice RECORD;
  v_notification_id UUID;
  v_payload JSONB;
BEGIN
  -- 1. Get current user
  v_user_id := auth.uid();
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

  -- 3. Verify user has access to this practice
  IF NOT EXISTS (
    SELECT 1 FROM practice_members pm
    WHERE pm.practice_id = v_selection.practice_id
      AND pm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You do not have access to this practice';
  END IF;

  -- 4. Fetch practice info
  SELECT * INTO v_practice
  FROM practices
  WHERE id = v_selection.practice_id;

  -- 5. Update selection status to 'confirmed'
  UPDATE selections
  SET
    status = 'confirmed',
    updated_at = NOW()
  WHERE id = p_selection_id;

  -- 6. Log the status transition
  INSERT INTO selection_status_history (
    selection_id,
    from_status,
    to_status,
    actor_user_id,
    note,
    message,
    practice,
    created_at
  ) VALUES (
    p_selection_id,
    v_selection.status,
    'confirmed',
    v_user_id,
    p_note,
    'Practice confirmed the assets',
    jsonb_build_object('id', v_practice.id, 'name', v_practice.name),
    NOW()
  );

  -- 7. Build notification payload
  v_payload := jsonb_build_object(
    'name', v_selection.campaign_name,
    'description', v_selection.campaign_description,
    'category', v_selection.campaign_category,
    'from_date', v_selection.from_date,
    'to_date', v_selection.to_date,
    'note', p_note,
    'chosen_creative', v_selection.chosen_creative,
    'markup_link', v_selection.markup_link,
    'assets_link', v_selection.assets_link,
    'assets', v_selection.assets,
    'is_bespoke', v_selection.bespoke,
    'campaign_id', COALESCE(v_selection.campaign_id, v_selection.bespoke_campaign_id),
    'reference_links', COALESCE(v_selection.bespoke_links, v_selection.reference_links, '[]'::jsonb),
    'original_notes', v_selection.notes,
    'requirements', v_selection.bespoke_requirements
  );

  -- 8. Create notification for admins
  INSERT INTO notifications (
    type,
    selection_id,
    campaign_id,
    practice_id,
    actor_user_id,
    audience,
    title,
    message,
    payload,
    created_at
  ) VALUES (
    'confirmed',
    p_selection_id,
    COALESCE(v_selection.campaign_id, v_selection.bespoke_campaign_id),
    v_selection.practice_id,
    v_user_id,
    'admins',
    v_practice.name || ' confirmed assets',
    'Assets for ' || v_selection.campaign_name || ' have been confirmed by the practice.',
    v_payload,
    NOW()
  )
  RETURNING id INTO v_notification_id;

  -- 9. Create notification_targets for all admins
  INSERT INTO notification_targets (notification_id, user_id, practice_id, created_at)
  SELECT
    v_notification_id,
    au.id,
    v_selection.practice_id,
    NOW()
  FROM allowed_users au
  WHERE au.role IN ('admin', 'super_admin')
    AND au.id IS NOT NULL;

  -- 10. Return result
  RETURN json_build_object(
    'success', true,
    'id', v_notification_id,
    'selection_id', p_selection_id,
    'new_status', 'confirmed'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
