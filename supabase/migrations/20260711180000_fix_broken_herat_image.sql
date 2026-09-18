-- Fix broken Unsplash image (photo-1476517856864 returns 404)

update public.journey_stops
set image_url = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
where image_url like '%photo-1476517856864%';

update public.destinations
set image_url = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
where image_url like '%photo-1476517856864%';

update public.gallery_images
set image_url = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
where image_url like '%photo-1476517856864%';
