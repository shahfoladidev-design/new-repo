-- Seed journey route + enriched site settings (idempotent)

update public.site_settings set
  whatsapp = '+937000000000',
  phone = '+937000000000',
  email = 'hello@shahfoladi.com',
  notification_email = 'hello@shahfoladi.com',
  telegram_url = 'https://t.me/shahfoladi',
  social_instagram = 'https://instagram.com/shahfoladi',
  social_facebook = 'https://facebook.com/shahfoladi',
  social_x = 'https://x.com/shahfoladi',
  primary_color = '#0f766e',
  secondary_color = '#134e4a',
  accent_color = '#2dd4bf',
  updated_at = now()
where id = 1;

insert into public.journey_routes (id, title_en, is_published, is_active)
select 'a1111111-1111-1111-1111-111111111111', 'Classic Afghanistan Tour', true, true
where not exists (select 1 from public.journey_routes where is_active = true);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 1, 'Kabul', 'Kabul — Capital Gateway', 'Begin your journey in Afghanistan''s vibrant capital.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 72, 68
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 1);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 2, 'Bamiyan', 'Bamiyan — Valley of Heritage', 'Ancient valleys, Buddha niches, and crystal lakes.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 58, 42
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 2);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 3, 'Herat', 'Herat — City of Art', 'Timurid architecture and centuries of culture.', 'https://images.unsplash.com/photo-1476517856864-ffcc7fbdc5f1?w=1200', 28, 38
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 3);

insert into public.journey_stops (route_id, sort_order, province_name, title_en, description_en, image_url, map_x, map_y)
select 'a1111111-1111-1111-1111-111111111111', 4, 'Mazar-i-Sharif', 'Mazar-i-Sharif — Blue Mosque', 'Northern Afghanistan''s spiritual heart.', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200', 52, 22
where not exists (select 1 from public.journey_stops where route_id = 'a1111111-1111-1111-1111-111111111111' and sort_order = 4);
