-- submit_assets v2: adds reference_links, original_notes, requirements to notification payload
CREATE OR REPLACE FUNCTION public.submit_assets(
  p_selection_id   uuid,
  p_chosen_creative text   DEFAULT NULL,
  p_assets         jsonb  DEFAULT NULL,
  p_note           text   DEFAULT NULL,
  p_recipient_ids  uuid[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sel              RECORD;
  v_payload          jsonb;
  v_notification_id  uuid;

  -- Enforced recipients:
  v_practice_admins  uuid[];
  v_global_supers    uuid[];
  v_target_user_ids  uuid[];

  -- Resolved recipients for history
  v_recipients_json  jsonb;

  -- practice for history
  v_practice_json    jsonb;

  v_actor uuid := auth.uid();
BEGIN
  --------------------------------------------------------------------
  -- 1) Load selection + context
  --------------------------------------------------------------------
  SELECT
    s.id,
    s.practice_id,
    s.status,
    s.campaign_id,
    s.from_date,
    s.to_date,
    s.bespoke,
    s.bespoke_campaign_id,
    s.notes              AS original_notes,
    s.reference_links    AS sel_links,
    c.name        AS catalog_name,
    c.category    AS catalog_category,
    c.description AS catalog_description,
    bc.name       AS bespoke_name,
    bc.category   AS bespoke_category,
    bc.description AS bespoke_description,
    bc.reference_links AS bespoke_links,
    bc.requirements    AS bespoke_requirements,
    p.name        AS practice_name
  INTO v_sel
  FROM public.selections s
  LEFT JOIN public.campaigns_catalog  c  ON c.id  = s.campaign_id
  LEFT JOIN public.bespoke_campaigns  bc ON bc.id = s.bespoke_campaign_id
  LEFT JOIN public.practices          p  ON p.id  = s.practice_id
  WHERE s.id = p_selection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selection % not found', p_selection_id;
  END IF;

  v_practice_json := jsonb_build_object(
    'id',   v_sel.practice_id,
    'name', v_sel.practice_name
  );

  --------------------------------------------------------------------
  -- 2) Auth: practice member or admin
  --------------------------------------------------------------------
  IF NOT public.is_member_of(v_sel.practice_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized for this practice';
  END IF;

  --------------------------------------------------------------------
  -- 3) Guard: only when status = requested
  --------------------------------------------------------------------
  IF v_sel.status <> 'requested' THEN
    RAISE EXCEPTION
      'Selection % must be in status "requested" to submit assets (current=%)',
      v_sel.id, v_sel.status;
  END IF;

  --------------------------------------------------------------------
  -- 4) Update selection → inProgress and persist assets (if provided)
  --------------------------------------------------------------------
  UPDATE public.selections
     SET status = 'inProgress',
         assets = COALESCE(p_assets, assets)
   WHERE id = v_sel.id;

  --------------------------------------------------------------------
  -- 5) Build payload for admins
  --------------------------------------------------------------------
  v_payload := jsonb_build_object(
    'name',            COALESCE(v_sel.bespoke_name, v_sel.catalog_name),
    'category',        COALESCE(v_sel.catalog_category, v_sel.bespoke_category, 'Campaign'),
    'from_date',       v_sel.from_date,
    'to_date',         v_sel.to_date,
    'campaign_id',     v_sel.campaign_id,
    'bespoke_id',      v_sel.bespoke_campaign_id,
    'is_bespoke',      COALESCE(v_sel.bespoke, false),
    'chosen_creative', p_chosen_creative,
    'assets',          COALESCE(p_assets, '{}'::jsonb),
    'note',            p_note,
    'description',     CASE
                         WHEN COALESCE(v_sel.bespoke, false) IS TRUE
                           THEN COALESCE(v_sel.bespoke_description, '')
                         ELSE
                           COALESCE(v_sel.catalog_description, '')
                       END,
    'reference_links', COALESCE(v_sel.bespoke_links, v_sel.sel_links, '[]'::jsonb),
    'original_notes',  v_sel.original_notes,
    'requirements',    v_sel.bespoke_requirements
  );

  --------------------------------------------------------------------
  -- 6) Insert notification to admins
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
    'inProgress',
    v_sel.id,
    v_sel.campaign_id,
    v_sel.practice_id,
    v_actor,
    'admins',
    'Assets submitted',
    'Practice has submitted asset choices and creative.',
    v_payload
  )
  RETURNING id INTO v_notification_id;

  --------------------------------------------------------------------
  -- 7) Resolve targets (ENFORCED):
  --    * practice admins only (role='admin') for this practice
  --    * PLUS all global super_admins (role='super_admin')
  --    * deduplicate
  --    * ignore p_recipient_ids to enforce policy
  --------------------------------------------------------------------
  SELECT COALESCE(array_agg(pm.user_id), '{}')
    INTO v_practice_admins
  FROM public.practice_members pm
  WHERE pm.practice_id = v_sel.practice_id
    AND LOWER(COALESCE(pm.role, '')) = 'admin';

  SELECT COALESCE(array_agg(au.id), '{}')
    INTO v_global_supers
  FROM public.allowed_users au
  WHERE LOWER(COALESCE(au.role, '')) = 'super_admin';

  -- concatenate (could be empty arrays) and dedupe on insert
  v_target_user_ids := COALESCE(v_practice_admins, '{}') || COALESCE(v_global_supers, '{}');

  IF v_target_user_ids IS NULL OR cardinality(v_target_user_ids) = 0 THEN
    RAISE EXCEPTION
      'No recipients available: no practice admins and no global super_admins.';
  END IF;

  INSERT INTO public.notification_targets(notification_id, user_id, practice_id)
  SELECT DISTINCT v_notification_id, uid, v_sel.practice_id
  FROM unnest(v_target_user_ids) AS t(uid)
  ON CONFLICT DO NOTHING;

  --------------------------------------------------------------------
  -- 8) Build recipients array (actual receivers) for history:
  --    [{ name, email }, ...] from notification_targets → allowed_users
  --------------------------------------------------------------------
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

  --------------------------------------------------------------------
  -- 9) Append status history (with message, recipients, practice)
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
    v_sel.id,
    'requested',
    'inProgress',
    v_actor,
    p_note,
    'Practice submitted their selections and awaiting admin review.',
    v_recipients_json,
    v_practice_json
  );

  --------------------------------------------------------------------
  -- 10) Return compact result
  --------------------------------------------------------------------
  RETURN jsonb_build_object(
    'id',           v_notification_id,
    'type',         'inProgress',
    'selection_id', v_sel.id,
    'practice_id',  v_sel.practice_id,
    'payload',      v_payload
  );
END;
$$;
