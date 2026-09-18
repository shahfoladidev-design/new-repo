-- Shah Foladi initial schema

create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp text default '+93700000000',
  phone text default '+93700000000',
  email text default 'hello@shahfoladi.com',
  address_en text default 'Kabul, Afghanistan',
  address_dari text default 'کابل، افغانستان',
  address_pashto text default 'کابل، افغانستان',
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  description_en text,
  description_dari text,
  description_pashto text,
  price_from numeric(10,2),
  duration_days int,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  description_en text,
  description_dari text,
  description_pashto text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  description_en text,
  description_dari text,
  description_pashto text,
  location_en text,
  location_dari text,
  location_pashto text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_dari text,
  name_pashto text,
  bio_en text,
  bio_dari text,
  bio_pashto text,
  languages text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  days jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  excerpt_en text,
  excerpt_dari text,
  excerpt_pashto text,
  content_en text,
  content_dari text,
  content_pashto text,
  image_url text,
  is_published boolean not null default true,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title_en text,
  title_dari text,
  title_pashto text,
  image_url text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.booking_status as enum ('new', 'reviewed', 'confirmed', 'declined');

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  travel_date date,
  travelers int default 1,
  reference_type text,
  reference_slug text,
  message text,
  status public.booking_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.packages (slug, title_en, summary_en, description_en, price_from, duration_days, image_url) values
  ('bamiyan-highlands', 'Bamiyan Highlands Escape', 'A refined journey through ancient valleys, crystal lakes, and UNESCO heritage landscapes.', 'Discover Bamiyan with curated stays, private transport, and expert local guidance. This placeholder package demonstrates how premium travel content will appear on the live site.', 890, 5, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'),
  ('kabul-cultural-weekend', 'Kabul Cultural Weekend', 'An elegant short break combining heritage sites, artisan markets, and fine local dining.', 'Perfect for travelers seeking culture, comfort, and concierge-style support within the capital.', 420, 3, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200')
on conflict (slug) do nothing;

insert into public.destinations (slug, title_en, summary_en, description_en, image_url) values
  ('bamiyan', 'Bamiyan', 'Mountain serenity, Buddhist heritage, and breathtaking highland scenery.', 'Placeholder destination profile for Bamiyan province.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'),
  ('herat', 'Herat', 'Timurid architecture, vibrant bazaars, and centuries of artistic tradition.', 'Placeholder destination profile for Herat province.', 'https://images.unsplash.com/photo-1476517856864-ffcc7fbdc5f1?w=1200')
on conflict (slug) do nothing;

insert into public.hotels (slug, title_en, summary_en, location_en, image_url) values
  ('serene-kabul', 'Serene Kabul Hotel', 'Boutique comfort in the heart of the capital.', 'Kabul', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'),
  ('bamiyan-lodge', 'Bamiyan Mountain Lodge', 'Warm hospitality with panoramic valley views.', 'Bamiyan', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200')
on conflict (slug) do nothing;

-- Guides and blog posts are admin-managed only; no default rows are seeded here.

insert into public.itineraries (slug, title_en, summary_en, days) values
  ('heritage-trail', 'Heritage Trail', 'Five days of curated cultural highlights.', '[{"day":1,"title":"Arrival & welcome dinner"},{"day":2,"title":"Old city walking tour"},{"day":3,"title":"Museum & artisan visit"},{"day":4,"title":"Day excursion"},{"day":5,"title":"Departure"}]'::jsonb)
on conflict (slug) do nothing;

-- Gallery is admin-managed only; no default rows are seeded here.

alter table public.site_settings enable row level security;
alter table public.packages enable row level security;
alter table public.destinations enable row level security;
alter table public.hotels enable row level security;
alter table public.guides enable row level security;
alter table public.itineraries enable row level security;
alter table public.blog_posts enable row level security;
alter table public.gallery_images enable row level security;
alter table public.booking_requests enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.admin_users enable row level security;

create policy "Public read published packages" on public.packages for select to anon, authenticated using (is_published = true);
create policy "Public read published destinations" on public.destinations for select to anon, authenticated using (is_published = true);
create policy "Public read published hotels" on public.hotels for select to anon, authenticated using (is_published = true);
create policy "Public read published guides" on public.guides for select to anon, authenticated using (is_published = true);
create policy "Public read published itineraries" on public.itineraries for select to anon, authenticated using (is_published = true);
create policy "Public read published blog posts" on public.blog_posts for select to anon, authenticated using (is_published = true);
create policy "Public read published gallery" on public.gallery_images for select to anon, authenticated using (is_published = true);
create policy "Public read site settings" on public.site_settings for select to anon, authenticated using (true);

create policy "Anyone can submit booking requests" on public.booking_requests for insert to anon, authenticated with check (true);
create policy "Anyone can submit contact forms" on public.contact_submissions for insert to anon, authenticated with check (true);

create policy "Admins manage packages" on public.packages for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage destinations" on public.destinations for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage hotels" on public.hotels for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage guides" on public.guides for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage itineraries" on public.itineraries for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage blog posts" on public.blog_posts for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage gallery" on public.gallery_images for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins read booking requests" on public.booking_requests for select to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins update booking requests" on public.booking_requests for update to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins read contact submissions" on public.contact_submissions for select to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins read admin users" on public.admin_users for select to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert on public.booking_requests, public.contact_submissions to anon, authenticated;
grant all on all tables in schema public to authenticated;
