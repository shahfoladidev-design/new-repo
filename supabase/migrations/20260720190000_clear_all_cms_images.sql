-- Remove all CMS image URLs from the database.
-- Images must be uploaded via the admin panel; no stock/placeholder URLs remain.

alter table public.hero_slides alter column image_url drop not null;

update public.destinations
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.packages
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.hotels
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.guides
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.team_members
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.blog_posts
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.tour_departures
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.services
set image_url = null, updated_at = now()
where coalesce(image_url, '') <> '';

update public.destination_attractions
set image_url = null
where coalesce(image_url, '') <> '';

update public.hero_slides
set image_url = null
where coalesce(image_url, '') <> '';

update public.site_settings
set logo_url = null, updated_at = now()
where coalesce(logo_url, '') <> '';

delete from public.gallery_images;
