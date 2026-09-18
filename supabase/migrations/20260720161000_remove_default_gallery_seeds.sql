-- Remove migration-seeded default gallery rows.
-- Gallery content is managed only through the admin panel; migrations must never re-insert it.

delete from public.gallery_images
where image_url like '/media/peace-hope/gallery/%'
   or image_url like 'https://images.unsplash.com/%';
