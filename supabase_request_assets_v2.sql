-- request_assets v2: adds reference_links, original_notes, requirements to notification payload
CREATE OR REPLACE FUNCTION public.request_assets(
  p_selection_id uuid,
  p_creatives    jsonb DEFAULT NULL,
  p_note         text  DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sel record;
  v_assets_src jsonb;
  v_assets_sub jsonb;
  v_payload jsonb;
  v_notification_id uuid;

  -- For history enrichment
  v_practice_name   text;
  v_recipients      jsonb; -- array of {name,email}
  v_message         text;

  -- recipients list we will target (ONLY practice members with role 'user')
  v_target_user_ids uuid[];

  v_actor uuid := auth.uid();
BEGIN
  --------------------------------------------------------------------
  -- 1. Load the selection + campaign & practice context
  --------------------------------------------------------------------
  SELECT
    s.id                    AS selection_id,
    s.practice_id           AS practice_id,
    s.status                AS status,
    s.campaign_id           AS campaign_id,
    s.bespoke               AS is_bespoke,
    s.bespoke_campaign_id   AS bespoke_campaign_id,
    s.from_date             AS from_date,
    s.to_date               AS to_date,
    s.source                AS source,
    s.notes                 AS sel_notes,
    c.name                  AS catalog_name,
    c.category              AS catalog_category,
    c.tier                  AS catalog_tier,
    c.objectives            AS catalog_objectives,
    c.topics                AS catalog_topics,
    c.reference_links       AS catalog_links,
    bc.name                 AS bespoke_name,
    bc.category             AS bespoke_category,
    bc.event_type           AS event_type,
    bc.objectives           AS bespoke_objectives,
    bc.topics               AS bespoke_topics,
    bc.reference_links      AS bespoke_links,
    bc.assets               AS bespoke_assets,
    bc.requirements         AS bespoke_requirements,
    p.name                  AS practice_name
  INTO v_sel
  FROM public.selections s
  LEFT JOIN public.campaigns_catalog c
    ON c.id = s.campaign_id
  LEFT JOIN public.bespoke_campaigns bc
    ON bc.id = s.bespoke_campaign_id
  LEFT JOIN public.practices p
    ON p.id = s.practice_id
  WHERE s.id = p_selection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selection % not found', p_selection_id;
  END IF;

  v_practice_name := v_sel.practice_name;

  --------------------------------------------------------------------
  -- 2. Auth check. Only admins can request assets.
  --------------------------------------------------------------------
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can request assets';
  END IF;

  --------------------------------------------------------------------
  -- 3. Enforce allowed current state
  --------------------------------------------------------------------
  IF v_sel.status NOT IN ('onPlan', 'requested') THEN
    RAISE EXCEPTION
      'Selection % is not eligible for request (status=%)',
      v_sel.selection_id,
      v_sel.status;
  END IF;

  --------------------------------------------------------------------
  -- 4. Determine assets source (bespoke > selection)
  --------------------------------------------------------------------
  v_assets_src := COALESCE(v_sel.bespoke_assets, '{}'::jsonb);

  IF v_sel.is_bespoke IS NOT TRUE THEN
    SELECT COALESCE(s.assets, '{}'::jsonb)
      INTO v_assets_src
      FROM public.selections s
     WHERE s.id = v_sel.selection_id;
  END IF;

  --------------------------------------------------------------------
  -- 5. Requested subset
  --------------------------------------------------------------------
  v_assets_sub := public.assets_requested_subset(v_assets_src);

  --------------------------------------------------------------------
  -- 6. Update selection to "requested"
  --------------------------------------------------------------------
  UPDATE public.selections
     SET status = 'requested'
   WHERE id = v_sel.selection_id;

  --------------------------------------------------------------------
  -- 7. Build payload
  --------------------------------------------------------------------
  v_payload := jsonb_build_object(
    'name',            COALESCE(v_sel.bespoke_name, v_sel.catalog_name),
    'category',        COALESCE(v_sel.catalog_category, v_sel.bespoke_category, 'Campaign'),
    'tier',            v_sel.catalog_tier,
    'from_date',       v_sel.from_date,
    'to_date',         v_sel.to_date,
    'campaign_id',     v_sel.campaign_id,
    'bespoke_id',      v_sel.bespoke_campaign_id,
    'is_bespoke',      COALESCE(v_sel.is_bespoke, false),
    'assets',          v_assets_sub,
    'creatives',       CASE
                         WHEN p_creatives IS NULL THEN '[]'::jsonb
                         WHEN jsonb_typeof(p_creatives) = 'array' THEN p_creatives
                         ELSE jsonb_build_array(p_creatives)
                       END,
    'note',            p_note,
    'event_type',      v_sel.event_type,
    'reference_links', COALESCE(v_sel.bespoke_links, v_sel.catalog_links, '[]'::jsonb),
    'original_notes',  v_sel.sel_notes,
    'requirements',    v_sel.bespoke_requirements
  );

  --------------------------------------------------------------------
  -- 8. Insert ONE notification
  --------------------------------------------------------------------
  INSERT INTO public.notifications(
    type,
    selection_id,
    campaign_id,
    practice_id,
    actor_user_id,
    audience,
    title,
    message,
    payload
  )
  VALUES (
    'requested',
    v_sel.selection_id,
    v_sel.campaign_id,
    v_sel.practice_id,
    v_actor,
    'practice',
    'Assets requested',
    'Please review and confirm assets and creatives.',
    v_payload
  )
  RETURNING id INTO v_notification_id;

  --------------------------------------------------------------------
  -- 9. Resolve targets: ONLY practice members with role 'user'
  --------------------------------------------------------------------
  SELECT COALESCE(array_agg(pm.user_id), '{}')
    INTO v_target_user_ids
  FROM public.practice_members pm
  WHERE pm.practice_id = v_sel.practice_id
    AND LOWER(COALESCE(pm.role, '')) = 'user';

  IF v_target_user_ids IS NULL OR cardinality(v_target_user_ids) = 0 THEN
    RAISE EXCEPTION
      'No recipients available: this practice has no members with role "user".';
  END IF;

  INSERT INTO public.notification_targets (notification_id, user_id, practice_id)
  SELECT v_notification_id, uid, v_sel.practice_id
  FROM unnest(v_target_user_ids) AS t(uid)
  ON CONFLICT DO NOTHING;

  --------------------------------------------------------------------
  -- 10. Build recipients FROM THE TARGETS of this notification
  --     -> array of { name, email }
  --------------------------------------------------------------------
  SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'name',
                 NULLIF(trim(coalesce(au.first_name,'') || ' ' || coalesce(au.last_name,'')), ''),
               'email',
                 au.email
             )
           ),
           '[]'::jsonb
         )
    INTO v_recipients
  FROM public.notification_targets nt
  JOIN public.allowed_users au
    ON au.id = nt.user_id
  WHERE nt.notification_id = v_notification_id;

  --------------------------------------------------------------------
  -- 11. History trail with recipients array
  --------------------------------------------------------------------
  INSERT INTO public.selection_status_history(
    selection_id,
    from_status,
    to_status,
    actor_user_id,
    note,
    message,
    recipient,
    practice
  )
  VALUES (
    v_sel.selection_id,
    v_sel.status,
    'requested',
    v_actor,
    p_note,
    'Admin requested assets and creatives from the practice to begin planning.',
    v_recipients,
    jsonb_build_object(
      'id',   v_sel.practice_id,
      'name', v_practice_name
    )
  );

  --------------------------------------------------------------------
  -- 12. Return compact JSON for UI
  --------------------------------------------------------------------
  RETURN jsonb_build_object(
    'id',            v_notification_id,
    'type',          'requested',
    'selection_id',  v_sel.selection_id,
    'practice_id',   v_sel.practice_id,
    'payload',       v_payload
  );
END;
$$;
