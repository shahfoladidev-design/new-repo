-- Remove About Us teaser columns from site_settings.
-- The About page and admin About teaser fields were removed; recreate later with a proper model.

alter table public.site_settings
  drop column if exists about_teaser_en,
  drop column if exists about_teaser_dari,
  drop column if exists about_teaser_pashto;
