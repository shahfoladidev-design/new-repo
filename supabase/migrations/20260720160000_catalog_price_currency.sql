-- Admin-controlled catalog prices with currency (packages + upcoming tours)

alter table public.packages
  add column if not exists price_currency text not null default 'USD';

alter table public.tour_departures
  add column if not exists price_from numeric(10, 2),
  add column if not exists price_currency text not null default 'USD';

alter table public.packages
  drop constraint if exists packages_price_currency_check;

alter table public.packages
  add constraint packages_price_currency_check
    check (price_currency in ('USD', 'AFN'));

alter table public.tour_departures
  drop constraint if exists tour_departures_price_currency_check;

alter table public.tour_departures
  add constraint tour_departures_price_currency_check
    check (price_currency in ('USD', 'AFN'));

alter table public.packages
  drop constraint if exists packages_price_from_positive;

alter table public.packages
  add constraint packages_price_from_positive
    check (price_from is null or price_from > 0);

alter table public.tour_departures
  add constraint tour_departures_price_from_positive
    check (price_from is null or price_from > 0);
