import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";
import { CMS_CACHE_SECONDS } from "@/lib/cache-config";
import type { CatalogItem } from "@/lib/catalog-search";
import { placeholderDestinations, placeholderPackages } from "@/lib/content";
import { mergePlaceholdersWithCatalogPrices } from "@/lib/catalog-price-display";
import { devPlaceholdersEnabled } from "@/lib/dev-placeholders";
import { resolveUpcomingTourPrices } from "@/lib/payments/catalog-price";
import { decodeSlugParam, findBySlug, slugKey, toUrlSlug } from "@/lib/slug";
import { isUsableImageUrl } from "@/lib/cms-media";
import { normalizePackageType } from "@/lib/package-types";
import type { AboutPage } from "@/lib/about-page";
import { aboutHasPublicContent } from "@/lib/about-page";

function wrapCached<T>(key: string, tags: CacheTag[], fn: () => Promise<T>) {
  const cached = unstable_cache(fn, [key], {
    revalidate: CMS_CACHE_SECONDS,
    tags: [...tags, CACHE_TAGS.all],
  });
  return cache(() => cached());
}

function packageRowToCatalogItem(row: Record<string, unknown>): CatalogItem {
  return {
    kind: "package",
    slug: String(row.slug),
    title_en: String(row.title_en),
    title_dari: (row.title_dari as string | null | undefined) ?? null,
    title_pashto: (row.title_pashto as string | null | undefined) ?? null,
    summary_en: (row.summary_en as string | null | undefined) ?? null,
    summary_dari: (row.summary_dari as string | null | undefined) ?? null,
    summary_pashto: (row.summary_pashto as string | null | undefined) ?? null,
    href: `/packages/${toUrlSlug(row.slug)}`,
    image_url: (row.image_url as string | null | undefined) ?? null,
    price_from: (row.price_from as number | null | undefined) ?? null,
    price_currency: (row.price_currency as string | null | undefined) ?? "USD",
    duration_days: (row.duration_days as number | null | undefined) ?? null,
    province_slug: (row.province_slug as string | null | undefined) ?? null,
    route_label: (row.route_label as string | null | undefined) ?? null,
    package_type: normalizePackageType(row.package_type),
  };
}

function destinationRowToCatalogItem(row: Record<string, unknown>): CatalogItem {
  return {
    kind: "destination",
    slug: String(row.slug),
    title_en: String(row.title_en),
    title_dari: (row.title_dari as string | null | undefined) ?? null,
    title_pashto: (row.title_pashto as string | null | undefined) ?? null,
    summary_en: (row.summary_en as string | null | undefined) ?? null,
    summary_dari: (row.summary_dari as string | null | undefined) ?? null,
    summary_pashto: (row.summary_pashto as string | null | undefined) ?? null,
    href: `/destinations/${toUrlSlug(row.slug)}`,
    image_url: (row.image_url as string | null | undefined) ?? null,
  };
}

async function fetchPackageCatalogItems(): Promise<CatalogItem[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("packages")
      .select(
        "slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, image_url, price_from, price_currency, duration_days, province_slug, route_label",
      )
      .eq("is_published", true)
      .order("duration_days", { ascending: true });

    if (data?.length) {
      return data.map((row) => packageRowToCatalogItem(row as Record<string, unknown>));
    }

    if (!devPlaceholdersEnabled()) return [];

    const { data: placeholderCatalog } = await supabase
      .from("packages")
      .select("slug, price_from, price_currency")
      .in(
        "slug",
        placeholderPackages.map((item) => item.slug),
      )
      .eq("is_published", true);

    return mergePlaceholdersWithCatalogPrices(placeholderPackages, placeholderCatalog ?? []).map((row) =>
      packageRowToCatalogItem(row as Record<string, unknown>),
    );
  } catch {
    if (!devPlaceholdersEnabled()) return [];
    return mergePlaceholdersWithCatalogPrices(placeholderPackages, []).map((row) =>
      packageRowToCatalogItem(row as Record<string, unknown>),
    );
  }
}

