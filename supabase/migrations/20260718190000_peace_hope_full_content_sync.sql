-- Full Peace Hope content sync for Shah Foladi (admin-editable)
-- Rebranded copy; team/guide personal identities are not copied.

update public.packages set
      title_en = '5-Day Kabul & Bamyan Experience',
      summary_en = 'A short journey combining Kabul’s energy with Bamyan’s calm beauty.',
      description_en = 'Explore Kabul and Bamyan in 5 days. Discover Afghanistan’s capital, historic sites, and the breathtaking Buddha Valley on a short cultural adventure.

Want to join a small group instead of traveling privately? We run limited group tours throughout the year, designed for a more shared and social experience.

Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      route_label = 'Kabul • Bamyan',
      duration_days = 5,
      includes = '["Airport transfers","Private transport with driver","Local guide services","Accommodation (hotels / guesthouses)","Entry fees for planned sites","Meals as listed in the itinerary"]'::jsonb,
      excludes = '["International flights","Afghanistan visa fees","Travel insurance","Personal expenses","Optional activities not listed"]'::jsonb,
      important_notes_en = 'Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      audience_en = 'First-time visitors to Afghanistan; travelers interested in culture, history, and landscapes; photographers looking for unique and authentic scenes; those who prefer a balanced pace — not too rushed, not too slow.',
      travel_style = '{"type":"Small group or private tour","pace":"Comfortable and flexible","accommodation":"Clean local hotels / guesthouses","transport":"Private vehicle with driver"}'::jsonb,
      is_published = true,
      updated_at = now()
    where slug = 'kabul-bamyan-5-day';

update public.packages set
      title_en = '7-Day Central & Northern Journey',
      summary_en = 'Culture, history, and scenic landscapes across Afghanistan.',
      description_en = 'A week-long journey through Kabul, Bamyan, and Mazar-e-Sharif — combining cultural heritage, mountain landscapes, and the iconic Blue Mosque region of the north.

This itinerary balances city exploration with highland scenery and is suitable for first-time visitors who want a clear, well-supported introduction to Afghanistan.',
      route_label = 'Kabul • Bamyan • Mazar-e-Sharif',
      duration_days = 7,
      includes = '["Airport transfers","Private transport with driver","Local guide services","Accommodation (hotels / guesthouses)","Entry fees for planned sites","Meals as listed in the itinerary"]'::jsonb,
      excludes = '["International flights","Afghanistan visa fees","Travel insurance","Personal expenses","Optional activities not listed"]'::jsonb,
      important_notes_en = 'Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      audience_en = 'First-time visitors to Afghanistan; travelers interested in culture, history, and landscapes; photographers looking for unique and authentic scenes; those who prefer a balanced pace — not too rushed, not too slow.',
      travel_style = '{"type":"Small group or private tour","pace":"Comfortable and flexible","accommodation":"Clean local hotels / guesthouses","transport":"Private vehicle with driver"}'::jsonb,
      is_published = true,
      updated_at = now()
    where slug = 'central-northern-7-day';

update public.packages set
      title_en = '9-Day Central Afghanistan Adventure',
      summary_en = 'Mountains, lakes, and ancient sites.',
      description_en = 'Travel through central Afghanistan with time for Bamyan’s valleys and lakes plus the remote heritage of Ghor, including approaches toward the legendary Minaret of Jam region when conditions allow.

Designed for travelers who want more depth than a short capital-and-highlands trip, with a comfortable but flexible pace.',
      route_label = 'Kabul • Bamyan • Ghor',
      duration_days = 9,
      includes = '["Airport transfers","Private transport with driver","Local guide services","Accommodation (hotels / guesthouses)","Entry fees for planned sites","Meals as listed in the itinerary"]'::jsonb,
      excludes = '["International flights","Afghanistan visa fees","Travel insurance","Personal expenses","Optional activities not listed"]'::jsonb,
      important_notes_en = 'Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      audience_en = 'First-time visitors to Afghanistan; travelers interested in culture, history, and landscapes; photographers looking for unique and authentic scenes; those who prefer a balanced pace — not too rushed, not too slow.',
      travel_style = '{"type":"Small group or private tour","pace":"Comfortable and flexible","accommodation":"Clean local hotels / guesthouses","transport":"Private vehicle with driver"}'::jsonb,
      is_published = true,
      updated_at = now()
    where slug = 'central-afghanistan-9-day';

update public.packages set
      title_en = '10-Day Central & Western Expedition',
      summary_en = 'Historic cities and remote landscapes.',
      description_en = 'A ten-day expedition linking central highlands with western Afghanistan’s artistic capital, Herat — Citadel, Friday Mosque, and Timurid heritage — via Bamyan and Ghor.

