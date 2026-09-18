/** Shared nav/catalog item shape for header, search, and CMS cache. */
export type NavTourItem = {
  slug: string;
  /** Canonical, URL-safe segment for this row — admin slugs are not always link-safe. */
  href: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  summary_en?: string | null;
  summary_dari?: string | null;
  summary_pashto?: string | null;
  route_label?: string | null;
  duration_days?: number | null;
  price_from?: number | null;
  price_currency?: string | null;
};
