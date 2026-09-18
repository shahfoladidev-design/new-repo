-- Split packages into private (bespoke, on-request) and group (shared departure) tours.
-- Every existing package predates the distinction and is a private tour, so the
-- column defaults to 'private' and backfills the same way.

alter table public.packages
  add column if not exists package_type text not null default 'private';

update public.packages
set package_type = 'private'
where package_type is null or btrim(package_type) = '';

alter table public.packages
  drop constraint if exists packages_package_type_check;

alter table public.packages
  add constraint packages_package_type_check
  check (package_type in ('private', 'group'));

create index if not exists packages_package_type_idx
  on public.packages (package_type);
