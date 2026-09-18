import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { CMS_CACHE_SECONDS } from "@/lib/cache-config";
import type { NavTourItem } from "@/lib/nav-types";
import type { CatalogItem } from "@/lib/catalog-search";
import type { BookingOfferOption } from "@/lib/booking-offers";
import type { HeroSlide } from "@/components/hero-carousel";
import { placeholderPackages } from "@/lib/content";
import { mergePlaceholdersWithCatalogPrices } from "@/lib/catalog-price-display";
import { devPlaceholdersEnabled } from "@/lib/dev-placeholders";
import { resolveUpcomingTourPrices } from "@/lib/payments/catalog-price";
import { parseCatalogPrice } from "@/lib/package-tiers";
import { isUsableImageUrl } from "@/lib/cms-media";
import { toUrlSlug } from "@/lib/slug";

export type NavCatalog = {
  packages: NavTourItem[];
  upcoming: NavTourItem[];
  destinations: NavTourItem[];
  catalog: CatalogItem[];
};

async function fetchNavCatalog(): Promise<NavCatalog> {
  try {
    const supabase = createPublicClient();
    const [{ data: packageRows }, { data: upcomingRows }, { data: destinationRows }] =
      await Promise.all([
        supabase
          .from("packages")
          .select(
            "slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, route_label, duration_days, price_from, price_currency, province_slug",
          )
          .eq("is_published", true)
          .order("duration_days", { ascending: true }),
        supabase
          .from("tour_departures")
          .select(
            "slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, days, badge, price_from, price_currency, package_id",
          )
          .eq("is_published", true)
          .order("start_date", { ascending: true }),
        supabase
          .from("destinations")
          .select("slug, title_en, title_dari, title_pashto, summary_en")
          .eq("is_published", true)
          .order("title_en"),
      ]);

    const packages: NavTourItem[] = (packageRows ?? []).map((row) => ({
      slug: row.slug,
      href: `/packages/${toUrlSlug(row.slug)}`,
      title_en: row.title_en,
      title_dari: row.title_dari,
      title_pashto: row.title_pashto,
      summary_en: row.summary_en,
      summary_dari: row.summary_dari,
      summary_pashto: row.summary_pashto,
      route_label: row.route_label,
      duration_days: row.duration_days,
      price_from: row.price_from,
      price_currency: row.price_currency ?? "USD",
    }));
    const upcoming: NavTourItem[] = (upcomingRows ?? []).map((row) => ({
      slug: row.slug,
      href: "/upcoming-tours",
      title_en: row.title_en,
      title_dari: row.title_dari,
      title_pashto: row.title_pashto,
      summary_en: row.summary_en,
      summary_dari: row.summary_dari,
      summary_pashto: row.summary_pashto,
      route_label: row.badge,
      duration_days: row.days,
    }));
    const destinations: NavTourItem[] = (destinationRows ?? []).map((row) => ({
      slug: row.slug,
      href: `/destinations/${toUrlSlug(row.slug)}`,
      title_en: row.title_en,
      title_dari: row.title_dari,
      title_pashto: row.title_pashto,
      summary_en: row.summary_en,
    }));

    const upcomingPrices = await resolveUpcomingTourPrices(supabase, upcomingRows ?? []);

    const catalog: CatalogItem[] = [
      ...(packageRows ?? []).map(
        (row): CatalogItem => ({
          kind: "package",
          slug: row.slug,
          title_en: row.title_en,
          title_dari: row.title_dari,
          title_pashto: row.title_pashto,
          summary_en: row.summary_en,
          summary_dari: row.summary_dari,
          summary_pashto: row.summary_pashto,
          href: `/packages/${toUrlSlug(row.slug)}`,
          price_from: row.price_from,
          price_currency: row.price_currency ?? "USD",
          duration_days: row.duration_days,
          province_slug: row.province_slug,
          route_label: row.route_label,
        }),
      ),
      ...(upcomingRows ?? []).map((row): CatalogItem => {
        const price = upcomingPrices.get(row.slug);
        return {
          kind: "upcoming",
          slug: row.slug,
          title_en: row.title_en,
          title_dari: row.title_dari,
          title_pashto: row.title_pashto,
          summary_en: row.summary_en,
          summary_dari: row.summary_dari,
          summary_pashto: row.summary_pashto,
          href: "/upcoming-tours",
          price_from: price?.price_from ?? null,
          price_currency: price?.price_currency ?? null,
          duration_days: row.days,
          route_label: row.badge,
        };
      }),
      ...(destinationRows ?? []).map(
        (row): CatalogItem => ({
          kind: "destination",
          slug: row.slug,
          title_en: row.title_en,
          title_dari: row.title_dari,
          title_pashto: row.title_pashto,
          summary_en: row.summary_en,
          href: `/destinations/${toUrlSlug(row.slug)}`,
        }),
      ),
    ];

    return { packages, upcoming, destinations, catalog };
  } catch {
    return { packages: [], upcoming: [], destinations: [], catalog: [] };
  }
}

