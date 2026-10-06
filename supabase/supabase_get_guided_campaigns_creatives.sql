-- get_guided_campaigns (creatives + hard-filter on already-on-plan)
-- Changes from previous version:
--   1. Add `creatives jsonb` column to RETURNS TABLE so the side drawer renders them.
--   2. Filter out campaigns the practice has already selected (hard-exclude in `scored`),
--      removing the prior soft -0.20 score penalty since recommendations should never
--      include something the practice already has on their plan.

CREATE OR REPLACE FUNCTION public.get_guided_campaigns(
  p_clinical numeric,
  p_frame numeric,
  p_lens numeric,
  p_contact numeric,
  p_kids boolean,
  p_seasonal boolean,
  p_supplier_brand boolean,
  p_event_ready boolean,
  p_activity integer,
  p_practice uuid DEFAULT NULL::uuid
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  custom_events boolean,
  category text,
  tier text,
  assets jsonb,
  creatives jsonb,
  objectives jsonb,
  topics jsonb,
  availability jsonb,
  reference_links jsonb,
  status text,
  source text,
  is_bespoke boolean,
  selected boolean,
  selection_id uuid,
  selection_practice_id uuid,
  selection_practice_name text,
  selection_from_date date,
  selection_to_date date,
  notes text,
  is_event boolean,
  event_type text,
  requirements text,
  focus text,
  duration text
)
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

-- Practice's existing campaign IDs (any status) — hard-exclude from recs
practice_existing as (
  select s.campaign_id
  from public.selections s
  where p_practice is not null
    and s.practice_id = p_practice
    and s.campaign_id is not null
  group by s.campaign_id
),

avail_resolved as (
  select
    c.id,
    (c.availability ->> 'from') as a_from_txt,
    (c.availability ->> 'to')   as a_to_txt,
    case upper((c.availability ->> 'from'))
      when 'JAN' then 1 when 'FEB' then 2 when 'MAR' then 3 when 'APR' then 4
      when 'MAY' then 5 when 'JUN' then 6 when 'JUL' then 7 when 'AUG' then 8
      when 'SEP' then 9 when 'OCT' then 10 when 'NOV' then 11 when 'DEC' then 12
      else null
    end as a_from_m,
    case upper((c.availability ->> 'to'))
      when 'JAN' then 1 when 'FEB' then 2 when 'MAR' then 3 when 'APR' then 4
      when 'MAY' then 5 when 'JUN' then 6 when 'JUL' then 7 when 'AUG' then 8
      when 'SEP' then 9 when 'OCT' then 10 when 'NOV' then 11 when 'DEC' then 12
      else null
    end as a_to_m
  from public.campaigns_catalog c
),

avail_dates as (
  with parts as (
    select
      ar.id,
      ar.a_from_txt, ar.a_to_txt, ar.a_from_m, ar.a_to_m,
      case when ar.a_from_txt ~ '^\d{4}-\d{2}-\d{2}$' then split_part(ar.a_from_txt,'-',1)::int end as y_from,
      case when ar.a_from_txt ~ '^\d{4}-\d{2}-\d{2}$' then split_part(ar.a_from_txt,'-',2)::int end as m_from,
      case when ar.a_from_txt ~ '^\d{4}-\d{2}-\d{2}$' then split_part(ar.a_from_txt,'-',3)::int end as d_from,
      case when ar.a_to_txt   ~ '^\d{4}-\d{2}-\d{2}$' then split_part(ar.a_to_txt,  '-',1)::int end as y_to,
      case when ar.a_to_txt   ~ '^\d{4}-\d{2}-\d{2}$' then split_part(ar.a_to_txt,  '-',2)::int end as m_to,
      case when ar.a_to_txt   ~ '^\d{4}-\d{2}-\d{2}$' then split_part(ar.a_to_txt,  '-',3)::int end as d_to
    from avail_resolved ar
  )
  select
    p.id,
    case
      when p.a_from_m is not null then
        make_date(extract(year from current_date)::int, p.a_from_m, 1)
      when p.y_from is not null and p.m_from between 1 and 12 then
        make_date(
          p.y_from,
          p.m_from,
          least(
            coalesce(p.d_from, 1),
            extract(day from (date_trunc('month', make_date(p.y_from, p.m_from, 1))
                              + interval '1 month - 1 day'))::int
          )
        )
      else null
    end::date as avail_from_date,
    case
      when p.a_to_m is not null then
        (date_trunc('month', make_date(extract(year from current_date)::int, p.a_to_m, 1))
         + interval '1 month - 1 day')::date
      when p.y_to is not null and p.m_to between 1 and 12 then
        make_date(
          p.y_to,
          p.m_to,
          least(
            coalesce(p.d_to, 1),
            extract(day from (date_trunc('month', make_date(p.y_to, p.m_to, 1))
                              + interval '1 month - 1 day'))::int
          )
        )
      else null
    end::date as avail_to_date
  from parts p
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

    ad.avail_from_date,
    ad.avail_to_date,

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
  left join avail_dates ad on ad.id = c.id
  where p_practice is null
     or not exists (
       select 1 from practice_existing pe where pe.campaign_id = c.id
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
