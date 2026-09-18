-- Remove migration-seeded default admin-managed content.
-- These tables are edited only through the admin panel; migrations must never re-insert them.

delete from public.team_members
where name in (
  'Founder & Director',
  'Senior Tour Guide',
  'Female Tour Guide',
  'Logistics Lead',
  'Guest Relations',
  'Operations Assistant',
  'Support Specialist',
  'Senior Driver'
)
and coalesce(image_url, '') like '/media/peace-hope/%';

delete from public.guides
where slug in (
  'cultural-heritage-guide',
  'mountain-nature-guide',
  'female-travel-guide',
  'operations-guide',
  'ali-reza',
  'mariam-khan'
)
and (
  coalesce(image_url, '') like '/media/peace-hope/%'
  or coalesce(image_url, '') like 'https://images.unsplash.com/%'
);

delete from public.faqs
where question_en in (
  'Do I need a visa to visit Afghanistan?',
  'Is it safe to travel to Afghanistan?',
  'Can I travel alone or do I need a group?',
  'Who guides the tour?',
  'What kind of accommodation is included?',
  'How does transportation work?',
  'What is included in the tour price?',
  'When is the best time to visit?',
  'What should I pack?',
  'How do I book a tour?',
  'Can I customize my itinerary?',
  'Where do you operate?',
  'Can I get a SIM card and internet?',
  'How does payment work?',
  'What food will I try?',
  'Is travel suitable for women?',
  'What currency is used?',
  'Do you provide support during the trip?',
  'How do I choose the right package?',
  'Can packages be combined or shortened?',
  'Are departure dates fixed?',
  'Can I book transport or a guide only?',
  'Do you help with custom travel planning?',
  'How experienced is your team?',
  'Do you work with international travelers?',
  'How quickly will I receive a response?',
  'When is booking confirmed?'
);

-- Clear placeholder image URLs only where migrations used generic defaults.
update public.team_members
set image_url = null, updated_at = now()
where coalesce(image_url, '') like '/media/peace-hope/destinations/kabul.jpg';

update public.guides
set image_url = null, updated_at = now()
where coalesce(image_url, '') like '/media/peace-hope/destinations/herat.jpg';

update public.blog_posts
set image_url = null, updated_at = now()
where coalesce(image_url, '') like '/media/peace-hope/%'
  and coalesce(image_url, '') not like '%/storage/v1/object/public/%';

update public.hotels
set image_url = null, updated_at = now()
where coalesce(image_url, '') like 'https://images.unsplash.com/%';
