-- Seed 10 journey stops for testing (sorted A→B→C by sort_order)

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 5, 'Kandahar', 'Kandahar — Southern Crossroads', 'Historic southern city and gateway to diverse landscapes.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200', 50, 50
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 5);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 6, 'Panjshir', 'Panjshir — Valley of Emeralds', 'Dramatic peaks and pristine mountain valleys.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200', 50, 50
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 6);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 7, 'Ghazni', 'Ghazni — Citadel of History', 'Ancient minarets and layers of Islamic heritage.', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200', 50, 50
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 7);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 8, 'Badakhshan', 'Badakhshan — Pamir Gateway', 'Remote northeastern beauty and legendary hospitality.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 50, 50
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 8);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 9, 'Nangarhar', 'Nangarhar — Eastern Gardens', 'Lush eastern province known for citrus groves and warmth.', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200', 50, 50
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 9);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 10, 'Farah', 'Farah — Western Horizons', 'Desert landscapes and the spirit of the western frontier.', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200', 50, 50
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 10);

-- Fix Herat image if still broken
update public.journey_stops
set image_url = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
where route_id = 'a1111111-1111-1111-1111-111111111111' and province_name = 'Herat'
  and image_url like '%photo-1476517856864%';
