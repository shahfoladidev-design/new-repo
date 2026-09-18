-- Toggle for site-wide frosted glass look (Admin → Settings)
alter table public.site_settings
  add column if not exists glass_look_enabled boolean not null default false;

comment on column public.site_settings.glass_look_enabled is
  'When true, public site uses frosted glass (iOS-style) surfaces.';