const getCachedNavCatalogInner = unstable_cache(fetchNavCatalog, ["cms-nav-catalog"], {
  revalidate: CMS_CACHE_SECONDS,
  tags: [CACHE_TAGS.nav, CACHE_TAGS.packages, CACHE_TAGS.destinations, CACHE_TAGS.upcoming, CACHE_TAGS.all],
});

export const getCachedNavCatalog = cache(() => getCachedNavCatalogInner());

export type HomepageContent = {
  packages: Array<{
    slug: string;
    title_en: string;
    title_dari?: string | null;
    title_pashto?: string | null;
    summary_en?: string | null;
    summary_dari?: string | null;
    summary_pashto?: string | null;
    image_url?: string | null;
    route_label?: string | null;
    duration_days?: number | null;
    price_from?: number | null;
    price_currency?: string | null;
  }>;
  heroSlides: HeroSlide[];
  gallery: Array<{ image_url: string; title_en?: string | null; location_tag?: string | null }>;
  services: Array<{
    slug: string;
    title_en: string;
    title_dari?: string | null;
    title_pashto?: string | null;
    summary_en?: string | null;
    summary_dari?: string | null;
    summary_pashto?: string | null;
    image_url?: string | null;
    icon_key?: string | null;
  }>;
  faqs: Array<{
    id: string;
    question_en: string;
    question_dari?: string | null;
    question_pashto?: string | null;
    answer_en?: string | null;
    answer_dari?: string | null;
    answer_pashto?: string | null;
  }>;
  reviews: Array<{
    id: string;
    full_name: string;
    country?: string | null;
    rating: number;
    review_text: string;
  }>;
};

async function fetchHomepageContent(): Promise<HomepageContent> {
  try {
    const supabase = createPublicClient();
    const [
      { data: packages },
      { data: heroData },
      { data: galleryData },
      { data: serviceData },
      { data: faqData },
      { data: reviewData },
    ] = await Promise.all([
      supabase
        .from("packages")
        .select(
          "slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, image_url, route_label, duration_days, price_from, price_currency",
        )
        .eq("is_published", true)
        .order("duration_days"),
      supabase
        .from("hero_slides")
        .select(
          "image_url, title_en, title_dari, title_pashto, subtitle_en, subtitle_dari, subtitle_pashto, cta_primary_label_en, cta_primary_href, cta_secondary_label_en, cta_secondary_href",
        )
        .eq("is_published", true)
        .order("sort_order"),
      supabase
        .from("gallery_images")
        .select("image_url, title_en, location_tag")
        .eq("is_published", true)
        .order("sort_order")
        .limit(12),
      supabase
        .from("services")
        .select("slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, image_url, icon_key")
        .eq("is_published", true)
        .order("sort_order")
        .limit(4),
      supabase
        .from("faqs")
        .select("id, question_en, question_dari, question_pashto, answer_en, answer_dari, answer_pashto")
        .eq("is_published", true)
        .order("sort_order")
        .limit(4),
      supabase
        .from("visitor_reviews")
        .select("id, full_name, country, rating, review_text")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(11),
    ]);

    let featuredPackages: HomepageContent["packages"] = packages ?? [];
    if (!featuredPackages.length && devPlaceholdersEnabled()) {
      const { data: placeholderCatalog } = await supabase
        .from("packages")
        .select("slug, price_from, price_currency")
        .in("slug", placeholderPackages.map((item) => item.slug))
        .eq("is_published", true);
      featuredPackages = mergePlaceholdersWithCatalogPrices(
        placeholderPackages,
        placeholderCatalog ?? [],
      ) as HomepageContent["packages"];
    }

    return {
      packages: featuredPackages,
      heroSlides: ((heroData ?? []) as HeroSlide[]).filter((slide) => isUsableImageUrl(slide.image_url)),
      gallery: (galleryData ?? []).filter((g) => isUsableImageUrl(g.image_url)) as HomepageContent["gallery"],
      services: (serviceData ?? []) as HomepageContent["services"],
      faqs: (faqData ?? []) as HomepageContent["faqs"],
      reviews: (reviewData ?? []) as HomepageContent["reviews"],
    };
  } catch {
    return { packages: [], heroSlides: [], gallery: [], services: [], faqs: [], reviews: [] };
  }
}