Ideal for travelers who want historic cities, remote landscapes, and a broader geographic arc in one journey.',
      route_label = 'Kabul • Bamyan • Ghor • Herat',
      duration_days = 10,
      includes = '["Airport transfers","Private transport with driver","Local guide services","Accommodation (hotels / guesthouses)","Entry fees for planned sites","Meals as listed in the itinerary"]'::jsonb,
      excludes = '["International flights","Afghanistan visa fees","Travel insurance","Personal expenses","Optional activities not listed"]'::jsonb,
      important_notes_en = 'Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      audience_en = 'First-time visitors to Afghanistan; travelers interested in culture, history, and landscapes; photographers looking for unique and authentic scenes; those who prefer a balanced pace — not too rushed, not too slow.',
      travel_style = '{"type":"Small group or private tour","pace":"Comfortable and flexible","accommodation":"Clean local hotels / guesthouses","transport":"Private vehicle with driver"}'::jsonb,
      is_published = true,
      updated_at = now()
    where slug = 'central-western-10-day';

update public.packages set
      title_en = '14-Day Wakhan & Pamir Adventure',
      summary_en = 'Remote high-altitude journey.',
      description_en = 'One of the most remote and untouched journeys in the region — Wakhan Corridor and Pamir landscapes, Wakhi villages, high passes, and wild nature.

This adventure requires good fitness, flexibility, and a willingness to travel far from major cities with carefully planned logistics.',
      route_label = 'Wakhan • Pamir',
      duration_days = 14,
      includes = '["Airport transfers","Private transport with driver","Local guide services","Accommodation (hotels / guesthouses)","Entry fees for planned sites","Meals as listed in the itinerary"]'::jsonb,
      excludes = '["International flights","Afghanistan visa fees","Travel insurance","Personal expenses","Optional activities not listed"]'::jsonb,
      important_notes_en = 'Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      audience_en = 'First-time visitors to Afghanistan; travelers interested in culture, history, and landscapes; photographers looking for unique and authentic scenes; those who prefer a balanced pace — not too rushed, not too slow.',
      travel_style = '{"type":"Small group or private tour","pace":"Comfortable and flexible","accommodation":"Clean local hotels / guesthouses","transport":"Private vehicle with driver"}'::jsonb,
      is_published = true,
      updated_at = now()
    where slug = 'wakhan-pamir-14-day';

update public.packages set
      title_en = '15-Day Complete Afghanistan Journey',
      summary_en = 'Full exploration of Afghanistan.',
      description_en = 'A complete nationwide journey across major cultural and scenic regions — including Kabul, Bamyan, Ghor, Kandahar, Herat, Ghazni, Mazar-e-Sharif and surrounding areas depending on conditions.

Built for travelers who want the fullest overview of Afghanistan in a single carefully guided expedition.',
      route_label = 'Nationwide',
      duration_days = 15,
      includes = '["Airport transfers","Private transport with driver","Local guide services","Accommodation (hotels / guesthouses)","Entry fees for planned sites","Meals as listed in the itinerary"]'::jsonb,
      excludes = '["International flights","Afghanistan visa fees","Travel insurance","Personal expenses","Optional activities not listed"]'::jsonb,
      important_notes_en = 'Travel in Afghanistan is a unique experience and requires some flexibility. Routes and timings may adjust depending on local conditions to ensure safety and comfort.

We recommend modest clothing in respect of local culture. Your guide will always be there to help you feel comfortable and informed throughout the journey.',
      audience_en = 'First-time visitors to Afghanistan; travelers interested in culture, history, and landscapes; photographers looking for unique and authentic scenes; those who prefer a balanced pace — not too rushed, not too slow.',
      travel_style = '{"type":"Small group or private tour","pace":"Comfortable and flexible","accommodation":"Clean local hotels / guesthouses","transport":"Private vehicle with driver"}'::jsonb,
      is_published = true,
      updated_at = now()
    where slug = 'complete-afghanistan-15-day';

update public.services set
      title_en = 'Group & Private Tours',
      summary_en = 'Join a scheduled trip or travel privately with an itinerary built around your pace and interests.',
      description_en = 'Choose a fixed group departure or a fully private journey. We plan pacing, overnight cities, and daily highlights so your trip feels clear and comfortable from day one.',
      sort_order = 1,
      is_published = true,
      updated_at = now()
    where slug = 'group-private-tours';
