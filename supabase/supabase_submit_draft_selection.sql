-- submit_draft_selection
-- Transitions an existing selection from 'draft' to 'inProgress' once the
-- practice has picked a creative + configured asset choices via SubmitChoicesModal.
-- Mirrors add_campaign_with_assets's payload + notification + status_history shape.

CREATE OR REPLACE FUNCTION public.submit_draft_selection(
  p_selection_id uuid,
  p_chosen_creative text DEFAULT NULL,
  p_assets jsonb DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sel              RECORD;
  v_assets_to_save   jsonb;
  v_chosen_label     text;
  v_assets_link      text;
  v_payload          jsonb;
  v_notification_id  uuid;
  v_practice_admins  uuid[];
  v_global_supers    uuid[];
  v_target_users     uuid[];
  v_recipients_json  jsonb;
  v_practice_json    jsonb;
  v_actor uuid := auth.uid();
BEGIN
  -- 1) Load selection + context
  SELECT
    s.id, s.practice_id, s.status, s.campaign_id,
    s.from_date, s.to_date, s.bespoke, s.bespoke_campaign_id,
    s.notes              AS original_notes,
    s.reference_links    AS sel_links,
    c.name               AS catalog_name,
    c.category           AS catalog_category,
    c.description        AS catalog_description,
    c.creatives          AS catalog_creatives,
    c.tier               AS catalog_tier,
    c.reference_links    AS catalog_links,
    bc.name              AS bespoke_name,
    bc.category          AS bespoke_category,
    bc.description       AS bespoke_description,
    bc.creatives         AS bespoke_creatives,
    bc.reference_links   AS bespoke_links,
    bc.requirements      AS bespoke_requirements,
    bc.event_type        AS bespoke_event_type,
    p.name               AS practice_name
  INTO v_sel
  FROM public.selections s
  LEFT JOIN public.campaigns_catalog  c  ON c.id  = s.campaign_id
  LEFT JOIN public.bespoke_campaigns  bc ON bc.id = s.bespoke_campaign_id
  LEFT JOIN public.practices          p  ON p.id  = s.practice_id
  WHERE s.id = p_selection_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', format('selection %s not found', p_selection_id));
  END IF;

  -- 2) Auth — practice members or admins
  IF NOT (public.is_member_of(v_sel.practice_id) OR public.is_admin()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'not authorized for this practice');
  END IF;

  -- 3) Status guard
  IF v_sel.status <> 'draft' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('selection must be in status "draft" to submit (current=%s)', v_sel.status)
    );
  END IF;

  -- 4) Resolve chosen creative label + assets_link (from catalog OR bespoke creatives)
  IF p_chosen_creative IS NOT NULL THEN
    SELECT elem->>'label', elem->>'assets_link'
      INTO v_chosen_label, v_assets_link
    FROM jsonb_array_elements(
      COALESCE(
        CASE WHEN v_sel.bespoke THEN v_sel.bespoke_creatives ELSE v_sel.catalog_creatives END,
        '[]'::jsonb
      )
    ) AS elem
    WHERE elem->>'url' = p_chosen_creative
    LIMIT 1;
  END IF;

  -- 5) Build assets jsonb (fold chosen creative URL into assets.creative)
  v_assets_to_save := COALESCE(p_assets, '{}'::jsonb);
  IF p_chosen_creative IS NOT NULL THEN
    v_assets_to_save := v_assets_to_save || jsonb_build_object('creative', p_chosen_creative);
  END IF;

  -- 6) Update selection: draft -> inProgress
  UPDATE public.selections
     SET status     = 'inProgress',
         assets     = v_assets_to_save,
         notes      = COALESCE(p_note, notes),
         updated_at = NOW()
   WHERE id = v_sel.id;

  -- 7) Build inProgress notification payload
  v_payload := jsonb_build_object(
    'name',                  COALESCE(v_sel.bespoke_name, v_sel.catalog_name),
    'category',              COALESCE(v_sel.catalog_category, v_sel.bespoke_category, 'Campaign'),
    'description',           CASE WHEN COALESCE(v_sel.bespoke, false)
                               THEN COALESCE(v_sel.bespoke_description, '')
                               ELSE COALESCE(v_sel.catalog_description, '')
                             END,
    'tier',                  v_sel.catalog_tier,
    'event_type',            v_sel.bespoke_event_type,
    'from_date',             v_sel.from_date,
    'to_date',               v_sel.to_date,
    'campaign_id',           v_sel.campaign_id,
    'bespoke_id',            v_sel.bespoke_campaign_id,
    'is_bespoke',            COALESCE(v_sel.bespoke, false),
    'chosen_creative',       p_chosen_creative,
    'chosen_creative_label', v_chosen_label,
    'assets_link',           v_assets_link,
    'assets',                v_assets_to_save,
    'creatives',             COALESCE(
                               CASE WHEN v_sel.bespoke THEN v_sel.bespoke_creatives ELSE v_sel.catalog_creatives END,
                               '[]'::jsonb
                             ),
    'note',                  p_note,
    'reference_links',       COALESCE(v_sel.bespoke_links, v_sel.sel_links, v_sel.catalog_links, '[]'::jsonb),
    'original_notes',        v_sel.original_notes,
    'requirements',          v_sel.bespoke_requirements
  );

  -- 8) Insert admin notification
  INSERT INTO public.notifications (
    type, selection_id, campaign_id, practice_id,
    actor_user_id, audience, title, message, payload
  )
  VALUES (
    'inProgress', v_sel.id, v_sel.campaign_id, v_sel.practice_id,
    v_actor, 'admins',
    'Assets submitted',
    'Practice has submitted asset choices and creative.',
    v_payload
  )
  RETURNING id INTO v_notification_id;

  -- 9) Resolve target users (practice admins + global super_admins)
  SELECT COALESCE(array_agg(pm.user_id), '{}')
    INTO v_practice_admins
  FROM public.practice_members pm
  WHERE pm.practice_id = v_sel.practice_id
    AND LOWER(COALESCE(pm.role, '')) = 'admin';

  SELECT COALESCE(array_agg(au.id), '{}')
    INTO v_global_supers
  FROM public.allowed_users au
  WHERE LOWER(COALESCE(au.role, '')) = 'super_admin';

  v_target_users := COALESCE(v_practice_admins, '{}') || COALESCE(v_global_supers, '{}');

  IF v_target_users IS NOT NULL AND cardinality(v_target_users) > 0 THEN
    INSERT INTO public.notification_targets (notification_id, user_id, practice_id)
    SELECT DISTINCT v_notification_id, uid, v_sel.practice_id
    FROM unnest(v_target_users) AS t(uid)
    ON CONFLICT DO NOTHING;
  END IF;

  -- 10) Recipients JSON for status history
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

  v_practice_json := jsonb_build_object('id', v_sel.practice_id, 'name', v_sel.practice_name);

  -- 11) Status history (draft -> inProgress)
  INSERT INTO public.selection_status_history (
    selection_id, from_status, to_status, actor_user_id, note, message,
    recipient, practice
  )
  VALUES (
    v_sel.id, 'draft', 'inProgress', v_actor, p_note,
    'Practice submitted draft to design team.',
    v_recipients_json, v_practice_json
  );

  RETURN jsonb_build_object(
    'success',         true,
    'selection_id',    v_sel.id,
    'notification_id', v_notification_id,
    'payload',         v_payload
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_draft_selection(uuid, text, jsonb, text) TO authenticated;
