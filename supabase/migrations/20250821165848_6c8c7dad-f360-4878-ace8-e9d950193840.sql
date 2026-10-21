
-- 1) Create roles infrastructure
create type if not exists public.app_role as enum ('admin');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- A security-definer helper so RLS checks don’t recurse
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- user_roles policies
-- Admins can view and manage all roles
create policy if not exists "Admins can view all roles"
  on public.user_roles
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can assign roles"
  on public.user_roles
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can revoke roles"
  on public.user_roles
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Users can see their own roles
create policy if not exists "Users can view their own roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Bootstrap policy: the first authenticated user can make themselves admin exactly once
-- (This is safe because it only works while user_roles is empty.)
create policy if not exists "Bootstrap first admin"
  on public.user_roles
  for insert
  to authenticated
  with check (
    (select count(*) from public.user_roles) = 0
    and auth.uid() = user_id
    and role = 'admin'
  );

-- 2) Update services policies to allow admin management
-- Allow admins to view ALL services (even unavailable)
create policy if not exists "Admins can view all services"
  on public.services
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Allow admins to create/update/delete services
create policy if not exists "Admins can insert services"
  on public.services
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can update services"
  on public.services
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can delete services"
  on public.services
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
