-- Per-image hero slides (title/subtitle change with each background)
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title_en text not null,
  title_dari text,
  title_pashto text,
  subtitle_en text,
  subtitle_dari text,
  subtitle_pashto text,
  cta_primary_label_en text default 'Start your adventure',
  cta_primary_href text default '/packages',
  cta_secondary_label_en text default 'Request a booking',
  cta_secondary_href text default '/book',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

drop policy if exists "Public read published hero slides" on public.hero_slides;
create policy "Public read published hero slides"
  on public.hero_slides for select to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins manage hero slides" on public.hero_slides;
create policy "Admins manage hero slides"
  on public.hero_slides for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