update public.services set
      title_en = 'Custom Travel Planning',
      summary_en = 'We help design your journey from the ground up, based on where you want to go and how you prefer to travel.',
      description_en = 'Share your dates, interests, and comfort level. We build a route across Afghanistan (and neighboring regions when relevant) with logistics, guides, and realistic timing.',
      sort_order = 2,
      is_published = true,
      updated_at = now()
    where slug = 'custom-travel-planning';
update public.services set
      title_en = 'Transport & Local Guides',
      summary_en = 'Reliable vehicles and experienced local guides to make your travel smooth and informed.',
      description_en = 'Private vehicles with experienced drivers plus local guides who know culture, history, and on-the-ground conditions — so you travel with confidence.',
      sort_order = 3,
      is_published = true,
      updated_at = now()
    where slug = 'transport-local-guides';
update public.services set
      title_en = 'Package Tours',
      summary_en = 'Culture, history and sightseeing tours.',
      description_en = 'Curated multi-day packages covering Kabul, Bamyan, Mazar-e-Sharif, Herat, Ghor, Wakhan, and more — designed for culture, nature, and heritage.',
      sort_order = 4,
      is_published = true,
      updated_at = now()
    where slug = 'package-tours';
update public.services set
      title_en = 'Travel Support & Coordination',
      summary_en = 'From arrival to departure, we handle the details so you can focus on the experience.',
      description_en = 'Airport coordination, day-to-day adjustments, accommodation checks, and continuous communication throughout your journey.',
      sort_order = 5,
      is_published = true,
      updated_at = now()
    where slug = 'travel-support';
update public.services set
      title_en = 'Female Guide Tours',
      summary_en = 'We offer female guide tours for travelers seeking comfortable, cultural, and locally connected experiences across Afghanistan.',
      description_en = 'Women-friendly arrangements with female guide options where available, respectful pacing, and clear communication for solo travelers and groups.',
      sort_order = 6,
      is_published = true,
      updated_at = now()
    where slug = 'female-guide-tours';
update public.services set
      title_en = 'Family Packages',
      summary_en = 'Safe and comfortable family travel.',
      description_en = 'Balanced itineraries for families — shorter walking days when needed, trusted stays, and support that keeps everyone comfortable.',
      sort_order = 7,
      is_published = true,
      updated_at = now()
    where slug = 'family-packages';

insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'june-2026-10-day', '13–22 June 2026 Afghanistan Tour', '9 nights / 10 days group expedition across carefully selected Afghan regions.', '2026-06-13', '2026-06-22',
      9, 10, null, '/media/peace-hope/upcoming/june-2026-10-day.jpg', 'UPC-001', 1, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'july-2026-7-day', '5–11 July 2026 Afghanistan Tour', '6 nights / 7 days discounted group departure for summer travelers.', '2026-07-05', '2026-07-11',
      6, 7, 'Discounted price', '/media/peace-hope/upcoming/july-2026-7-day.jpg', 'UPC-002', 2, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'august-2026-10-day', '6–15 August 2026 Afghanistan Tour', '9 nights / 10 days August group journey through culture and landscapes.', '2026-08-06', '2026-08-15',
      9, 10, null, '/media/peace-hope/upcoming/august-2026-10-day.jpg', 'UPC-003', 3, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'september-2026-cross-border', '4–17 September 2026 Uzbekistan & Afghanistan', '13 nights / 14 days special cross-border journey including Uzbekistan and Afghanistan.', '2026-09-04', '2026-09-17',
      13, 14, 'Special trip including Uzbekistan & Afghanistan', '/media/peace-hope/upcoming/september-2026-cross-border.jpg', 'UPC-004', 4, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'september-2026-northern-pakistan', '18–30 September 2026 Northern Pakistan', '12 nights / 13 days special journey focused on Northern Pakistan landscapes and culture.', '2026-09-18', '2026-09-30',
      12, 13, 'Special trip of Northern Pakistan', '/media/peace-hope/destinations/panjshir.jpg', 'UPC-006', 5, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'september-2026-9-day', '19–27 September 2026 Afghanistan Tour', '8 nights / 9 days September group tour across key Afghan destinations.', '2026-09-19', '2026-09-27',
      8, 9, null, '/media/peace-hope/destinations/herat.jpg', 'UPC-007', 6, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'october-2026-7-day', '3–9 October 2026 Afghanistan Tour', '6 nights / 7 days early October group departure.', '2026-10-03', '2026-10-09',
      6, 7, null, '/media/peace-hope/destinations/kabul.jpg', 'UPC-008', 7, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'october-2026-14-day', '10–23 October 2026 Afghanistan Tour', '13 nights / 14 days in-depth October expedition across Afghanistan.', '2026-10-10', '2026-10-23',
      13, 14, null, '/media/peace-hope/upcoming/october-2026-14-day.jpg', 'UPC-005', 8, true, now()
    )
    on conflict (slug) do nothing;