async function fetchDestinationCatalogItems(): Promise<CatalogItem[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("destinations")
      .select("slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, image_url")
      .eq("is_published", true)
      .order("title_en");

    if (data?.length) {
      return data.map((row) => destinationRowToCatalogItem(row as Record<string, unknown>));
    }

    if (!devPlaceholdersEnabled()) return [];

    return placeholderDestinations.map((row) => destinationRowToCatalogItem(row as Record<string, unknown>));
  } catch {
    if (!devPlaceholdersEnabled()) return [];
    return placeholderDestinations.map((row) => destinationRowToCatalogItem(row as Record<string, unknown>));
  }
}

async function fetchUpcomingCatalogItems(): Promise<CatalogItem[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("tour_departures")
      .select(
        "slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, days, badge, start_date, end_date, image_url, price_from, price_currency, package_id",
      )
      .eq("is_published", true)
      .order("start_date", { ascending: true });

    const prices = await resolveUpcomingTourPrices(supabase, data ?? []);

    return (data ?? []).map((row) => {
      const price = prices.get(row.slug);
      return {
        kind: "upcoming" as const,
        slug: row.slug,
        title_en: row.title_en,
        title_dari: row.title_dari,
        title_pashto: row.title_pashto,
        summary_en: row.summary_en,
        summary_dari: row.summary_dari,
        summary_pashto: row.summary_pashto,
        href: "/upcoming-tours",
        image_url: row.image_url,
        price_from: price?.price_from ?? null,
        price_currency: price?.price_currency ?? null,
        duration_days: row.days,
        route_label: row.badge,
      };
    });
  } catch {
    return [];
  }
}

async function fetchPublishedRows(table: string, orderBy = "sort_order") {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from(table).select("*").eq("is_published", true).order(orderBy);
    return (data ?? []) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

async function fetchLegalDocuments() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("legal_documents").select("*");
    return (data ?? []) as Array<Record<string, string>>;
  } catch {
    return [];
  }
}

async function fetchAboutPage(): Promise<AboutPage | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("about_page").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return null;
    const row = data as AboutPage;
    return aboutHasPublicContent(row) ? row : null;
  } catch {
    return null;
  }
}

/** One province inside a package, with its package-specific photo. */
export type PackageProvince = {
  slug: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  image_url: string | null;
  days: number | null;
};

const PROVINCE_DEST_FIELDS = "destinations(slug, title_en, title_dari, title_pashto, image_url)";

/**
 * Per-package province photos live in `package_destinations.image_url`. Until that
 * migration is applied the column is missing, so retry without it rather than
 * dropping the whole province list.
 */
async function fetchPackageProvinces(
  supabase: ReturnType<typeof createPublicClient>,
  packageId: unknown,
): Promise<PackageProvince[]> {
  const withImage = await supabase
    .from("package_destinations")
    .select(`days, sort_order, image_url, ${PROVINCE_DEST_FIELDS}`)
    .eq("package_id", packageId)
    .order("sort_order");

  if (!withImage.error) return toPackageProvinces(withImage.data ?? []);

  const { data } = await supabase
    .from("package_destinations")
    .select(`days, sort_order, ${PROVINCE_DEST_FIELDS}`)
    .eq("package_id", packageId)
    .order("sort_order");

  return toPackageProvinces(data ?? []);
}

/** Prefers the package-specific photo, falling back to the destination's own image. */
function toPackageProvinces(rows: Array<Record<string, unknown>>): PackageProvince[] {
  return rows
    .map((row): PackageProvince | null => {
      const dest = row.destinations as Record<string, unknown> | null;
      if (!dest) return null;
      const packageImage = typeof row.image_url === "string" ? row.image_url : null;
      const destImage = typeof dest.image_url === "string" ? dest.image_url : null;
      const image = isUsableImageUrl(packageImage) ? packageImage : isUsableImageUrl(destImage) ? destImage : null;
      return {
        slug: String(dest.slug),
        title_en: String(dest.title_en ?? ""),
        title_dari: (dest.title_dari as string | null) ?? null,
        title_pashto: (dest.title_pashto as string | null) ?? null,
        image_url: image,
        days: typeof row.days === "number" ? row.days : null,
      };
    })
    .filter((row): row is PackageProvince => row !== null);
}

