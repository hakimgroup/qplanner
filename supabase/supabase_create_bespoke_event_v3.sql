-- =====================================================================
-- Event form revamp — Phase 0.2
-- create_bespoke_event_v3 — sibling of v2 (v2 left intact for rollback).
-- Adds the structured `p_brief`:
--   * persisted on bespoke_campaigns.brief
--   * mirrored into notifications.payload.brief  (the Trello/n8n contract)
--
-- `p_event_type` now carries the free-text THEME from the new form.
-- Overall from/to come from the min/max of the date/time slots (client
-- derives them); the detailed slots live in brief.date_slots.
-- Faithful port of v2 otherwise (auto default creative, inProgress notif).
--
-- Apply to STAGING first, verify, then PROD. Idempotent (new name).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.create_bespoke_event_v3(
  p_practice        uuid,
  p_event_type      text,
  p_title           text,
  p_description     text,
  p_event_from_date date,
  p_event_to_date   date,
  p_objectives      jsonb DEFAULT '[]'::jsonb,
  p_topics          jsonb DEFAULT '[]'::jsonb,
  p_assets          jsonb DEFAULT '[]'::jsonb,
  p_requirements    text  DEFAULT NULL,
  p_notes           text  DEFAULT NULL,
  p_reference_links jsonb DEFAULT '[]'::jsonb,
  p_chosen_creative text  DEFAULT NULL,
  p_selected_assets jsonb DEFAULT NULL,
  p_brief           jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_bc_id uuid;
  v_sel_id uuid;
  v_default_creative_url text := 'https://cdn.hakimgroup.io/digE8/LEquQaPE75.png/raw';
  v_default_creatives jsonb;
  v_chosen_url text;
  v_chosen_label text;
  v_assets_to_save jsonb;
  v_payload jsonb;
  v_notification_id uuid;
  v_practice_admins uuid[];
  v_global_supers uuid[];
  v_target_users uuid[];
  v_recipients_json jsonb;
  v_practice record;
  v_actor uuid := auth.uid();
BEGIN
  IF NOT (public.is_admin() OR public.is_member_of(p_practice)) THEN
    RAISE EXCEPTION 'not authorized for this practice';
  END IF;

  IF p_event_from_date IS NULL OR p_event_to_date IS NULL THEN
    RAISE EXCEPTION 'event from/to dates are required';
  END IF;

  IF p_event_from_date > p_event_to_date THEN
    RAISE EXCEPTION 'from_date (%) cannot be after to_date (%)', p_event_from_date, p_event_to_date;
  END IF;

  v_default_creatives := jsonb_build_array(
    jsonb_build_object('label', 'Bespoke - ' || p_title, 'url', v_default_creative_url)
  );
  v_chosen_url := COALESCE(p_chosen_creative, v_default_creative_url);
  v_chosen_label := 'Bespoke - ' || p_title;
  v_assets_to_save := COALESCE(p_selected_assets, '{}'::jsonb);
  IF v_chosen_url IS NOT NULL THEN
    v_assets_to_save := v_assets_to_save || jsonb_build_object('creative', v_chosen_url);
  END IF;

  INSERT INTO public.bespoke_campaigns (
    practice_id, name, description, category, event_type, objectives, topics,
    assets, requirements, source, reference_links, creatives, created_by, brief
  )
  VALUES (
    p_practice, p_title, p_description, 'Event', p_event_type,
    COALESCE(p_objectives, '[]'::jsonb),
    COALESCE(p_topics, '[]'::jsonb),
    COALESCE(p_assets, '[]'::jsonb),
    p_requirements, 'manual',
    COALESCE(p_reference_links, '[]'::jsonb),
    v_default_creatives, v_actor,
    COALESCE(p_brief, '{}'::jsonb)
  )
  RETURNING id INTO v_bc_id;

  INSERT INTO public.selections (
    practice_id, bespoke_campaign_id, from_date, to_date, status, bespoke,
    notes, assets, reference_links, source, updated_at, created_by
  )
  VALUES (
    p_practice, v_bc_id, p_event_from_date, p_event_to_date, 'inProgress', true,
    p_notes, v_assets_to_save,
    COALESCE(p_reference_links, '[]'::jsonb),
    'manual', NOW(), v_actor
  )
  RETURNING id INTO v_sel_id;

  SELECT * INTO v_practice FROM public.practices WHERE id = p_practice;

  v_payload := jsonb_build_object(
    'name', p_title, 'category', 'Event', 'description', p_description,
    'event_type', p_event_type, 'from_date', p_event_from_date, 'to_date', p_event_to_date,
    'campaign_id', v_bc_id, 'bespoke_id', v_bc_id, 'is_bespoke', true,
    'chosen_creative', v_chosen_url, 'chosen_creative_label', v_chosen_label,
    'assets', v_assets_to_save, 'creatives', v_default_creatives,
    'note', p_notes, 'reference_links', COALESCE(p_reference_links, '[]'::jsonb),
    'original_notes', p_notes, 'requirements', p_requirements,
    'brief', COALESCE(p_brief, '{}'::jsonb)   -- NEW: Trello/n8n contract
  );

  INSERT INTO public.notifications (
    type, selection_id, campaign_id, practice_id, actor_user_id,
    audience, title, message, payload
  )
  VALUES (
    'inProgress', v_sel_id, NULL, p_practice, v_actor, 'admins',
    'Bespoke event added',
    'Practice added a bespoke event with their asset choices.',
    v_payload
  )
  RETURNING id INTO v_notification_id;

  SELECT COALESCE(array_agg(pm.user_id), '{}') INTO v_practice_admins
  FROM public.practice_members pm
  WHERE pm.practice_id = p_practice AND LOWER(COALESCE(pm.role, '')) = 'admin';
  SELECT COALESCE(array_agg(au.id), '{}') INTO v_global_supers
  FROM public.allowed_users au WHERE LOWER(COALESCE(au.role, '')) = 'super_admin';
  v_target_users := COALESCE(v_practice_admins, '{}') || COALESCE(v_global_supers, '{}');

  IF cardinality(v_target_users) > 0 THEN
    INSERT INTO public.notification_targets (notification_id, user_id, practice_id)
    SELECT DISTINCT v_notification_id, uid, p_practice
    FROM unnest(v_target_users) AS t(uid)
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT COALESCE(
    jsonb_agg(jsonb_build_object(
      'name', NULLIF(trim(coalesce(au.first_name,'') || ' ' || coalesce(au.last_name,'')), ''),
      'email', au.email
    )), '[]'::jsonb
  ) INTO v_recipients_json
  FROM public.notification_targets nt
  JOIN public.allowed_users au ON au.id = nt.user_id
  WHERE nt.notification_id = v_notification_id;

  INSERT INTO public.selection_status_history (
    selection_id, from_status, to_status, actor_user_id, note, message,
    recipient, practice
  )
  VALUES (
    v_sel_id, NULL, 'inProgress', v_actor, p_notes,
    'Practice added bespoke event with their asset choices.',
    v_recipients_json,
    jsonb_build_object('id', p_practice, 'name', v_practice.name)
  );

  RETURN jsonb_build_object(
    'success', true,
    'selection_id', v_sel_id,
    'bespoke_campaign_id', v_bc_id,
    'notification_id', v_notification_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_bespoke_event_v3(
  uuid, text, text, text, date, date, jsonb, jsonb, jsonb, text, text, jsonb, text, jsonb, jsonb
) TO authenticated;
