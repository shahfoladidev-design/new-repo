-- Backfill empty Dari/Pashto from English so admin fields and locales are never blank.
-- Public site already falls back to English; this gives editable starting defaults.

-- Legal agreements (visa invitation + guide license)
update public.legal_documents
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  content_dari = coalesce(nullif(trim(content_dari), ''), content_en),
  content_pashto = coalesce(nullif(trim(content_pashto), ''), content_en);

-- FAQs
update public.faqs
set
  question_dari = coalesce(nullif(trim(question_dari), ''), question_en),
  question_pashto = coalesce(nullif(trim(question_pashto), ''), question_en),
  answer_dari = coalesce(nullif(trim(answer_dari), ''), answer_en),
  answer_pashto = coalesce(nullif(trim(answer_pashto), ''), answer_en);

-- Blog
update public.blog_posts
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  excerpt_dari = coalesce(nullif(trim(excerpt_dari), ''), excerpt_en),
  excerpt_pashto = coalesce(nullif(trim(excerpt_pashto), ''), excerpt_en),
  content_dari = coalesce(nullif(trim(content_dari), ''), content_en),
  content_pashto = coalesce(nullif(trim(content_pashto), ''), content_en);

-- Packages
update public.packages
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  summary_dari = coalesce(nullif(trim(summary_dari), ''), summary_en),
  summary_pashto = coalesce(nullif(trim(summary_pashto), ''), summary_en),
  description_dari = coalesce(nullif(trim(description_dari), ''), description_en),
  description_pashto = coalesce(nullif(trim(description_pashto), ''), description_en),
  audience_dari = coalesce(nullif(trim(audience_dari), ''), audience_en),
  audience_pashto = coalesce(nullif(trim(audience_pashto), ''), audience_en),
  important_notes_dari = coalesce(nullif(trim(important_notes_dari), ''), important_notes_en),
  important_notes_pashto = coalesce(nullif(trim(important_notes_pashto), ''), important_notes_en);

-- Package day-by-day itinerary
update public.package_days
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  body_dari = coalesce(nullif(trim(body_dari), ''), body_en),
  body_pashto = coalesce(nullif(trim(body_pashto), ''), body_en);

-- Destinations
update public.destinations
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  summary_dari = coalesce(nullif(trim(summary_dari), ''), summary_en),
  summary_pashto = coalesce(nullif(trim(summary_pashto), ''), summary_en),
  description_dari = coalesce(nullif(trim(description_dari), ''), description_en),
  description_pashto = coalesce(nullif(trim(description_pashto), ''), description_en);

-- Destination attractions
update public.destination_attractions
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  summary_dari = coalesce(nullif(trim(summary_dari), ''), summary_en),
  summary_pashto = coalesce(nullif(trim(summary_pashto), ''), summary_en);

-- Services
update public.services
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  summary_dari = coalesce(nullif(trim(summary_dari), ''), summary_en),
  summary_pashto = coalesce(nullif(trim(summary_pashto), ''), summary_en),
  description_dari = coalesce(nullif(trim(description_dari), ''), description_en),
  description_pashto = coalesce(nullif(trim(description_pashto), ''), description_en);

-- Team roles / bios
update public.team_members
set
  role_dari = coalesce(nullif(trim(role_dari), ''), role_en),
  role_pashto = coalesce(nullif(trim(role_pashto), ''), role_en),
  bio_dari = coalesce(nullif(trim(bio_dari), ''), bio_en),
  bio_pashto = coalesce(nullif(trim(bio_pashto), ''), bio_en);

-- Upcoming tours
update public.tour_departures
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  summary_dari = coalesce(nullif(trim(summary_dari), ''), summary_en),
  summary_pashto = coalesce(nullif(trim(summary_pashto), ''), summary_en);

-- Hero slides
update public.hero_slides
set
  title_dari = coalesce(nullif(trim(title_dari), ''), title_en),
  title_pashto = coalesce(nullif(trim(title_pashto), ''), title_en),
  subtitle_dari = coalesce(nullif(trim(subtitle_dari), ''), subtitle_en),
  subtitle_pashto = coalesce(nullif(trim(subtitle_pashto), ''), subtitle_en);

-- Site settings copy
update public.site_settings
set
  about_teaser_dari = coalesce(nullif(trim(about_teaser_dari), ''), about_teaser_en),
  about_teaser_pashto = coalesce(nullif(trim(about_teaser_pashto), ''), about_teaser_en),
  address_dari = coalesce(nullif(trim(address_dari), ''), address_en),
  address_pashto = coalesce(nullif(trim(address_pashto), ''), address_en),
  payment_instructions_dari = coalesce(nullif(trim(payment_instructions_dari), ''), payment_instructions_en),
  payment_instructions_pashto = coalesce(nullif(trim(payment_instructions_pashto), ''), payment_instructions_en)
where id = 1;
