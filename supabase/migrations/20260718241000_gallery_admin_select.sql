-- Ensure admins can read all gallery rows (including drafts) for CRUD/delete verification
drop policy if exists "Admins read all gallery" on public.gallery_images;
create policy "Admins read all gallery"
  on public.gallery_images
  for select
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
