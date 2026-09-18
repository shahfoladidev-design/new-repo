-- Visitor review submissions (star rating + text), moderated in admin
create table if not exists public.visitor_reviews (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  country text,
  rating smallint not null check (rating >= 1 and rating <= 5),
  review_text text not null,
  is_published boolean not null default false,
  admin_seen boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.visitor_reviews enable row level security;

create policy "Public read published visitor reviews"
  on public.visitor_reviews for select to anon, authenticated
  using (is_published = true);

create policy "Anyone can submit visitor reviews"
  on public.visitor_reviews for insert to anon, authenticated
  with check (
    rating >= 1 and rating <= 5
    and length(trim(full_name)) > 0
    and length(trim(review_text)) > 0
    and is_published = false
  );

create policy "Admins manage visitor reviews"
  on public.visitor_reviews for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

grant select, insert on public.visitor_reviews to anon, authenticated;
grant all on public.visitor_reviews to authenticated;
