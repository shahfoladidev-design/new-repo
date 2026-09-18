-- Singleton About Us page — admin-owned source of truth (EN / Dari / Pashto).
-- Public site and homepage teaser both read from this single row.

create table if not exists public.about_page (
  id integer primary key default 1 check (id = 1),
  hero_image_url text,
  title_en text not null default '',
  title_dari text,
  title_pashto text,
  intro_en text not null default '',
  intro_dari text,
  intro_pashto text,
  who_we_are_en text not null default '',
  who_we_are_dari text,
  who_we_are_pashto text,
  approach_en text not null default '',
  approach_dari text,
  approach_pashto text,
  purpose_en text not null default '',
  purpose_dari text,
  purpose_pashto text,
  where_we_operate_en text not null default '',
  where_we_operate_dari text,
  where_we_operate_pashto text,
  working_with_us_en text not null default '',
  working_with_us_dari text,
  working_with_us_pashto text,
  meta_title_en text,
  meta_title_dari text,
  meta_title_pashto text,
  meta_description_en text,
  meta_description_dari text,
  meta_description_pashto text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.about_page enable row level security;

drop policy if exists "Public read published about page" on public.about_page;
create policy "Public read published about page"
  on public.about_page
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins manage about page" on public.about_page;
create policy "Admins manage about page"
  on public.about_page
  for all
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

grant select on public.about_page to anon, authenticated;
grant select, insert, update, delete on public.about_page to authenticated;
revoke insert, update, delete, truncate, references, trigger on public.about_page from anon;

insert into public.about_page (
  id,
  title_en, title_dari, title_pashto,
  intro_en, intro_dari, intro_pashto,
  who_we_are_en, who_we_are_dari, who_we_are_pashto,
  approach_en, approach_dari, approach_pashto,
  purpose_en, purpose_dari, purpose_pashto,
  where_we_operate_en, where_we_operate_dari, where_we_operate_pashto,
  working_with_us_en, working_with_us_dari, working_with_us_pashto,
  meta_title_en, meta_title_dari, meta_title_pashto,
  meta_description_en, meta_description_dari, meta_description_pashto,
  is_published
) values (
  1,
  'About Shah Foladi',
  'درباره شاه فولادی',
  'د شاه فولادی په اړه',
  'Shah Foladi is a local Afghanistan travel agency and tour guide service. We help travelers explore the country with clear planning, trusted partners, and experienced guides on the ground.',
  'شاه فولادی یک آژانس مسافرتی محلی و خدمات راهنمای تور در افغانستان است. ما به مسافران کمک می‌کنیم کشور را با برنامه‌ریزی روشن، شریکان مورد اعتماد و راهنمایان با تجربه در صحنه کشف کنند.',
  'شاه فولادی د افغانستان یوه محلي سفر اداره او لارښود خدمت دی. موږ مسافرو ته مرسته کوو چې هیواد په روښانه پلان، باوري شریکانو او تجربه لرونکو لارښودانو سره وپلټي.',
  'We are a local team based in Afghanistan. We work with travelers who want to see the country in a safe, organized, and meaningful way — with people who know the routes, the seasons, and the places firsthand.',
  'ما یک تیم محلی مستقر در افغانستان هستیم. با مسافرانی کار می‌کنیم که می‌خواهند کشور را به‌صورت ایمن، منظم و معنادار ببینند — با کسانی که مسیرها، فصل‌ها و مکان‌ها را از نزدیک می‌شناسند.',
  'موږ په افغانستان کې میشته یو محلي ټیم یو. موږ له هغو مسافرو سره کار کوو چې غواړي هیواد په خوندي، منظم او معناداره ډول وګوري — له هغو خلکو سره چې لارې، موسمونه او ځایونه له نږدې پیژني.',
  'Our approach is practical and careful: realistic itineraries, vetted stays and transport, clear communication before you travel, and attentive support once you arrive. We balance culture, landscapes, and rest so journeys feel well paced — not rushed.',
  'رویکرد ما عملی و دقیق است: برنامه‌های واقع‌بینانه، اقامت و حمل‌ونقل تأییدشده، ارتباط روشن پیش از سفر، و پشتیبانی دقیق پس از ورود. فرهنگ، مناظر و استراحت را متعادل می‌کنیم تا سفر شتاب‌زده نباشد.',
  'زموږ چلند عملي او محتاط دی: واقع‌بین سفر پلانونه، تایید شوي استوګنځایونه او ترانسپورت، مخکې له سفره روښانه اړیکه، او له رسېدو وروسته دقیق ملاتړ. موږ کلتور، منظرې او آرامتیا انډول کوو ترڅو سفر بې‌ځایه عجله نه وي.',
  'Our purpose is respectful, responsible tourism. We want visitors to experience Afghanistan with warmth and professionalism, while supporting the communities and people who make travel possible.',
  'هدف ما گردشگری محترمانه و مسئولانه است. می‌خواهیم بازدیدکنندگان افغانستان را با گرمی و حرفه‌ای‌گری تجربه کنند و هم‌زمان از جوامع و افرادی که سفر را ممکن می‌سازند حمایت شود.',
  'زموږ موخه درناوی او مسؤلیت‌منه سیاحت ده. موږ غواړو لیدونکي افغانستان په تودوخه او مسلکیتوب تجربه کړي، او هغه ټولنې او خلک ملاتړ شي چې سفر ممکن کوي.',
  'We operate across key regions including Kabul, Bamyan, Mazar-e-Sharif, Herat, and other areas when conditions allow. Exact routes are confirmed with you based on season, safety, and your interests.',
  'ما در مناطق کلیدی از جمله کابل، بامیان، مزارشریف، هرات و در صورت امکان مناطق دیگر فعالیت می‌کنیم. مسیر دقیق بر اساس فصل، ایمنی و علاقه‌های شما با شما تأیید می‌شود.',
  'موږ په مهمو سیمو لکه کابل، بامیان، مزارشریف، هرات او نورو سیمو کې کار کوو کله چې شرایط اجازه ورکړي. دقیقې لارې د موسم، خوندیتوب او ستاسو د علاقې پر بنسټ له تاسو سره تایید کیږي.',
  'Whether you join a group departure or prefer a private journey, we guide you step by step — from first message to booking confirmation and on-ground support. Tell us what you want to see; we will shape a clear plan.',
  'چه به تور گروهی بپیوندید و چه سفر خصوصی بخواهید، گام‌به‌گام راهنمایی‌تان می‌کنیم — از پیام اول تا تأیید رزرو و پشتیبانی میدانی. بگویید چه می‌خواهید ببینید؛ برنامه روشنی می‌چینیم.',
  'که تاسو ډله‌ییز سفر غوره کړئ یا خصوصي سفر، موږ مو ګام په ګام لارښوونه کوو — له لومړي پیغام څخه تر ریزرو تایید او په ځمکه ملاتړ پورې. ووایاست څه غواړئ وګورئ؛ موږ روښانه پلان جوړوو.',
  'About Shah Foladi Travel',
  'درباره شاه فولادی',
  'د شاه فولادی په اړه',
  'Learn about Shah Foladi — a local Afghanistan travel agency and tour guide service with clear planning and on-ground expertise.',
  'درباره شاه فولادی — آژانس مسافرتی محلی افغانستان با برنامه‌ریزی روشن و تخصص میدانی.',
  'د شاه فولادی په اړه زده کړئ — د افغانستان محلي سفر اداره د روښانه پلان او په ځمکه تخصص سره.',
  true
)
on conflict (id) do nothing;
