-- Fix admin_users RLS so admins can verify their own row (avoids redirect loops)

drop policy if exists "Admins read admin users" on public.admin_users;

create policy "Admins read own row" on public.admin_users
  for select to authenticated
  using ((select auth.uid()) = user_id);