const getCachedHomepageInner = unstable_cache(fetchHomepageContent, ["cms-homepage"], {
  revalidate: CMS_CACHE_SECONDS,
  tags: [
    CACHE_TAGS.homepage,
    CACHE_TAGS.packages,
    CACHE_TAGS.hero,
    CACHE_TAGS.gallery,
    CACHE_TAGS.services,
    CACHE_TAGS.faqs,
    CACHE_TAGS.reviews,
    CACHE_TAGS.about,
    CACHE_TAGS.all,
  ],
});

export const getCachedHomepageContent = cache(() => getCachedHomepageInner());

async function fetchBookingOffers(): Promise<BookingOfferOption[]> {
  try {
    const supabase = createPublicClient();
    const [{ data: packages }, { data: services }, { data: upcoming }] = await Promise.all([
      supabase
        .from("packages")
        .select(
          "slug, reference_code, title_en, title_dari, title_pashto, duration_days, price_from, vip_price, price_currency, standard_includes, vip_includes, includes",
        )
        .eq("is_published", true)
        .order("duration_days", { ascending: true }),
      supabase
        .from("services")
        .select("slug, reference_code, title_en, title_dari, title_pashto")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("tour_departures")
        .select("slug, reference_code, title_en, title_dari, title_pashto, days, start_date, price_from, price_currency, package_id")
        .eq("is_published", true)
        .order("start_date", { ascending: true }),
    ]);

    const upcomingPrices = await resolveUpcomingTourPrices(supabase, upcoming ?? []);

    const packageOffers: BookingOfferOption[] = (packages ?? [])
      .filter((p) => p.reference_code)
      .map((p) => ({
        kind: "package" as const,
        slug: p.slug,
        reference_code: p.reference_code as string,
        title_en: p.title_en,
        title_dari: p.title_dari,
        title_pashto: p.title_pashto,
        duration_days: p.duration_days,
        price_from: parseCatalogPrice(p.price_from),
        vip_price: parseCatalogPrice(p.vip_price),
        price_currency: p.price_currency ?? "USD",
        standard_includes: Array.isArray(p.standard_includes) ? (p.standard_includes as string[]) : null,
        vip_includes: Array.isArray(p.vip_includes) ? (p.vip_includes as string[]) : null,
        includes: Array.isArray(p.includes) ? (p.includes as string[]) : null,
      }));

    const serviceOffers: BookingOfferOption[] = (services ?? [])
      .filter((s) => s.reference_code)
      .map((s) => ({
        kind: "service" as const,
        slug: s.slug,
        reference_code: s.reference_code as string,
        title_en: s.title_en,
        title_dari: s.title_dari,
        title_pashto: s.title_pashto,
      }));

    const upcomingOffers: BookingOfferOption[] = (upcoming ?? [])
      .filter((u) => u.reference_code)
      .map((u) => {
        const price = upcomingPrices.get(u.slug);
        return {
          kind: "upcoming" as const,
          slug: u.slug,
          reference_code: u.reference_code as string,
          title_en: u.title_en,
          title_dari: u.title_dari,
          title_pashto: u.title_pashto,
          duration_days: u.days,
          start_date: u.start_date,
          price_from: price?.price_from ?? null,
          price_currency: price?.price_currency ?? null,
        };
      });

    return [...packageOffers, ...serviceOffers, ...upcomingOffers];
  } catch {
    return [];
  }
}

const getCachedBookingOffersInner = unstable_cache(fetchBookingOffers, ["cms-booking-offers"], {
  revalidate: CMS_CACHE_SECONDS,
  tags: [CACHE_TAGS.bookingOffers, CACHE_TAGS.packages, CACHE_TAGS.services, CACHE_TAGS.upcoming, CACHE_TAGS.all],
});

export const getCachedBookingOffers = cache(() => getCachedBookingOffersInner());
