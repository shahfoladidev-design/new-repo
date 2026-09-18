-- Password reset OTPs + contact/booking admin delete/update policies

create table if not exists public.admin_password_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_password_otps_email_idx
  on public.admin_password_otps (lower(email), created_at desc);

alter table public.admin_password_otps enable row level security;

create or replace function public.is_admin_email(check_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(trim(check_email))
  );
$$;

revoke all on function public.is_admin_email(text) from public;
grant execute on function public.is_admin_email(text) to anon, authenticated;

drop policy if exists "Admins update contact submissions" on public.contact_submissions;
create policy "Admins update contact submissions"
  on public.contact_submissions for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins delete contact submissions" on public.contact_submissions;
create policy "Admins delete contact submissions"
  on public.contact_submissions for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins delete booking requests" on public.booking_requests;
create policy "Admins delete booking requests"
  on public.booking_requests for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