insert into public.tour_departures as t
      (slug, title_en, summary_en, start_date, end_date, nights, days, badge, image_url, reference_code, sort_order, is_published, updated_at)
    values (
      'october-2026-monkeyinc', 'MonkeyInc Afghanistan Tour | 17–26 October 2026', '10 days / 9 nights partner group departure for the MonkeyInc Afghanistan Tour.', '2026-10-17', '2026-10-26',
      9, 10, 'Partner group tour', '/media/peace-hope/destinations/bamyan.jpg', 'UPC-009', 9, true, now()
    )
    on conflict (slug) do nothing;

-- FAQs are admin-managed only; never wipe or re-seed default rows in migrations.

-- Gallery is admin-managed only; never wipe or re-seed default rows in migrations.

insert into public.blog_posts as b
      (slug, title_en, excerpt_en, content_en, image_url, is_published, published_at, updated_at)
    values (
      'lifestyle-in-afghanistan-a-journey-through-culture-traditions-and-daily-life', 'Lifestyle in Afghanistan: A Journey Through Culture, Traditions, and Daily Life', 'Discover the lifestyle in Afghanistan, including its culture, tradition, hospitality, famous tourist attractions, festivals, and travel tips.', 'Lifestyle in Afghanistan: Culture, Traditions, Food & Daily Life

7-Day Central & Northern Afghanistan Journey

10-Day Central & Western Afghanistan Expedition

5–11 July, 2026 | 6 nights, 7 days | Discounted price

4–17 September, 2026 | 13 nights, 14 days | Special trip including Uzbekistan & Afghanistan

18 – 30 September, 2026 | 12 nights, 13 days | Special trip of Northern Pakistan

MonkeyInc Afghanistan Tour | 17–26 October 2026 | 10 Days / 9 Nights

3-9 October, 2026 Afghanistan Tour | 6 nights, 7 days

Afghanistan Tour | 10–23 October 2026 | 14 Days / 13 Nights

Lifestyle in Afghanistan: A Journey Through Culture, Traditions, and Daily Life

by Shahzib Farahmand | Jun 30, 2026 | Uncategorized | 0 comments

Afghanistan is a land of breathtaking mountains, ancient cities, vibrant traditions, and warm hospitality. While many people know the country because of its history, Afghanistan offers visitors a much deeper story—one filled with rich culture, delicious cuisine, centuries-old traditions, and resilient communities.

Whether you are planning a future trip or simply exploring the country''s heritage, understanding the Afghan lifestyle provides a unique glimpse into one of Central Asia''s most fascinating destinations.

Life in Afghanistan revolves around family, community, and tradition. Most people begin their day early, with daily routines often influenced by work, education, farming, local businesses, and religious practices.

In major cities like Kabul, Herat, and Mazar-i-Sharif, modern life blends with traditional customs. You''ll find busy markets, universities, restaurants, and shopping areas alongside historic architecture and centuries-old bazaars. In rural villages, life remains closely connected to agriculture and local traditions that have been passed down through generations.

Afghan Hospitality: A Tradition Like No Other

One of Afghanistan''s greatest treasures is its hospitality. Guests are treated with exceptional respect and generosity. It is common for visitors to be welcomed with green tea, fresh fruits, nuts, and homemade Afghan meals.

Hospitality is deeply rooted in Afghan culture, making travelers feel welcomed and appreciated wherever they go.

Afghan cuisine is famous for its rich flavors, aromatic spices, and fresh ingredients. Every region has its own specialties, but several dishes are enjoyed throughout the country.

Some of the most popular Afghan foods include:

Kabuli Palaw (Afghanistan''s national rice dish)

Mantu (Steamed dumplings filled with meat)

Tea is an important part of Afghan culture and is commonly served during family gatherings and social visits.

Traditional Afghan clothing reflects both beauty and practicality.

Men commonly wear the Perahan Tunban, often paired with a waistcoat or traditional cap. Women''s traditional dresses feature colorful embroidery, beautiful fabrics, and handcrafted designs that showcase Afghanistan''s diverse cultural heritage. Clothing styles vary across different provinces and ethnic communities.

Afghanistan has been a crossroads of civilizations for thousands of years. The country''s culture reflects influences from Central Asia, South Asia, and the Middle East.

Afghanistan is also the birthplace of the world-famous Persian poet Jalal ad-Din Rumi, whose works continue to inspire millions around the globe.

Although tourism remains limited today, Afghanistan is home to many incredible historical and natural attractions.

Some of the country''s most famous places include:

These destinations showcase Afghanistan''s natural beauty and historical significance.

Afghans celebrate many religious and cultural events throughout the year. Family gatherings, traditional foods, music, and community celebrations are central to these occasions.

Sports play an important role in Afghan society.

Cricket has become especially popular over the past two decades, with Afghanistan gaining international recognition through its national team.

Traditional bazaars are among the best places to experience local culture. Visitors can shop for:

These markets provide an authentic glimpse into everyday Afghan life.

The most comfortable seasons for travel are spring (March to May) and autumn (September to November), when temperatures are generally mild and landscapes are especially beautiful.

Travel conditions and accessibility can vary significantly, so visitors should always check the latest travel advisories and local conditions before planning a trip.

If you are considering visiting Afghanistan:

Research current travel conditions before your trip.

Learn a few basic Dari or Pashto greetings.',
      '/media/peace-hope/destinations/kabul.jpg', true, now(), now()
    )
    on conflict (slug) do nothing;
