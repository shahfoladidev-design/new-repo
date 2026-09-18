-- Point content images at locally hosted Peace Hope photography.
-- Only replaces migration placeholder URLs; preserves admin-uploaded storage URLs.

-- Placeholder URLs: null, Unsplash, or prior /media/peace-hope/ defaults.
-- Admin uploads use Supabase Storage and are never overwritten.

update public.destinations set image_url = '/media/peace-hope/destinations/kabul.jpg'
where slug = 'kabul'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/bamyan.jpg'
where slug in ('bamyan', 'bamiyan')
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/herat.jpg'
where slug = 'herat'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/kandahar.jpg'
where slug = 'kandahar'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/panjshir.jpg'
where slug = 'panjshir'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/mazar-e-sharif.jpg'
where slug in ('mazar-e-sharif', 'mazar-i-sharif')
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/wakhan.jpg'
where slug = 'wakhan'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/ghazni.jpg'
where slug = 'ghazni'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/ghor.jpg'
where slug = 'ghor'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/badakhshan.jpg'
where slug = 'badakhshan'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/nuristan.jpg'
where slug = 'nuristan'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/jalalabad.jpg'
where slug in ('jalalabad', 'nangarhar')
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.destinations set image_url = '/media/peace-hope/destinations/helmand.jpg'
where slug = 'helmand'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');

update public.packages set image_url = '/media/peace-hope/packages/kabul-bamyan-5-day.jpg'
where slug = 'kabul-bamyan-5-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.packages set image_url = '/media/peace-hope/packages/central-northern-7-day.jpg'
where slug = 'central-northern-7-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.packages set image_url = '/media/peace-hope/packages/central-afghanistan-9-day.jpg'
where slug = 'central-afghanistan-9-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.packages set image_url = '/media/peace-hope/packages/central-western-10-day.jpg'
where slug = 'central-western-10-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.packages set image_url = '/media/peace-hope/packages/wakhan-pamir-14-day.jpg'
where slug = 'wakhan-pamir-14-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.packages set image_url = '/media/peace-hope/packages/complete-afghanistan-15-day.jpg'
where slug = 'complete-afghanistan-15-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');

update public.tour_departures set image_url = '/media/peace-hope/upcoming/june-2026-10-day.jpg'
where slug = 'june-2026-10-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.tour_departures set image_url = '/media/peace-hope/upcoming/july-2026-7-day.jpg'
where slug = 'july-2026-7-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.tour_departures set image_url = '/media/peace-hope/upcoming/august-2026-10-day.jpg'
where slug = 'august-2026-10-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.tour_departures set image_url = '/media/peace-hope/upcoming/september-2026-cross-border.jpg'
where slug = 'september-2026-cross-border'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.tour_departures set image_url = '/media/peace-hope/upcoming/october-2026-14-day.jpg'
where slug = 'october-2026-14-day'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');

update public.hero_slides set image_url = '/media/peace-hope/hero/bamyan-highlands.jpg'
where title_en ilike '%Bamyan%'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.hero_slides set image_url = '/media/peace-hope/hero/hospitality.jpg'
where title_en ilike '%Hospitality%'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
update public.hero_slides set image_url = '/media/peace-hope/hero/wonders.jpg'
where title_en ilike '%Wonders%'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%'
  and (image_url like 'https://images.unsplash.com/%' or image_url like '/media/peace-hope/%');
