-- Human-readable booking reference codes
alter table public.packages add column if not exists reference_code text;
alter table public.services add column if not exists reference_code text;
alter table public.booking_requests add column if not exists reference_code text;
alter table public.booking_requests add column if not exists reference_title text;

with ranked as (
  select id, row_number() over (order by duration_days nulls last, title_en) as rn
  from public.packages
)
update public.packages p
set reference_code = 'PKG-' || lpad(ranked.rn::text, 3, '0')
from ranked
where p.id = ranked.id
  and (p.reference_code is null or p.reference_code = '');

with ranked as (
  select id, row_number() over (order by sort_order, title_en) as rn
  from public.services
)
update public.services s
set reference_code = 'SVC-' || lpad(ranked.rn::text, 3, '0')
from ranked
where s.id = ranked.id
  and (s.reference_code is null or s.reference_code = '');

create unique index if not exists packages_reference_code_uidx on public.packages (reference_code);
create unique index if not exists services_reference_code_uidx on public.services (reference_code);
