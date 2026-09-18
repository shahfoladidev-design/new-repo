-- Keep DB column defaults aligned with the current Peace Hope brand palette
alter table public.site_settings
  alter column primary_color set default '#cb9274';

alter table public.site_settings
  alter column secondary_color set default '#a8755a';

alter table public.site_settings
  alter column accent_color set default '#e0d7c9';

-- Ensure the live row uses the current brand defaults when colors are missing/invalid
update public.site_settings
set
  primary_color = coalesce(nullif(trim(primary_color), ''), '#cb9274'),
  secondary_color = coalesce(nullif(trim(secondary_color), ''), '#a8755a'),
  accent_color = coalesce(nullif(trim(accent_color), ''), '#e0d7c9')
where id = 1;
