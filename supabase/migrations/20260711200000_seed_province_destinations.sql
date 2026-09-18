-- Seed destination stubs for journey provinces (for province detail pages)

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'kabul', 'Kabul', 'Afghanistan''s vibrant capital.', 'Explore Kabul with Shah Foladi — culture, heritage, and concierge travel support.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 34.5553, 69.2075, true
where not exists (select 1 from public.destinations where slug = 'kabul');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'mazar-i-sharif', 'Mazar-i-Sharif', 'Home of the Blue Mosque.', 'Northern Afghanistan''s spiritual heart and a highlight of any heritage tour.', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200', 36.709, 67.1109, true
where not exists (select 1 from public.destinations where slug = 'mazar-i-sharif');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'kandahar', 'Kandahar', 'Southern crossroads of Afghanistan.', 'Discover Kandahar''s history and southern landscapes with expert local guides.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200', 31.6289, 65.7372, true
where not exists (select 1 from public.destinations where slug = 'kandahar');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'panjshir', 'Panjshir', 'Valley of emeralds.', 'Mountain valleys and dramatic scenery in northeastern Afghanistan.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200', 35.2676, 69.5174, true
where not exists (select 1 from public.destinations where slug = 'panjshir');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'ghazni', 'Ghazni', 'Citadel of history.', 'Ancient minarets and layered Islamic heritage in central Afghanistan.', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200', 33.5458, 68.4174, true
where not exists (select 1 from public.destinations where slug = 'ghazni');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'badakhshan', 'Badakhshan', 'Pamir gateway.', 'Remote northeastern beauty and legendary hospitality.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 37.1167, 70.5833, true
where not exists (select 1 from public.destinations where slug = 'badakhshan');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'nangarhar', 'Nangarhar', 'Eastern gardens.', 'Lush eastern province known for warmth and citrus groves.', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200', 34.4344, 70.4483, true
where not exists (select 1 from public.destinations where slug = 'nangarhar');

insert into public.destinations (slug, title_en, summary_en, description_en, image_url, latitude, longitude, is_published)
select 'farah', 'Farah', 'Western horizons.', 'Desert landscapes on Afghanistan''s western frontier.', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200', 32.3745, 62.1164, true
where not exists (select 1 from public.destinations where slug = 'farah');
