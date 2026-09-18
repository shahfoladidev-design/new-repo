-- Align site brand colors with Peace Hope palette (terracotta / sand / beige)
update public.site_settings
set
  primary_color = '#cb9274',
  secondary_color = '#a8755a',
  accent_color = '#e0d7c9',
  updated_at = now()
where id = 1;
