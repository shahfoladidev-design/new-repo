-- Standard / VIP tiers per package + booking tier selection

alter table public.packages
  add column if not exists vip_price numeric(10, 2),
  add column if not exists standard_includes jsonb not null default '[]'::jsonb,
  add column if not exists vip_includes jsonb not null default '[]'::jsonb;

update public.packages
set standard_includes = coalesce(includes, '[]'::jsonb)
where standard_includes = '[]'::jsonb
  and includes is not null
  and includes <> '[]'::jsonb;

alter table public.packages
  drop constraint if exists packages_vip_price_positive;

alter table public.packages
  add constraint packages_vip_price_positive
  check (vip_price is null or vip_price > 0);

alter table public.booking_requests
  add column if not exists package_tier text;

alter table public.booking_requests
  drop constraint if exists booking_requests_package_tier_check;

alter table public.booking_requests
  add constraint booking_requests_package_tier_check
  check (package_tier is null or package_tier in ('standard', 'vip'));
