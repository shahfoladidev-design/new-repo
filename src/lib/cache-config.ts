/** Shared ISR / Data Cache TTL for public CMS reads (invalidated on admin writes). */
export const CMS_CACHE_SECONDS = 3600;

/** High-intent routes prefetched after idle — keep the list small to avoid network bloat. */
export const PREFETCH_ROUTES = ["/packages", "/book", "/contact"] as const;
