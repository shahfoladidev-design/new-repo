-- Single currency: USD only (remove AFN from catalog, bookings, and payments)

update public.packages
set price_currency = 'USD'
where price_currency is distinct from 'USD';

update public.tour_departures
set price_currency = 'USD'
where price_currency is distinct from 'USD';

update public.booking_requests
set quoted_currency = 'USD'
where quoted_currency = 'AFN';

update public.booking_requests
set reference_price_currency = 'USD'
where reference_price_currency = 'AFN';

update public.payment_attempts
set currency = 'USD'
where currency = 'AFN';

alter table public.packages
  drop constraint if exists packages_price_currency_check;

alter table public.packages
  add constraint packages_price_currency_check
    check (price_currency = 'USD');

alter table public.tour_departures
  drop constraint if exists tour_departures_price_currency_check;

alter table public.tour_departures
  add constraint tour_departures_price_currency_check
    check (price_currency = 'USD');

alter table public.booking_requests
  drop constraint if exists booking_requests_quoted_currency_check;

alter table public.booking_requests
  add constraint booking_requests_quoted_currency_check
    check (quoted_currency is null or quoted_currency = 'USD');

alter table public.booking_requests
  drop constraint if exists booking_requests_reference_price_currency_check;

alter table public.booking_requests
  add constraint booking_requests_reference_price_currency_check
    check (reference_price_currency is null or reference_price_currency = 'USD');

alter table public.payment_attempts
  drop constraint if exists payment_attempts_currency_check;

alter table public.payment_attempts
  add constraint payment_attempts_currency_check
    check (currency = 'USD');
