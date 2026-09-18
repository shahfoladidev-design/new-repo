-- Phase 2+ extensions: branding, legal, journey, booking updates, locations, storage

alter table public.site_settings
  add column if not exists logo_url text,
  add column if not exists primary_color text default '#0f766e',
  add column if not exists secondary_color text default '#134e4a',
  add column if not exists accent_color text default '#2dd4bf',
  add column if not exists telegram_url text,
  add column if not exists telegram_bot_token text,
  add column if not exists telegram_chat_id text,
  add column if not exists notification_email text,
  add column if not exists social_tiktok text,
  add column if not exists social_instagram text,
  add column if not exists social_facebook text,
  add column if not exists social_x text,
  add column if not exists social_youtube text,
  add column if not exists social_linkedin text;

alter table public.booking_requests
  add column if not exists admin_seen boolean not null default false,
  add column if not exists agreement_accepted_at timestamptz;

alter table public.destinations
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7);

alter table public.hotels
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7);

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null unique check (doc_type in ('visa_invitation', 'guide_license')),
  title_en text not null,
  title_dari text,
  title_pashto text,
  content_en text not null default '',
  content_dari text,
  content_pashto text,
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_routes (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default 'Afghanistan Tour',
  is_published boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.journey_routes(id) on delete cascade,
  sort_order int not null default 0,
  province_name text not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  description_en text,
  description_dari text,
  description_pashto text,
  image_url text,
  map_x numeric(5,2) not null default 50,
  map_y numeric(5,2) not null default 50,
  created_at timestamptz not null default now()
);

insert into public.legal_documents (doc_type, title_en, content_en) values
  ('visa_invitation', 'Tourist Visa Invitation Agreement', 'This document confirms that the tourist named in the booking request intends to travel to Afghanistan under the arrangement of Shah Foladi Travel Agency and Tour Guide services. Shah Foladi is a registered travel agency providing tour guide and travel services within Afghanistan.'),
  ('guide_license', 'Tour Guide License Agreement', 'This document confirms that tour guides operating under Shah Foladi Travel Agency are authorized representatives of the company and provide licensed tour guide services in Afghanistan.')
on conflict (doc_type) do nothing;

alter table public.legal_documents enable row level security;
alter table public.journey_routes enable row level security;
alter table public.journey_stops enable row level security;

create policy "Public read legal documents" on public.legal_documents for select to anon, authenticated using (true);
create policy "Public read published journey routes" on public.journey_routes for select to anon, authenticated using (is_published = true and is_active = true);
create policy "Public read journey stops" on public.journey_stops for select to anon, authenticated using (
  exists (select 1 from public.journey_routes r where r.id = route_id and r.is_published = true and r.is_active = true)
);

create policy "Admins manage legal documents" on public.legal_documents for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins manage journey routes" on public.journey_routes for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins manage journey stops" on public.journey_stops for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('brand', 'brand', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('journey', 'journey', true) on conflict (id) do nothing;

create policy "Public read gallery bucket" on storage.objects for select to anon, authenticated using (bucket_id = 'gallery');
create policy "Admins manage gallery bucket" on storage.objects for all to authenticated
  using (bucket_id = 'gallery' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (bucket_id = 'gallery' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Public read brand bucket" on storage.objects for select to anon, authenticated using (bucket_id = 'brand');
create policy "Admins manage brand bucket" on storage.objects for all to authenticated
  using (bucket_id = 'brand' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (bucket_id = 'brand' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Public read journey bucket" on storage.objects for select to anon, authenticated using (bucket_id = 'journey');
create policy "Admins manage journey bucket" on storage.objects for all to authenticated
  using (bucket_id = 'journey' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (bucket_id = 'journey' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