insert into public.blog_posts as b
      (slug, title_en, excerpt_en, content_en, image_url, is_published, published_at, updated_at)
    values (
      'afghan-food-guide-for-travelers', 'Afghan Food Guide for Travelers', 'Discover Afghan cuisine: Kabuli Pulao,mantu, ashak, naan, tea culture, food etiquette, and practical food safety tips in Afghanistan.', 'Afghan Food Guide for Travelers | Shah Foladi Travel Agency

7-Day Central & Northern Afghanistan Journey

10-Day Central & Western Afghanistan Expedition

5–11 July, 2026 | 6 nights, 7 days | Discounted price

4–17 September, 2026 | 13 nights, 14 days | Special trip including Uzbekistan & Afghanistan

18 – 30 September, 2026 | 12 nights, 13 days | Special trip of Northern Pakistan

MonkeyInc Afghanistan Tour | 17–26 October 2026 | 10 Days / 9 Nights

3-9 October, 2026 Afghanistan Tour | 6 nights, 7 days

Afghanistan Tour | 10–23 October 2026 | 14 Days / 13 Nights

by Shahzib Farahmand | May 23, 2026 | Uncategorized | 0 comments

Traveling in Afghanistan is not only about mountains, history, and culture it is also about food.

Afghan cuisine is simple, fresh, and full of flavor. It reflects the country’s traditions,

hospitality, and love for sharing meals with guests.

When you travel with Shah Foladi Travel Agency , food becomes an important

part of your experience. Afghan people often welcome guests with tea, bread,

and traditional meals as a sign of respect and kindness.

This guide will help you understand Afghan food culture, what dishes to try,

Based on rice, meat, bread, and fresh ingredients

Influenced by Central Asia, Persia, and South Asia

Kabuli Pulao – Afghanistan’s National Dish

Kabuli Pulao is Afghanistan’s most famous traditional dish.

It is made with basmati rice, lamb or beef, carrots, raisins,

The flavor is mild, slightly sweet, and very popular during family gatherings

Afghan kebabs are grilled over fire and served with fresh naan,

Mantu are steamed dumplings filled with minced meat and topped

with yogurt, tomato sauce, dried mint, or lentils.

Ashak is a popular dumpling dish filled with leeks or green onions,

usually served with yogurt sauce and sometimes meat sauce.

Fresh naan is served with almost every Afghan meal.

It is baked in traditional clay ovens and has a soft inside

Tea is an important part of Afghan hospitality.

Guests are almost always offered tea in homes, shops, and restaurants.

Qorma – Slow cooked meat dish with spices

Shorwa – Traditional soup with vegetables and meat

Fresh Salads – Tomatoes, cucumbers, onions

Use your right hand when eating traditionally

Afghan food is more than just a meal  it is part of the country’s culture,

hospitality, and traditions. For many travelers, food becomes one of the most

Your email address will not be published. Required fields are marked *

Save my name, email, and website in this browser for the next time I comment.',
      '/media/peace-hope/destinations/kabul.jpg', true, now(), now()
    )
    on conflict (slug) do nothing;
