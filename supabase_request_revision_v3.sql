-- request_revision v3: returns jsonb (fixes email sending), adds recipient to status history
DROP FUNCTION IF EXISTS public.request_revision(uuid, text);

CREATE OR REPLACE FUNCTION public.request_revision(
  p_selection_id uuid,
  p_feedback text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_selection RECORD;
  v_practice RECORD;
  v_notification_id UUID;
  v_payload JSONB;
  v_recipients_json JSONB;
BEGIN
  -- 1. Validate feedback is provided
  IF p_feedback IS NULL OR TRIM(p_feedback) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Feedback is required'
    );
  END IF;

  -- 2. Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 3. Fetch the selection with related data
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

  -- 4. Verify user has access to this practice (admins can act on behalf of any practice)
  IF NOT public.is_admin() AND NOT EXISTS (
    SELECT 1 FROM practice_members pm
    WHERE pm.practice_id = v_selection.practice_id
      AND pm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You do not have access to this practice';
  END IF;

  -- 5. Fetch practice info
  SELECT * INTO v_practice
  FROM practices
  WHERE id = v_selection.practice_id;

  -- 6. Update selection status back to 'inProgress'
  UPDATE selections
  SET
    status = 'inProgress',
    updated_at = NOW()
  WHERE id = p_selection_id;

  -- 7. Build notification payload
  v_payload := jsonb_build_object(
    'name', v_selection.campaign_name,
    'description', v_selection.campaign_description,
    'category', v_selection.campaign_category,
    'from_date', v_selection.from_date,
    'to_date', v_selection.to_date,
    'feedback', p_feedback,
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
    'feedbackRequested',
    p_selection_id,
    COALESCE(v_selection.campaign_id, v_selection.bespoke_campaign_id),
    v_selection.practice_id,
    v_user_id,
    'admins',
    v_practice.name || ' requested changes',
    'Revision requested for ' || v_selection.campaign_name || ': ' || LEFT(p_feedback, 100),
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

  -- 10. Build recipients array for status history
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
  JOIN public.allowed_users au
    ON au.id = nt.user_id
  WHERE nt.notification_id = v_notification_id;

  -- 11. Log the status transition with feedback and recipients
  INSERT INTO selection_status_history (
    selection_id,
    from_status,
    to_status,
    actor_user_id,
    note,
    message,
    recipient,
    practice,
    created_at
  ) VALUES (
    p_selection_id,
    v_selection.status,
    'inProgress',
    v_user_id,
    p_feedback,
    'Practice requested revisions',
    v_recipients_json,
    jsonb_build_object('id', v_practice.id, 'name', v_practice.name),
    NOW()
  );

  -- 12. Return result
  RETURN jsonb_build_object(
    'success', true,
    'id', v_notification_id,
    'selection_id', p_selection_id,
    'new_status', 'inProgress'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