export type PackageDayRow = {
  day_number: number;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  body_en?: string | null;
  body_dari?: string | null;
  body_pashto?: string | null;
  overnight_location?: string | null;
};

/**
 * Route params arrive percent-encoded and admin slugs may not be URL-clean, so an
 * exact match can miss a row that exists. Fall back to matching every published
 * slug on its normalized key before giving up and rendering a 404.
 */
async function findPublishedRowBySlug(
  supabase: ReturnType<typeof createPublicClient>,
  table: "packages" | "destinations" | "blog_posts",
  slug: string,
) {
  const decoded = decodeSlugParam(slug);
  const { data: exact } = await supabase
    .from(table)
    .select("*")
    .eq("slug", decoded)
    .eq("is_published", true)
    .limit(1);
  if (exact?.length) return exact[0] as Record<string, unknown>;

  const { data: candidates } = await supabase.from(table).select("*").eq("is_published", true);
  return findBySlug((candidates ?? []) as Array<Record<string, unknown>>, slug);
}

async function fetchPackageDetail(slug: string) {
  try {
    const supabase = createPublicClient();
    const data = await findPublishedRowBySlug(supabase, "packages", slug);
    if (data) {
      const [{ data: dayRows }, provinces] = await Promise.all([
        supabase.from("package_days").select("*").eq("package_id", data.id).order("day_number"),
        fetchPackageProvinces(supabase, data.id),
      ]);

      return {
        item: data as Record<string, unknown>,
        days: (dayRows ?? []) as PackageDayRow[],
        provinces,
      };
    }

    if (!devPlaceholdersEnabled()) return null;

    const placeholder = findBySlug(placeholderPackages, slug);
    if (!placeholder) return null;

    const { data: priceRow } = await supabase
      .from("packages")
      .select("price_from, price_currency")
      .eq("slug", placeholder.slug)
      .eq("is_published", true)
      .maybeSingle();

    return {
      item: {
        ...placeholder,
        ...(priceRow ?? {}),
      } as Record<string, unknown>,
      days: [] as PackageDayRow[],
      provinces: [] as PackageProvince[],
    };
  } catch {
    if (!devPlaceholdersEnabled()) return null;
    const placeholder = findBySlug(placeholderPackages, slug);
    return placeholder
      ? {
          item: placeholder as Record<string, unknown>,
          days: [] as PackageDayRow[],
          provinces: [] as PackageProvince[],
        }
      : null;
  }
}

async function fetchDestinationDetail(slug: string) {
  try {
    const supabase = createPublicClient();
    const data = await findPublishedRowBySlug(supabase, "destinations", slug);
    if (data) return data as Record<string, unknown>;

    if (!devPlaceholdersEnabled()) return null;
    return (findBySlug(placeholderDestinations, slug) as Record<string, unknown> | null) ?? null;
  } catch {
    if (!devPlaceholdersEnabled()) return null;
    return (findBySlug(placeholderDestinations, slug) as Record<string, unknown> | null) ?? null;
  }
}

async function fetchBlogPost(slug: string) {
  try {
    const supabase = createPublicClient();
    const data = await findPublishedRowBySlug(supabase, "blog_posts", slug);
    return (data as Record<string, unknown> | null) ?? null;
  } catch {
    return null;
  }
}

async function fetchPublishedReviews() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("visitor_reviews")
      .select("id, full_name, country, rating, review_text")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data ?? []) as Array<{
      id: string;
      full_name: string;
      country: string | null;
      rating: number;
      review_text: string;
    }>;
  } catch {
    return [];
  }
}