insert into public.blog_posts as b
      (slug, title_en, excerpt_en, content_en, image_url, is_published, published_at, updated_at)
    values (
      'afghanistan-e-visa-guide-2026', 'Afghanistan e-Visa Guide (2026)', 'Complete Afghanistan e-Visa guide for 2026. Learn visa requirements, application steps needed, how apply Afghanistan tourist visa easily.', 'Afghanistan e-Visa Guide 2026 | Requirements & Process

7-Day Central & Northern Afghanistan Journey

10-Day Central & Western Afghanistan Expedition

5–11 July, 2026 | 6 nights, 7 days | Discounted price

4–17 September, 2026 | 13 nights, 14 days | Special trip including Uzbekistan & Afghanistan

18 – 30 September, 2026 | 12 nights, 13 days | Special trip of Northern Pakistan

MonkeyInc Afghanistan Tour | 17–26 October 2026 | 10 Days / 9 Nights

3-9 October, 2026 Afghanistan Tour | 6 nights, 7 days

Afghanistan Tour | 10–23 October 2026 | 14 Days / 13 Nights

by Shahzib Farahmand | Apr 28, 2026 | Uncategorized | 0 comments

Complete travel visa information for Afghanistan tourists

Afghanistan now has an online visa system that makes it easier for travelers to apply before their trip. You no longer need to visit an embassy in most cases. Everything is done online.

This system is still new, but many travelers are already using it successfully.

The Afghanistan e-Visa is a digital visa you apply for on the internet. If approved, you receive it by email and can use it to enter the country.

It is made for tourists who want to visit Afghanistan for a short stay.

Here are the basic details you should know:

Apply online through the official website

Express option is available for faster processing

Entry must be within 90 days after visa is issued

Entry point: Kabul International Airport only (for now)

You must enter Afghanistan before your visa expires .

The application is simple and can be done from your phone or computer.

You can move back and forth in the form if you need to correct something.

Hotel booking or address in Afghanistan (if asked)

Make sure your documents are clear and easy to read.

Check your passport number and dates carefully

You can enter anytime within visa validity

Write simple answers (avoid symbols or special characters if possible)

If you are coming with a tour company, you may also be asked if you have a sponsor.

You will get an email with a payment link

Express service may cost extra but is faster

Payment can be done online with card or Apple Pay (if available)

You can enter only through Kabul International Airport

Airport staff will guide you through immigration

After finishing the process, you exit the terminal

Your guide or driver will meet you outside

If you do not want to use the online system, you can also apply through an Afghan embassy.

Passport, photos, and documents are required

We can help you with the invitation letter and guidance if needed.

The new e-Visa system is making travel to Afghanistan easier than before. It is simple, fast, and fully online.',
      '/media/peace-hope/destinations/kabul.jpg', true, now(), now()
    )
    on conflict (slug) do nothing;
insert into public.blog_posts as b
      (slug, title_en, excerpt_en, content_en, image_url, is_published, published_at, updated_at)
    values (
      'travel-tips-for-visiting-afghanistan', 'Travel Tips for Visiting Afghanistan', 'Essential travel tips for visiting Afghanistan in 2026. Learn about safety, culture, transport, packing, and useful advice for a smooth trip.', 'Travel Tips for Visiting Afghanistan | Safety & Guide 2026

7-Day Central & Northern Afghanistan Journey

10-Day Central & Western Afghanistan Expedition

5–11 July, 2026 | 6 nights, 7 days | Discounted price

4–17 September, 2026 | 13 nights, 14 days | Special trip including Uzbekistan & Afghanistan

18 – 30 September, 2026 | 12 nights, 13 days | Special trip of Northern Pakistan

MonkeyInc Afghanistan Tour | 17–26 October 2026 | 10 Days / 9 Nights

3-9 October, 2026 Afghanistan Tour | 6 nights, 7 days

Afghanistan Tour | 10–23 October 2026 | 14 Days / 13 Nights

by Shahzib Farahmand | Apr 28, 2026 | Uncategorized | 0 comments

Culture • Entry Rules • Safety • Practical Guidance

Afghanistan is a country rich in history, deep traditions, and genuine hospitality. Traveling here offers a unique opportunity to experience authentic culture, breathtaking landscapes, and meaningful human connections.

To help you prepare for your journey, we have collected important travel information about local customs, entry requirements, safety, and practical tips. This guide will help you travel smoothly, respectfully, and confidently throughout your visit.

Afghanistan is an Islamic country where religion plays an important role in everyday life. Therefore, visitors should respect local customs, traditions, and social values at all times.

While traveling, behave respectfully in public places and remain mindful of cultural sensitivities. In addition, avoid actions or behavior that may be considered offensive to local communities.

Respect for local traditions will not only help you travel more comfortably, but it will also create more positive interactions with local people.

Modest clothing is strongly recommended throughout your trip.

Wear loose-fitting clothing that covers arms and legs

Comfortable and modest outfits work best for both culture and climate

Wear clothing that covers shoulders and legs

Although traditional Afghan clothing is optional, many travelers choose to wear it because locals appreciate the gesture. It also helps visitors connect more naturally with the culture. If needed, our team can assist you in purchasing local outfits during your stay.

To stay healthy and comfortable during your trip, follow these simple recommendations:

Alcohol and pork products are prohibited in Afghanistan

Avoid accepting opened drinks from strangers

Wash hands regularly and eat from trusted restaurants or hotels

During the holy month of Ramadan, avoid eating, drinking, or smoking in public during daylight hours. This shows respect for local customs and religious practices.

Throughout your journey, our team will guide you and help ensure your comfort, privacy, and safety.

Afghanistan offers incredible opportunities for photography , from dramatic mountains to vibrant local markets. However, respectful photography is essential.

Please keep the following guidelines in mind:

Do not photograph military sites or government buildings

Always ask permission before photographing local people

Be especially respectful when taking photos of women and families

Follow your guide’s advice regarding safe photography locations

With the support of our guides, you can capture meaningful memories while respecting local culture and security considerations.

The local currency is the Afghan Afghani (AFN). However, US Dollars and Euros are also commonly accepted in many places.

Because banking and ATM services are limited, travelers should prepare cash before arrival.

Bring clean and newer USD $100 or €100 notes

Older or damaged bills may receive lower exchange rates

Carry enough cash for personal expenses during your trip

Our team can also assist you with safe and reliable currency exchange during your stay.',
      '/media/peace-hope/destinations/kabul.jpg', true, now(), now()
    )
    on conflict (slug) do nothing;
