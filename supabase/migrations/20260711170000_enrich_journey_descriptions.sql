-- Enrich journey stops with descriptions for scroll cards

update public.journey_stops set description_en = 'Begin your journey in Afghanistan''s vibrant capital — culture, cuisine, and concierge support.'
where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 1;

update public.journey_stops set description_en = 'Ancient valleys, Buddha niches, and crystal lakes in the highlands.'
where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 2;

update public.journey_stops set description_en = 'Timurid architecture, vibrant bazaars, and centuries of artistic tradition.'
where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 3;

update public.journey_stops set description_en = 'Northern Afghanistan''s spiritual heart and the famous Blue Mosque.'
where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 4;

update public.destinations set latitude = 34.5553, longitude = 69.2075 where slug = 'bamiyan';
update public.destinations set latitude = 34.3529, longitude = 62.2040 where slug = 'herat';
