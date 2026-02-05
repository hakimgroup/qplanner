-- on_selection_awaiting_approval v2: adds reference_links, original_notes, requirements to notification payload
CREATE OR REPLACE FUNCTION public.on_selection_awaiting_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sel RECORD;
  v_payload jsonb;
  v_notification_id uuid;
  v_target_user_ids uuid[];
  v_recipients jsonb;
  v_practice_name text;
  v_message text;
  v_actor uuid;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF NEW.status <> 'awaitingApproval' OR (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.notifications n
     WHERE n.selection_id = NEW.id
       AND n.type = 'awaitingApproval'
       AND n.created_at >= (now() - interval '5 minutes')
  ) THEN
    RETURN NEW;
  END IF;

  SELECT
    s.id                          AS selection_id,
    s.practice_id                 AS practice_id,
    s.status                      AS status,
    s.campaign_id                 AS campaign_id,
    s.bespoke                     AS is_bespoke,
    s.bespoke_campaign_id         AS bespoke_campaign_id,
    s.from_date                   AS from_date,
    s.to_date                     AS to_date,
    s.assets                      AS sel_assets,
    s.markup_link                 AS markup_link,
    s.assets_link                 AS assets_link,
    s.notes                       AS sel_notes,
    c.name                        AS catalog_name,
    c.category                    AS catalog_category,
    c.description                 AS catalog_description,
    c.tier                        AS catalog_tier,
    c.creatives                   AS catalog_creatives,
    c.reference_links             AS catalog_links,
    bc.name                       AS bespoke_name,
    bc.category                   AS bespoke_category,
    bc.description                AS bespoke_description,
    bc.reference_links            AS bespoke_links,
    bc.event_type                 AS event_type,
    bc.requirements               AS bespoke_requirements,
    p.name                        AS practice_name
  INTO v_sel
  FROM public.selections s
  LEFT JOIN public.campaigns_catalog  c  ON c.id  = s.campaign_id
  LEFT JOIN public.bespoke_campaigns  bc ON bc.id = s.bespoke_campaign_id
  LEFT JOIN public.practices          p  ON p.id  = s.practice_id
  WHERE s.id = NEW.id;

  v_practice_name := v_sel.practice_name;

  v_actor := auth.uid();

  IF v_actor IS NULL THEN
    SELECT pm.user_id
      INTO v_actor
      FROM public.practice_members pm
     WHERE pm.practice_id = v_sel.practice_id
       AND LOWER(COALESCE(pm.role,'')) = 'admin'
     LIMIT 1;
  END IF;

  IF v_actor IS NULL THEN
    SELECT au.id
      INTO v_actor
      FROM public.allowed_users au
     WHERE LOWER(COALESCE(au.role,'')) = 'super_admin'
     LIMIT 1;
  END IF;

  IF v_actor IS NULL THEN
    SELECT au.id
      INTO v_actor
      FROM public.allowed_users au
     LIMIT 1;
  END IF;

  IF v_actor IS NULL THEN
    RAISE EXCEPTION
      'Cannot determine actor_user_id for awaitingApproval notification. Create at least one user (admin/super_admin) in allowed_users.';
  END IF;

  v_payload := jsonb_build_object(
    'name',            COALESCE(v_sel.bespoke_name, v_sel.catalog_name),
    'category',        COALESCE(v_sel.catalog_category, v_sel.bespoke_category, 'Campaign'),
    'description',     COALESCE(v_sel.catalog_description, v_sel.bespoke_description, ''),
    'tier',            v_sel.catalog_tier,
    'from_date',       v_sel.from_date,
    'to_date',         v_sel.to_date,
    'campaign_id',     v_sel.campaign_id,
    'bespoke_id',      v_sel.bespoke_campaign_id,
    'is_bespoke',      COALESCE(v_sel.is_bespoke, false),
    'assets',          COALESCE(v_sel.sel_assets, '{}'::jsonb),
    'creatives',       COALESCE(v_sel.catalog_creatives, '[]'::jsonb),
    'note',            NULL,
    'event_type',      v_sel.event_type,
    'reference_links', COALESCE(v_sel.bespoke_links, v_sel.catalog_links, '[]'::jsonb),
    'original_notes',  v_sel.sel_notes,
    'requirements',    v_sel.bespoke_requirements
  );

  IF v_sel.markup_link IS NOT NULL THEN
    v_payload := v_payload || jsonb_build_object('markup_link', v_sel.markup_link);
  END IF;

  IF v_sel.assets_link IS NOT NULL THEN
    v_payload := v_payload || jsonb_build_object('assets_link', v_sel.assets_link);
  END IF;

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
    'awaitingApproval',
    v_sel.selection_id,
    v_sel.campaign_id,
    v_sel.practice_id,
    v_actor,
    'practice',
    'Artwork ready for final approval',
    'Please view and confirm your print assets or download your digital assets.',
    v_payload
  )
  RETURNING id INTO v_notification_id;

  SELECT COALESCE(array_agg(pm.user_id), '{}')
    INTO v_target_user_ids
  FROM public.practice_members pm
  WHERE pm.practice_id = v_sel.practice_id
    AND LOWER(COALESCE(pm.role,'')) = 'user';

  IF v_target_user_ids IS NOT NULL AND cardinality(v_target_user_ids) > 0 THEN
    INSERT INTO public.notification_targets(notification_id, user_id, practice_id)
    SELECT v_notification_id, uid, v_sel.practice_id
    FROM unnest(v_target_user_ids) AS t(uid)
    ON CONFLICT DO NOTHING;

    SELECT COALESCE(
             jsonb_agg(
               jsonb_build_object(
                 'name',  NULLIF(trim(coalesce(au.first_name,'') || ' ' || coalesce(au.last_name,'')), ''),
                 'email', au.email
               )
             ),
             '[]'::jsonb
           )
      INTO v_recipients
    FROM public.notification_targets nt
    JOIN public.allowed_users au ON au.id = nt.user_id
    WHERE nt.notification_id = v_notification_id;
  ELSE
    v_recipients := '[]'::jsonb;
  END IF;

  v_message :=
    'Designers have submitted artwork for final review. Please use the markup link to approve or request changes.';

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
    COALESCE(OLD.status, 'unknown'),
    'awaitingApproval',
    v_actor,
    NULL,
    v_message,
    v_recipients,
    jsonb_build_object('id', v_sel.practice_id, 'name', v_practice_name)
  );

  -- Send notification email via pg_net (async HTTP call to Express server)
  PERFORM net.http_post(
    url     := 'https://qplanner-server.vercel.app/send-notification-email',
    body    := jsonb_build_object('notificationId', v_notification_id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$;
