-- Upcoming tour reference codes + booking workflow + offline payment settings
alter table public.tour_departures add column if not exists reference_code text;

with ranked as (
  select id, row_number() over (order by start_date nulls last, title_en) as rn
  from public.tour_departures
)
update public.tour_departures t
set reference_code = 'UPC-' || lpad(ranked.rn::text, 3, '0')
from ranked
where t.id = ranked.id
  and (t.reference_code is null or t.reference_code = '');

create unique index if not exists tour_departures_reference_code_uidx on public.tour_departures (reference_code);

alter table public.booking_requests add column if not exists nationality text;
alter table public.booking_requests add column if not exists preferred_language text;
alter table public.booking_requests add column if not exists payment_notes text;

alter table public.booking_requests alter column status set default 'new';

alter table public.site_settings add column if not exists payment_bank_name text;
alter table public.site_settings add column if not exists payment_account_name text;
alter table public.site_settings add column if not exists payment_account_number text;
alter table public.site_settings add column if not exists payment_iban text;
alter table public.site_settings add column if not exists payment_swift text;
alter table public.site_settings add column if not exists payment_currency text default 'USD';
alter table public.site_settings add column if not exists payment_instructions_en text;
alter table public.site_settings add column if not exists payment_instructions_dari text;
alter table public.site_settings add column if not exists payment_instructions_pashto text;
alter table public.site_settings add column if not exists payment_whatsapp_note_en text;