insert into public.blog_posts as b
      (slug, title_en, excerpt_en, content_en, image_url, is_published, published_at, updated_at)
    values (
      'is-it-safe-to-travel-to-afghanistan-in-2026', 'Is It Safe to Travel to Afghanistan in 2026?', 'Is it safe to travel to Afghanistan in 2026? Read this updated safety guide covering travel conditions, entry requirements adn cultural.', 'Is It Safe to Travel to Afghanistan in 2026? Safety Guide & Tips

7-Day Central & Northern Afghanistan Journey

10-Day Central & Western Afghanistan Expedition

5–11 July, 2026 | 6 nights, 7 days | Discounted price

4–17 September, 2026 | 13 nights, 14 days | Special trip including Uzbekistan & Afghanistan

18 – 30 September, 2026 | 12 nights, 13 days | Special trip of Northern Pakistan

MonkeyInc Afghanistan Tour | 17–26 October 2026 | 10 Days / 9 Nights

3-9 October, 2026 Afghanistan Tour | 6 nights, 7 days

Afghanistan Tour | 10–23 October 2026 | 14 Days / 13 Nights

Is It Safe to Travel to Afghanistan in 2026?

by Shahzib Farahmand | Apr 28, 2026 | Uncategorized | 0 comments

Is It Safe to Travel to Afghanistan in 2026?

Honest travel insights, experience, and guidance for Afghanistan tourism

This is the first question almost every traveler asks and it’s a fair one.

The reality today is very different from what many people imagine. In recent years, things have become much calmer across the country, and travel is now possible in many regions.

We’ve personally hosted a lot of travelers who have explored Afghanistan with us and had smooth, positive experiences.

When people arrive, they’re often surprised. Life feels normal in many places, and you can travel between cities and visit some of the country’s most beautiful spots.

All Destinations like Bamyan Valley, Herat, Mazar Sharif, Ghazni, Kandahar, Panjshir, Nuristan, Kabul and any other destinations are peaceful, open, and welcoming to visitors.

Travel here is not about coming alone and figuring things out. The best way to experience Afghanistan is with a local team that knows the country well.

We take care of the planning, transport, and guidance, so you can focus on enjoying the journey. From the moment you arrive until you leave, everything is organized and managed.

Afghanistan is a welcoming place, and respecting local culture helps create a positive experience.

These are small things, but they help you connect better with people and enjoy your trip more.

Many of our guests come with questions and a bit of uncertainty but they leave with a completely different view.

They talk about the kindness of people, the beauty of the landscapes, and how unique the whole experience feels.

Afghanistan is not a typical tourist place, and that’s exactly what makes it special.

If you come with an open mind, respect the culture, and travel with the right people, you’ll find it to be an unforgettable journey.

If you’re thinking about visiting, we’re here to help you plan it in a simple and comfortable way.

Your email address will not be published. Required fields are marked *

Save my name, email, and website in this browser for the next time I comment.

Lifestyle in Afghanistan: A Journey Through Culture, Traditions, and Daily Life

Is It Safe to Travel to Afghanistan in 2026?',
      '/media/peace-hope/destinations/kabul.jpg', true, now(), now()
    )
    on conflict (slug) do nothing;

