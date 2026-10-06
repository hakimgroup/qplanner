-- get_campaigns (hidden + expiry filter)
-- Practice-side browse: skip catalog rows where:
--   * hidden = true (admin manually hid)
--   * availability->>'to' parses as an ISO date AND that date < today
-- Month-code availability (JAN, FEB, ...) recurs every year and never expires.
-- Bespoke rows are owned per-practice and remain unaffected.

CREATE OR REPLACE FUNCTION public.get_campaigns(p_practice uuid DEFAULT NULL::uuid)
RETURNS TABLE(
  id uuid, name text, description text, custom_events boolean,
  category text, tier text, assets jsonb, creatives jsonb,
  objectives jsonb, topics jsonb, availability jsonb,
  reference_links jsonb, status text, source text, is_bespoke boolean,
  selected boolean, selection_id uuid, selection_practice_id uuid,
  selection_practice_name text, selection_from_date date,
  selection_to_date date, notes text, bespoke_campaign_id uuid,
  is_event boolean, event_type text, requirements text,
  markup_link text, assets_link text, self_print boolean
)
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

best_selection as (
  select distinct on (s.campaign_id)
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
         s.updated_at,
         s.assets,
         s.reference_links,
         s.bespoke_campaign_id,
         s.markup_link,
         s.assets_link,
         s.self_print
  from public.selections s
  join my_practices mp on mp.id = s.practice_id
  where s.campaign_id is not null
  order by s.campaign_id,
           case when s.to_date >= current_date then 0 else 1 end,
           s.updated_at desc
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
    s.assets_link                                       as assets_link
   ,coalesce(s.self_print, false)                       as self_print
  from public.bespoke_campaigns bc
  join public.selections s
    on s.bespoke_campaign_id = bc.id
  join my_practices mp
    on mp.id = bc.practice_id
)

-- Catalog campaigns (merged with best selection)
select
  c.id,
  c.name,
  c.description,
  c.custom_events,
  c.category,
  c.tier,
  coalesce(bs.assets, c.assets)                                   as assets,
  coalesce(c.creatives, '[]'::jsonb)                              as creatives,
  c.objectives,
  c.topics,
  c.availability,
  coalesce(bs.reference_links, c.reference_links, '[]'::jsonb)    as reference_links,
  coalesce(bs.status, c.status)                                   as status,
  bs.source                                                       as source,
  coalesce(bs.bespoke, c.is_bespoke)                              as is_bespoke,
  (bs.campaign_id is not null)                                    as selected,
  bs.selection_id,
  bs.selection_practice_id,
  bs.selection_practice_name,
  bs.from_date                                                    as selection_from_date,
  bs.to_date                                                      as selection_to_date,
  bs.notes,
  bs.bespoke_campaign_id,
  false                                                           as is_event,
  null::text                                                      as event_type,
  null::text                                                      as requirements,
  bs.markup_link,
  bs.assets_link,
  coalesce(bs.self_print, false)                                  as self_print
from public.campaigns_catalog c
left join best_selection bs
  on bs.campaign_id = c.id
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
  self_print
from bespoke_rows

order by name;
$function$;
