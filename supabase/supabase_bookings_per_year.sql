-- One booking per catalog campaign per YEAR (Nov 2026: open planning for 2027).
--
-- Before: a practice could book each catalog campaign once, ever
-- (unique index on (practice_id, campaign_id)), so anything booked in 2026
-- could not be booked again for 2027.
-- After: one booking per (practice, campaign, year of from_date).
--
-- Availability windows are treated as recurring every year:
-- campaign_window_for_year() moves a catalog window (stored with 2026 dates)
-- into any year. Which years practices may book is decided by the client
-- (LAST_PLANNING_YEAR in client/src/shared/planningYears.ts).
--
--   1. campaign_window_for_year(availability, year)   new helper
--   2. unique index -> (practice_id, campaign_id, year)
--   3. add_campaign_with_assets      duplicate check is per year (patched in place, same signature)
--   4. copy_practice_campaigns_v2    duplicate check is per year (patched in place, same signature)
--   5. get_campaigns_v2              every booking + catalog_assets + is_primary (new)
--   6. add_campaigns_bulk_v2         Quick Populate / Guided for a given year (new)
--   7. get_guided_campaigns_v2       recommendations for a given year (new)
--
-- v1 functions (get_campaigns, add_campaigns_bulk, get_guided_campaigns) are
-- left untouched so the client already deployed keeps working until the new
-- client ships.
--
-- Schema change: apply to STAGING first, then PROD (before deploying the client).
-- Idempotent: safe to re-run.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Catalog window for a given year
-- ---------------------------------------------------------------------------
-- availability is {"from","to"} as ISO dates/timestamps (the admin date
-- picker saves UK midnight, e.g. 2026-03-31T23:00:00.000Z = 1 Apr) or 3-letter
-- month codes. The window is moved into p_year, keeping its length, so a
-- window that crosses New Year ends in p_year + 1. No availability = whole year.
CREATE OR REPLACE FUNCTION public.campaign_window_for_year(p_availability jsonb, p_year int)
RETURNS daterange
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_from_txt text := p_availability->>'from';
  v_to_txt   text := p_availability->>'to';
  v_months   text[] := ARRAY['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  v_fm int;
  v_tm int;
  v_from date;
  v_to date;
  v_shift int;
BEGIN
  IF p_year IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_from_txt IS NULL OR v_to_txt IS NULL THEN
    RETURN daterange(make_date(p_year, 1, 1), make_date(p_year, 12, 31), '[]');
  END IF;

  v_fm := array_position(v_months, upper(v_from_txt));
  v_tm := array_position(v_months, upper(v_to_txt));
  IF v_fm IS NOT NULL AND v_tm IS NOT NULL THEN
    v_from := make_date(p_year, v_fm, 1);
    v_to := (make_date(CASE WHEN v_tm < v_fm THEN p_year + 1 ELSE p_year END, v_tm, 1)
             + interval '1 month - 1 day')::date;
    RETURN daterange(v_from, v_to, '[]');
  END IF;

  BEGIN
    v_from := (v_from_txt::timestamptz AT TIME ZONE 'Europe/London')::date;
    v_to   := (v_to_txt::timestamptz   AT TIME ZONE 'Europe/London')::date;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  IF v_to < v_from THEN
    RETURN NULL;
  END IF;

  v_shift := p_year - extract(year FROM v_from)::int;
  v_from := (v_from + make_interval(years => v_shift))::date;
  v_to   := (v_to   + make_interval(years => v_shift))::date;
  RETURN daterange(v_from, v_to, '[]');
END
$$;

-- ---------------------------------------------------------------------------
-- 2. Unique booking per practice + campaign + year
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS selections_practice_campaign_year_unique
  ON public.selections (practice_id, campaign_id, (extract(year FROM from_date)))
  WHERE campaign_id IS NOT NULL;

DROP INDEX IF EXISTS public.selections_practice_campaign_unique;

-- ---------------------------------------------------------------------------
-- 3 + 4. Per-year duplicate checks, patched in place (signatures unchanged)
-- ---------------------------------------------------------------------------
DO $patch$
DECLARE
  v_def text;
  v_new text;
BEGIN
  -- 3. add_campaign_with_assets
  v_def := pg_get_functiondef('public.add_campaign_with_assets(uuid,uuid,date,date,text,jsonb,text,text)'::regprocedure);
  IF position('extract(year FROM p_from_date)' IN v_def) = 0 THEN
    v_new := replace(v_def,
      'WHERE practice_id = p_practice AND campaign_id = p_campaign_id',
      'WHERE practice_id = p_practice AND campaign_id = p_campaign_id AND extract(year FROM from_date) = extract(year FROM p_from_date)');
    v_new := replace(v_new,
      $q$RAISE EXCEPTION 'campaign already selected for this practice';$q$,
      $q$RAISE EXCEPTION 'campaign already booked for this practice in %', extract(year FROM p_from_date)::int;$q$);
    IF v_new = v_def OR position('already booked for this practice in' IN v_new) = 0 THEN
      RAISE EXCEPTION 'add_campaign_with_assets: expected duplicate check not found, not patched';
    END IF;
    EXECUTE v_new;
  END IF;

  -- 4. copy_practice_campaigns_v2
  SELECT pg_get_functiondef(p.oid) INTO v_def
  FROM pg_proc p
  WHERE p.proname = 'copy_practice_campaigns_v2' AND p.pronamespace = 'public'::regnamespace;
  IF position('extract(year FROM t.from_date)' IN v_def) = 0 THEN
    v_new := replace(v_def,
      'WHERE t.practice_id = v_dst AND t.campaign_id = sel.campaign_id',
      'WHERE t.practice_id = v_dst AND t.campaign_id = sel.campaign_id AND extract(year FROM t.from_date) = extract(year FROM sel.from_date)');
    IF v_new = v_def THEN
      RAISE EXCEPTION 'copy_practice_campaigns_v2: expected duplicate check not found, not patched';
    END IF;
    EXECUTE v_new;
  END IF;
END
$patch$;

-- ---------------------------------------------------------------------------
-- 5. get_campaigns_v2: every booking, not just one per campaign
-- ---------------------------------------------------------------------------
-- Same columns as get_campaigns plus:
--   catalog_assets  the catalog's current asset template (null for bespoke), used
--                   when booking a campaign again for another year.
--   is_primary      one row per catalog campaign for the Browse view: the
--                   soonest current/upcoming booking, else the latest past one,
--                   else the unbooked row. Always true for bespoke rows.
DROP FUNCTION IF EXISTS public.get_campaigns_v2(uuid);
CREATE FUNCTION public.get_campaigns_v2(p_practice uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, name text, description text, custom_events boolean, category text, tier text, assets jsonb, creatives jsonb, objectives jsonb, topics jsonb, availability jsonb, reference_links jsonb, status text, source text, is_bespoke boolean, selected boolean, selection_id uuid, selection_practice_id uuid, selection_practice_name text, selection_from_date date, selection_to_date date, notes text, bespoke_campaign_id uuid, is_event boolean, event_type text, requirements text, markup_link text, assets_link text, self_print boolean, brief jsonb, catalog_assets jsonb, is_primary boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
with my_practices as (
  select p.id, p.name
  from public.practices p
  where
    case
      when p_practice is not null
        then p.id = p_practice and (public.is_admin() or public.is_member_of(p.id))
      else (public.is_admin() or public.is_member_of(p.id))
    end
),

bookings as (
  select
         s.id                         as selection_id,
         s.practice_id                as selection_practice_id,
         mp.name                      as selection_practice_name,
         s.campaign_id,
         s.from_date,
         s.to_date,
         s.status,
         s.source,
         coalesce(s.bespoke, false)   as bespoke,
         s.notes,
         s.assets,
         s.reference_links,
         s.bespoke_campaign_id,
         s.markup_link,
         s.assets_link,
         s.self_print,
         row_number() over (
           partition by s.campaign_id
           order by
             case when s.to_date >= current_date then 0 else 1 end,
             case when s.to_date >= current_date then s.from_date end asc,
             s.from_date desc,
             s.updated_at desc
         ) = 1                        as is_primary
  from public.selections s
  join my_practices mp on mp.id = s.practice_id
  where s.campaign_id is not null
),

bespoke_rows as (
  select
    bc.id                                               as id,
    bc.name                                             as name,
    bc.description                                      as description,
    bc.category                                         as category,
    null::text                                          as tier,
    coalesce(s.assets, '[]'::jsonb)                     as assets,
    '[]'::jsonb                                         as creatives,
    coalesce(bc.objectives, '[]'::jsonb)                as objectives,
    coalesce(bc.topics, '[]'::jsonb)                    as topics,
    null::jsonb                                         as availability,
    coalesce(s.reference_links, bc.reference_links, '[]'::jsonb) as reference_links,
    s.status                                            as status,
    coalesce(s.source, bc.source)                       as source,
    true                                                as is_bespoke,
    true                                                as selected,
    s.id                                                as selection_id,
    s.practice_id                                       as selection_practice_id,
    mp.name                                             as selection_practice_name,
    s.from_date                                         as selection_from_date,
    s.to_date                                           as selection_to_date,
    s.notes                                             as notes,
    s.bespoke_campaign_id                               as bespoke_campaign_id,
    (bc.category = 'Event')                             as is_event,
    bc.event_type                                       as event_type,
    bc.requirements                                     as requirements,
    s.markup_link                                       as markup_link,
    s.assets_link                                       as assets_link,
    coalesce(s.self_print, false)                       as self_print,
    coalesce(bc.brief, '{}'::jsonb)                     as brief
  from public.bespoke_campaigns bc
  join public.selections s
    on s.bespoke_campaign_id = bc.id
  join my_practices mp
    on mp.id = bc.practice_id
)

-- Catalog campaigns: one row per booking, or one unbooked row
select
  c.id,
  c.name,
  c.description,
  c.custom_events,
  c.category,
  c.tier,
  coalesce(b.assets, c.assets)                                    as assets,
  coalesce(c.creatives, '[]'::jsonb)                              as creatives,
  c.objectives,
  c.topics,
  c.availability,
  coalesce(b.reference_links, c.reference_links, '[]'::jsonb)     as reference_links,
  coalesce(b.status, c.status)                                    as status,
  b.source                                                        as source,
  coalesce(b.bespoke, c.is_bespoke)                               as is_bespoke,
  (b.campaign_id is not null)                                     as selected,
  b.selection_id,
  b.selection_practice_id,
  b.selection_practice_name,
  b.from_date                                                     as selection_from_date,
  b.to_date                                                       as selection_to_date,
  b.notes,
  b.bespoke_campaign_id,
  false                                                           as is_event,
  null::text                                                      as event_type,
  null::text                                                      as requirements,
  b.markup_link,
  b.assets_link,
  coalesce(b.self_print, false)                                   as self_print,
  null::jsonb                                                     as brief,
  coalesce(c.assets, '{}'::jsonb)                                 as catalog_assets,
  coalesce(b.is_primary, true)                                    as is_primary
from public.campaigns_catalog c
left join bookings b
  on b.campaign_id = c.id
where
  -- Hidden rows are never shown on practice browse
  c.hidden = false
  -- Expiry: only ISO-date 'to' values trigger expiry; month codes recur and never expire
  and (
    c.availability is null
    or (c.availability ->> 'to') is null
    or (c.availability ->> 'to') !~ '^\d{4}-\d{2}-\d{2}$'
    or ((c.availability ->> 'to')::date >= current_date)
  )

union all

select
  id,
  name,
  description,
  null::boolean as custom_events,
  category,
  tier,
  assets,
  creatives,
  objectives,
  topics,
  availability,
  reference_links,
  status,
  source,
  is_bespoke,
  selected,
  selection_id,
  selection_practice_id,
  selection_practice_name,
  selection_from_date,
  selection_to_date,
  notes,
  bespoke_campaign_id,
  is_event,
  event_type,
  requirements,
  markup_link,
  assets_link,
  self_print,
  brief,
  null::jsonb   as catalog_assets,
  true          as is_primary
from bespoke_rows

order by name, selection_from_date nulls first;
$function$;

-- ---------------------------------------------------------------------------
-- 6. add_campaigns_bulk_v2: Quick Populate / Guided for one year
-- ---------------------------------------------------------------------------
-- Each campaign is booked for its window in p_year, starting no sooner than a
-- week from today (same lead time as the single-add date picker). Campaigns
-- whose window has passed, or that the practice already booked that year, are
-- skipped.
DROP FUNCTION IF EXISTS public.add_campaigns_bulk_v2(uuid, uuid[], int, text, text, text);
CREATE FUNCTION public.add_campaigns_bulk_v2(
  p_practice uuid,
  p_campaign_ids uuid[],
  p_year int,
  p_status text DEFAULT 'draft'::text,
  p_notes text DEFAULT NULL::text,
  p_source text DEFAULT NULL::text
)
 RETURNS TABLE(selection_id uuid, campaign_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_earliest date := current_date + 7;
BEGIN
  IF NOT (public.is_admin() OR public.is_member_of(p_practice)) THEN
    RAISE EXCEPTION 'not authorized for this practice';
  END IF;

  IF p_practice IS NULL THEN
    RAISE EXCEPTION 'p_practice is required';
  END IF;

  IF p_campaign_ids IS NULL OR array_length(p_campaign_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'p_campaign_ids cannot be empty';
  END IF;

  IF p_year IS NULL THEN
    RAISE EXCEPTION 'p_year is required';
  END IF;

  RETURN QUERY
  WITH wanted AS (
    SELECT DISTINCT x.cid::uuid AS id
    FROM unnest(p_campaign_ids) AS x(cid)
  ),
  windows AS (
    SELECT c.id, c.assets, c.reference_links,
           public.campaign_window_for_year(c.availability, p_year) AS w
    FROM public.campaigns_catalog c
    JOIN wanted ON wanted.id = c.id
  ),
  dated AS (
    SELECT w.id, w.assets, w.reference_links,
           greatest(lower(w.w), v_earliest) AS eff_from,
           (upper(w.w) - 1)                 AS eff_to
    FROM windows w
    WHERE w.w IS NOT NULL
  ),
  valid AS (
    SELECT d.*
    FROM dated d
    WHERE d.eff_from <= d.eff_to
      AND NOT EXISTS (
        SELECT 1 FROM public.selections s
        WHERE s.practice_id = p_practice
          AND s.campaign_id = d.id
          AND extract(year FROM s.from_date) = extract(year FROM d.eff_from)
      )
  )
  INSERT INTO public.selections (
    practice_id, campaign_id, from_date, to_date, status, bespoke,
    notes, assets, reference_links, source, updated_at
  )
  SELECT
    p_practice, v.id, v.eff_from, v.eff_to, coalesce(p_status, 'draft'), false,
    p_notes, coalesce(v.assets, '[]'::jsonb), coalesce(v.reference_links, '[]'::jsonb), p_source, now()
  FROM valid v
  ON CONFLICT DO NOTHING
  RETURNING public.selections.id AS selection_id,
            public.selections.campaign_id AS campaign_id;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 7. get_guided_campaigns_v2: recommendations for one year
-- ---------------------------------------------------------------------------
-- Same scoring as get_guided_campaigns. Differences when p_year is given:
-- only campaigns the practice booked in p_year are excluded, campaigns whose
-- p_year window has already passed are skipped, and duration uses that window.
DROP FUNCTION IF EXISTS public.get_guided_campaigns_v2(numeric, numeric, numeric, numeric, boolean, boolean, boolean, boolean, integer, uuid, integer);
CREATE FUNCTION public.get_guided_campaigns_v2(p_clinical numeric, p_frame numeric, p_lens numeric, p_contact numeric, p_kids boolean, p_seasonal boolean, p_supplier_brand boolean, p_event_ready boolean, p_activity integer, p_practice uuid DEFAULT NULL::uuid, p_year integer DEFAULT NULL::integer)
 RETURNS TABLE(id uuid, name text, description text, custom_events boolean, category text, tier text, assets jsonb, creatives jsonb, objectives jsonb, topics jsonb, availability jsonb, reference_links jsonb, status text, source text, is_bespoke boolean, selected boolean, selection_id uuid, selection_practice_id uuid, selection_practice_name text, selection_from_date date, selection_to_date date, notes text, is_event boolean, event_type text, requirements text, focus text, duration text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
with
limit_n as (
  select greatest(2, least(20, round(2 + (0.18 * least(greatest(p_activity, 0), 100)))))::int as n
),

w as (
  select
    case when (p_clinical + p_frame + p_lens + p_contact) > 0
         then (p_clinical + 0.0) / (p_clinical + p_frame + p_lens + p_contact)
         else 0.25 end as u_clinical,
    case when (p_clinical + p_frame + p_lens + p_contact) > 0
         then (p_frame + 0.0)    / (p_clinical + p_frame + p_lens + p_contact)
         else 0.25 end as u_frame,
    case when (p_clinical + p_frame + p_lens + p_contact) > 0
         then (p_lens + 0.0)     / (p_clinical + p_frame + p_lens + p_contact)
         else 0.25 end as u_lens,
    case when (p_clinical + p_frame + p_lens + p_contact) > 0
         then (p_contact + 0.0)  / (p_clinical + p_frame + p_lens + p_contact)
         else 0.25 end as u_contact
),

-- Campaigns the practice already booked (in p_year when given) — hard-exclude from recs
practice_existing as (
  select s.campaign_id
  from public.selections s
  where p_practice is not null
    and s.practice_id = p_practice
    and s.campaign_id is not null
    and (p_year is null or extract(year from s.from_date) = p_year)
  group by s.campaign_id
),

windows as (
  select
    c.id,
    public.campaign_window_for_year(
      c.availability,
      coalesce(p_year, extract(year from current_date)::int)
    ) as win
  from public.campaigns_catalog c
),

scored as (
  select
    c.id, c.name, c.description, c.category, c.tier,
    coalesce(c.assets, '[]'::jsonb)          as assets,
    coalesce(c.creatives, '[]'::jsonb)       as creatives,
    coalesce(c.objectives, '[]'::jsonb)      as objectives,
    coalesce(c.topics, '[]'::jsonb)          as topics,
    c.availability,
    coalesce(c.reference_links, '[]'::jsonb) as reference_links,
    c.custom_events,
    c.status,

    lower(wn.win)     as avail_from_date,
    upper(wn.win) - 1 as avail_to_date,

    (c.topics ? 'Clinical')::int         as c_clinical,
    (c.topics ? 'Frame')::int            as c_frame,
    (c.topics ? 'Lens')::int             as c_lens,
    (c.topics ? 'Contact lenses')::int   as c_contact,
    (c.topics ? 'Kids')::int             as c_kids,
    (c.topics ? 'Seasonal')::int         as c_seasonal,

    (case when c.category = 'Brand Activations' then 1 else 0 end) as is_brand_act,
    (case when c.category = 'Event' then 1 else 0 end)             as is_event_ready,

    (
      (c.topics ? 'Clinical')::int       * (select u_clinical from w) +
      (c.topics ? 'Frame')::int          * (select u_frame    from w) +
      (c.topics ? 'Lens')::int           * (select u_lens     from w) +
      (c.topics ? 'Contact lenses')::int * (select u_contact  from w)
    )::numeric as sim_topics_raw
  from public.campaigns_catalog c
  left join windows wn on wn.id = c.id
  where (p_practice is null
       or not exists (
         select 1 from practice_existing pe where pe.campaign_id = c.id
       ))
    -- Hidden catalog rows are never recommended
    and c.hidden = false
    -- ISO-date expiry: month codes (JAN/FEB/...) recur and never expire
    and (
      c.availability is null
      or (c.availability ->> 'to') is null
      or (c.availability ->> 'to') !~ '^\d{4}-\d{2}-\d{2}$'
      or ((c.availability ->> 'to')::date >= current_date)
    )
    -- Planning a specific year: skip campaigns whose window that year has passed
    and (
      p_year is null
      or (wn.win is not null and upper(wn.win) - 1 >= current_date + 7)
    )
),

scored2 as (
  select
    sc.*,
    (
      0.70 * sc.sim_topics_raw
      + case when p_kids           then case when sc.c_kids        = 1 then 0.15 else -0.15 end else 0 end
      + case when p_seasonal       then case when sc.c_seasonal    = 1 then 0.15 else -0.15 end else 0 end
      + case when p_supplier_brand then case when sc.is_brand_act  = 1 then 0.12 else -0.12 end else 0 end
      + case when p_event_ready    then case when sc.is_event_ready= 1 then 0.12 else -0.12 end else 0 end
    )::numeric as score,

    case
      when greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_clinical * (select u_clinical from w) then 'clinical'
      when greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_frame    * (select u_frame    from w) then 'frame'
      when greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_lens     * (select u_lens     from w) then 'lens'
      when greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_contact  * (select u_contact  from w) then 'contact'
      else
        case
          when (select u_clinical from w) >= greatest((select u_frame from w), (select u_lens from w), (select u_contact from w)) then 'clinical'
          when (select u_frame    from w) >= greatest((select u_lens  from w), (select u_contact from w)) then 'frame'
          when (select u_lens     from w) >= (select u_contact from w) then 'lens'
          else 'contact'
        end
    end as primary_topic,

    case
      when p_event_ready and sc.is_event_ready = 1
        then 'Event readiness enabled'
      when (select u_clinical from w) >= 0.5 and
           greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_clinical * (select u_clinical from w)
        then 'Strong clinical focus alignment'
      when (select u_frame from w) >= 0.5 and
           greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_frame * (select u_frame from w)
        then 'High frame emphasis score'
      when (select u_contact from w) >= 0.5 and
           greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_contact * (select u_contact from w)
        then 'Contact lens emphasis priority'
      when greatest(
             sc.c_clinical * (select u_clinical from w),
             sc.c_frame    * (select u_frame    from w),
             sc.c_lens     * (select u_lens     from w),
             sc.c_contact  * (select u_contact  from w)
           ) = sc.c_clinical * (select u_clinical from w)
        then 'Clinical services focus'
      else 'Balanced campaign selection'
    end as focus_label
  from scored sc
),

topic_weights as (
  select 'clinical' as topic, (select u_clinical from w) as u
  union all select 'frame',   (select u_frame from w)
  union all select 'lens',    (select u_lens from w)
  union all select 'contact', (select u_contact from w)
),
quota_base as (
  select
    tw.topic,
    floor((select n from limit_n) * tw.u)::int as base_take,
    (((select n from limit_n) * tw.u) - floor((select n from limit_n) * tw.u))::numeric as frac
  from topic_weights tw
),
quota_alloc as (
  select
    qb.*,
    (select (select n from limit_n) - sum(base_take) from quota_base)::int as remainder
  from quota_base qb
),
quota_final as (
  select
    topic,
    base_take + case
      when row_number() over (order by frac desc, topic) <= remainder then 1
      else 0
    end as take_count
  from quota_alloc
),

ranked as (
  select
    s2.*,
    row_number() over (partition by s2.primary_topic order by s2.score desc, s2.name asc) as rn_topic,
    row_number() over (order by s2.score desc, s2.name asc) as rn_global
  from scored2 s2
),

selected_primary as (
  select r.*
  from ranked r
  join quota_final q on q.topic = r.primary_topic
  where r.rn_topic <= q.take_count
),

backfill_needed as (
  select (select n from limit_n) - count(*) as k
  from selected_primary
),

backfill as (
  select r.*
  from ranked r
  where not exists (select 1 from selected_primary sp where sp.id = r.id)
  order by r.rn_global
  limit (select k from backfill_needed)
),

final_set as (
  select * from selected_primary
  union all
  select * from backfill
)

select
  f.id,
  f.name,
  f.description,
  f.custom_events,
  f.category,
  f.tier,
  f.assets,
  f.creatives,
  f.objectives,
  f.topics,
  f.availability,
  f.reference_links,
  f.status,
  null::text                  as source,
  false                       as is_bespoke,
  false                       as selected,
  null::uuid                  as selection_id,
  null::uuid                  as selection_practice_id,
  null::text                  as selection_practice_name,
  null::date                  as selection_from_date,
  null::date                  as selection_to_date,
  null::text                  as notes,
  (f.category = 'Event')      as is_event,
  null::text                  as event_type,
  null::text                  as requirements,
  f.focus_label               as focus,
  case
    when f.avail_from_date is not null and f.avail_to_date is not null
      then ((f.avail_to_date - f.avail_from_date + 1))::int || ' days'
    else null
  end                         as duration
from final_set f
order by f.score desc, f.name asc
limit (select n from limit_n);
$function$;

GRANT EXECUTE ON FUNCTION public.campaign_window_for_year(jsonb, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_campaigns_v2(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_campaigns_bulk_v2(uuid, uuid[], int, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_guided_campaigns_v2(numeric, numeric, numeric, numeric, boolean, boolean, boolean, boolean, integer, uuid, integer) TO anon, authenticated, service_role;

COMMIT;

-- Make PostgREST pick up the new functions straight away.
NOTIFY pgrst, 'reload schema';
