-- Public site reads logo/settings via anon key (createPublicClient).
-- SELECT was revoked for security hardening; that hid the logo site-wide.
-- Keep writes admin-only; hide notification_email from anon via column revoke.

grant select on public.site_settings to anon, authenticated;

revoke insert, update, delete, truncate on public.site_settings from anon;

-- Internal inbox must not be readable by the public API key.
revoke select (notification_email) on public.site_settings from anon;

-- Ensure public read policy still exists.
drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
  on public.site_settings for select to anon, authenticated
  using (true);
