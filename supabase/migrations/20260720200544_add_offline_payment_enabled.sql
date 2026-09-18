-- Controls the public visibility of legacy offline bank-transfer payment information.
-- Default true preserves the existing checkout and booking behavior.
alter table public.site_settings
  add column if not exists offline_payment_enabled boolean not null default true;

comment on column public.site_settings.offline_payment_enabled is
  'Controls whether public offline bank-transfer payment information is shown.';
