import type { Locale } from "@/i18n/config";
import type { PackageType } from "@/lib/package-types";

export type CatalogKind = "package" | "upcoming" | "destination";

export type CatalogItem = {
  kind: CatalogKind;
  slug: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  summary_en?: string | null;
  summary_dari?: string | null;
  summary_pashto?: string | null;
  href: string;
  image_url?: string | null;
  price_from?: number | null;
  price_currency?: string | null;
  duration_days?: number | null;
  province_slug?: string | null;
  route_label?: string | null;
  /** Only set for `kind: "package"`; upcoming departures leave it null. */
  package_type?: PackageType | null;
};

export type CatalogFilters = {
  query?: string;
  duration?: "any" | "short" | "medium" | "long";
  price?: "any" | "budget" | "mid" | "premium";
  province?: string;
  kind?: CatalogKind | "all";
};

function localizedText(item: CatalogItem, locale: Locale, field: "title" | "summary") {
  if (field === "title") {
    if (locale === "dari" && item.title_dari) return item.title_dari;
    if (locale === "ps" && item.title_pashto) return item.title_pashto;
    return item.title_en;
  }
  if (locale === "dari" && item.summary_dari) return item.summary_dari;
  if (locale === "ps" && item.summary_pashto) return item.summary_pashto;
  return item.summary_en ?? "";
}

function matchesDuration(days: number | null | undefined, duration: CatalogFilters["duration"]) {
  if (!duration || duration === "any") return true;
  if (days == null) return false;
  if (duration === "short") return days <= 5;
  if (duration === "medium") return days >= 6 && days <= 10;
  return days >= 11;
}

function matchesPrice(price: number | null | undefined, band: CatalogFilters["price"]) {
  if (!band || band === "any") return true;
  if (price == null) return false;
  if (band === "budget") return price < 800;
  if (band === "mid") return price >= 800 && price < 1500;
  return price >= 1500;
}

export function catalogItemMatches(item: CatalogItem, filters: CatalogFilters, locale: Locale) {
  if (filters.kind && filters.kind !== "all" && item.kind !== filters.kind) return false;

  if (filters.province && filters.province !== "all") {
    if ((item.province_slug ?? "") !== filters.province) return false;
  }

  if (item.kind === "package" || item.kind === "upcoming") {
    if (!matchesDuration(item.duration_days, filters.duration)) return false;
    if (!matchesPrice(item.price_from, filters.price)) return false;
  }

  const q = (filters.query ?? "").trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    localizedText(item, locale, "title"),
    localizedText(item, locale, "summary"),
    item.title_en,
    item.summary_en ?? "",
    item.route_label ?? "",
    item.province_slug ?? "",
    item.slug,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function filterCatalog(items: CatalogItem[], filters: CatalogFilters, locale: Locale) {
  return items.filter((item) => catalogItemMatches(item, filters, locale));
}

/**
 * The header search catalog is serialized into every page, so ship only what the
 * search actually reads: the fields used by `catalogItemMatches` plus the title it
 * renders. Titles/summaries for the two inactive locales and image URLs are dropped.
 */
export function trimCatalogForLocale(items: CatalogItem[], locale: Locale): CatalogItem[] {
  return items.map((item) => ({
    kind: item.kind,
    slug: item.slug,
    href: item.href,
    title_en: item.title_en,
    title_dari: locale === "dari" ? item.title_dari : null,
    title_pashto: locale === "ps" ? item.title_pashto : null,
    summary_en: item.summary_en ?? null,
    summary_dari: locale === "dari" ? item.summary_dari : null,
    summary_pashto: locale === "ps" ? item.summary_pashto : null,
    price_from: item.price_from ?? null,
    price_currency: item.price_currency ?? null,
    duration_days: item.duration_days ?? null,
    province_slug: item.province_slug ?? null,
    route_label: item.route_label ?? null,
  }));
}

export function uniqueProvinces(items: CatalogItem[]) {
  const set = new Set<string>();
  for (const item of items) {
    if (item.province_slug) set.add(item.province_slug);
  }
  return Array.from(set).sort();
}
