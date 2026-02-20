-- 1. Add email_notifications_enabled column to allowed_users
ALTER TABLE public.allowed_users
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT true;

-- 2. Update get_users RPC to include the new column in its return type
-- Must DROP first because we are changing the return TABLE definition
DROP FUNCTION IF EXISTS public.get_users(uuid, text);

CREATE FUNCTION public.get_users(
  p_id uuid DEFAULT NULL,
  p_role text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  role text,
  created_at timestamptz,
  last_login timestamptz,
  email_notifications_enabled boolean,
  assigned_practices jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
with base as (
  select au.*
  from public.allowed_users au
  where (p_id is null or au.id = p_id)
    and (p_role is null or au.role = p_role)
),
practices_for as (
  select
    d.user_id,
    jsonb_agg(
      jsonb_build_object(
        'id', d.practice_id,
        'name', d.practice_name,
        'numberOfPlans', d.num_plans
      )
      order by d.practice_name
    ) as practices
  from (
    select distinct
      pm.user_id,
      p.id   as practice_id,
      p.name as practice_name,
      (select count(*) from public.selections s where s.practice_id = p.id) as num_plans
    from public.practice_members pm
    join public.practices p on p.id = pm.practice_id
  ) d
  group by d.user_id
)
select
  b.id,
  b.first_name,
  b.last_name,
  b.email,
  b.role,
  b.created_at,
  b.last_login,
  b.email_notifications_enabled,
  coalesce(pf.practices, '[]'::jsonb) as assigned_practices
from base b
left join practices_for pf
  on pf.user_id = b.id
order by b.created_at desc, b.last_name nulls last, b.first_name nulls last;
$$;

-- 3. Re-grant permissions
GRANT EXECUTE ON FUNCTION public.get_users(uuid, text) TO anon, authenticated, service_role;