-- Team members are admin-managed only; never wipe or re-seed default rows in migrations.

-- Guides are admin-managed only; never wipe or re-seed default rows in migrations.

update public.site_settings set
    about_teaser_en = 'Shah Foladi Travel Agency offers travelers the opportunity to visit Afghanistan with clear planning and local expertise. We are a local travel team based in Afghanistan. We work with travelers who want to explore the country in a safe, organized, and meaningful way. Our focus is simple: to make travel in Afghanistan clear, comfortable, and well planned without losing the real experience of being here.',
    why_us = '[{"title":"Expert Local Guides","body":"Knowledgeable guides who bring culture, history, and place to life."},{"title":"Safety and Comfort","body":"Carefully planned routes, vetted stays, and attentive on-ground support."},{"title":"Authentic Experiences","body":"Real hospitality, markets, landscapes, and everyday Afghan life."},{"title":"Commitment to Sustainability","body":"Respectful travel that supports communities and responsible tourism."}]'::jsonb,
    testimonials = '[{"quote":"Our Afghanistan cultural tour was unforgettable. The team handled transport, local guides, and security professionally. We explored Kabul, Bamiyan, and Herat with confidence.","name":"James","country":"UK"},{"quote":"One of the best Afghanistan travel experiences we’ve had. The guides were knowledgeable about Afghan culture, history, and local traditions. Everything was well organized.","name":"Sofia","country":"Germany"},{"quote":"Our Afghanistan guide made the journey smooth and enjoyable. From the mountains of Bamiyan to the streets of Kabul, we always felt supported and informed.","name":"Daniel","country":"Canada"},{"quote":"Absolutely recommended. Excellent service, reliable transport, and authentic local experiences for anyone planning Afghanistan tourism.","name":"Maria","country":"Spain"}]'::jsonb
  where id = 1;
update public.destinations set summary_en = 'Gardens of Babur, the National Museum, Bird Market, and sunset views from Bibi Mahroo Hill.', is_published = true, updated_at = now() where slug = 'kabul';
update public.destinations set summary_en = 'Valley of the Gods — Buddha niches, Band-e-Amir lakes, Shahr-e Gholghola, and the Red City of Zohak.', is_published = true, updated_at = now() where slug = 'bamyan';
update public.destinations set summary_en = 'Valley of the Gods — Buddha niches, Band-e-Amir lakes, Shahr-e Gholghola, and the Red City of Zohak.', is_published = true, updated_at = now() where slug = 'bamiyan';
update public.destinations set summary_en = 'An artistic historic city shaped by Persian culture — Citadel, Friday Mosque, and Musalla Complex.', is_published = true, updated_at = now() where slug = 'herat';
update public.destinations set summary_en = 'One of Afghanistan’s oldest cities — Khirqa Sharif, Old City streets, and famous fruit markets.', is_published = true, updated_at = now() where slug = 'kandahar';
update public.destinations set summary_en = 'A breathtaking valley of rivers, mountain views, and traditional villages.', is_published = true, updated_at = now() where slug = 'panjshir';
update public.destinations set summary_en = 'Spiritual beauty and blue architecture — Blue Mosque, bazaars, and nearby Balkh ruins.', is_published = true, updated_at = now() where slug = 'mazar-e-sharif';
update public.destinations set summary_en = 'One of the world’s most remote corridors — Pamirs, Wakhi villages, and wild nature.', is_published = true, updated_at = now() where slug = 'wakhan';
update public.destinations set summary_en = 'A city of empires — minarets, citadel, and ancient Islamic heritage.', is_published = true, updated_at = now() where slug = 'ghazni';
update public.destinations set summary_en = 'Remote history and nature — Minaret of Jam (UNESCO), valleys, and ancient sites.', is_published = true, updated_at = now() where slug = 'ghor';
update public.destinations set summary_en = 'Mountains, rivers, and adventure along the Pamir Range and Panj River.', is_published = true, updated_at = now() where slug = 'badakhshan';
update public.destinations set summary_en = 'A hidden green world of forests, mountain villages, and Pech Valley.', is_published = true, updated_at = now() where slug = 'nuristan';
update public.destinations set summary_en = 'Gardens, the Kabul River, and lively markets in a warm eastern city.', is_published = true, updated_at = now() where slug = 'jalalabad';
update public.destinations set summary_en = 'Desert landscapes and ancient civilization — Helmand River and Bost Citadel.', is_published = true, updated_at = now() where slug = 'helmand';