/** Shared Data Cache tags — invalidate via `revalidateCms()` after admin writes. */
export const CACHE_TAGS = {
  siteSettings: "cms:site-settings",
  nav: "cms:nav",
  homepage: "cms:homepage",
  packages: "cms:packages",
  destinations: "cms:destinations",
  gallery: "cms:gallery",
  hero: "cms:hero",
  services: "cms:services",
  faqs: "cms:faqs",
  reviews: "cms:reviews",
  team: "cms:team",
  blog: "cms:blog",
  upcoming: "cms:upcoming",
  bookingOffers: "cms:booking-offers",
  agreements: "cms:agreements",
  about: "cms:about",
  /** Broad tag: invalidate all public CMS caches */
  all: "cms:all",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
