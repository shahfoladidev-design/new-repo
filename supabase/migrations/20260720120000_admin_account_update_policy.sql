-- Allow admins to update their own admin_users row (e.g. login email sync)

create policy "Admins update own row" on public.admin_users
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