async function fetchGalleryImages() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Array<{
      image_url: string;
      title_en?: string | null;
      title_dari?: string | null;
      title_pashto?: string | null;
      location_tag?: string | null;
    }>;
  } catch {
    return [];
  }
}

export const getCachedPackageCatalog = wrapCached("cms-package-catalog", [CACHE_TAGS.packages], fetchPackageCatalogItems);
export const getCachedDestinationCatalog = wrapCached(
  "cms-destination-catalog",
  [CACHE_TAGS.destinations],
  fetchDestinationCatalogItems,
);
export const getCachedUpcomingCatalog = wrapCached("cms-upcoming-catalog", [CACHE_TAGS.upcoming], fetchUpcomingCatalogItems);
export const getCachedServices = wrapCached("cms-services", [CACHE_TAGS.services], () => fetchPublishedRows("services"));
export const getCachedTeamMembers = wrapCached("cms-team", [CACHE_TAGS.team], () => fetchPublishedRows("team_members"));
export const getCachedFaqs = wrapCached("cms-faqs", [CACHE_TAGS.faqs], () => fetchPublishedRows("faqs"));
export const getCachedLegalDocuments = wrapCached("cms-agreements", [CACHE_TAGS.agreements], fetchLegalDocuments);
export const getCachedAboutPage = wrapCached("cms-about-page", [CACHE_TAGS.about, CACHE_TAGS.homepage], fetchAboutPage);
export const getCachedPublishedReviews = wrapCached("cms-reviews-list", [CACHE_TAGS.reviews], fetchPublishedReviews);
export const getCachedGalleryImages = wrapCached("cms-gallery-list", [CACHE_TAGS.gallery], fetchGalleryImages);

export function getCachedPackageDetail(slug: string) {
  // Key on the normalized slug so encoded and clean URLs for one row share a cache entry.
  const run = unstable_cache(() => fetchPackageDetail(slug), [`cms-package-${slugKey(slug)}`], {
    revalidate: CMS_CACHE_SECONDS,
    tags: [CACHE_TAGS.packages, CACHE_TAGS.all],
  });
  return run();
}

export function getCachedDestinationDetail(slug: string) {
  const run = unstable_cache(() => fetchDestinationDetail(slug), [`cms-destination-${slugKey(slug)}`], {
    revalidate: CMS_CACHE_SECONDS,
    tags: [CACHE_TAGS.destinations, CACHE_TAGS.all],
  });
  return run();
}

async function fetchDestinationDetailWithAttractions(slug: string) {
  const item = await fetchDestinationDetail(slug);
  if (!item) return null;

  try {
    const supabase = createPublicClient();
    const destinationId = item.id;
    if (!destinationId) {
      return { item, attractions: [] as Array<Record<string, unknown>> };
    }

    const { data: rows } = await supabase
      .from("destination_attractions")
      .select("*")
      .eq("destination_id", destinationId)
      .order("sort_order")
      .order("created_at");

    return { item, attractions: (rows ?? []) as Array<Record<string, unknown>> };
  } catch {
    return { item, attractions: [] as Array<Record<string, unknown>> };
  }
}

export function getCachedDestinationDetailWithAttractions(slug: string) {
  const run = unstable_cache(
    () => fetchDestinationDetailWithAttractions(slug),
    [`cms-destination-detail-${slugKey(slug)}`],
    {
      revalidate: CMS_CACHE_SECONDS,
      tags: [CACHE_TAGS.destinations, CACHE_TAGS.all],
    },
  );
  return run();
}

export function getCachedBlogPost(slug: string) {
  const run = unstable_cache(() => fetchBlogPost(slug), [`cms-blog-${slugKey(slug)}`], {
    revalidate: CMS_CACHE_SECONDS,
    tags: [CACHE_TAGS.blog, CACHE_TAGS.all],
  });
  return run();
}
