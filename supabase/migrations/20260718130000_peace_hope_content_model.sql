-- Drop journey system; add Peace Hope-style CMS tables (Shah Foladi branded content only)

drop table if exists public.journey_stops cascade;
drop table if exists public.journey_routes cascade;

alter table public.packages
  add column if not exists route_label text,
  add column if not exists audience_en text,
  add column if not exists audience_dari text,
  add column if not exists audience_pashto text,
  add column if not exists travel_style jsonb default '{}'::jsonb,
  add column if not exists important_notes_en text,
  add column if not exists important_notes_dari text,
  add column if not exists important_notes_pashto text,
  add column if not exists includes jsonb default '[]'::jsonb,
  add column if not exists excludes jsonb default '[]'::jsonb;

create table if not exists public.package_days (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  day_number int not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  body_en text,
  body_dari text,
  body_pashto text,
  overnight_location text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (package_id, day_number)
);

create table if not exists public.destination_attractions (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tour_departures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  start_date date,
  end_date date,
  nights int,
  days int,
  badge text,
  package_id uuid references public.packages(id) on delete set null,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_dari text,
  title_pashto text,
  summary_en text,
  summary_dari text,
  summary_pashto text,
  description_en text,
  description_dari text,
  description_pashto text,
  icon_key text,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_en text,
  role_dari text,
  role_pashto text,
  bio_en text,
  bio_dari text,
  bio_pashto text,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'general',
  question_en text not null,
  question_dari text,
  question_pashto text,
  answer_en text not null,
  answer_dari text,
  answer_pashto text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.gallery_images add column if not exists location_tag text;

alter table public.site_settings
  add column if not exists tripadvisor_url text,
  add column if not exists google_reviews_url text,
  add column if not exists about_teaser_en text,
  add column if not exists about_teaser_dari text,
  add column if not exists about_teaser_pashto text,
  add column if not exists why_us jsonb default '[]'::jsonb,
  add column if not exists testimonials jsonb default '[]'::jsonb;

alter table public.package_days enable row level security;
alter table public.destination_attractions enable row level security;
alter table public.tour_departures enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.faqs enable row level security;
