/**
 * Public site paths for hero (and other) CTA link dropdowns.
 * Use locale-free paths — next-intl Link adds /en|/dari|/ps automatically.
 */
export const SITE_CTA_ROUTES = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/book", label: "Book" },
  { href: "/destinations", label: "Destinations" },
  { href: "/services", label: "Services" },
  { href: "/upcoming-tours", label: "Upcoming tours" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/team", label: "Team" },
  { href: "/reviews", label: "Reviews" },
  { href: "/agreements", label: "Agreements" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export type SiteCtaHref = (typeof SITE_CTA_ROUTES)[number]["href"];

const KNOWN = new Set<string>(SITE_CTA_ROUTES.map((r) => r.href));

/** Normalize CTA paths: trim, ensure leading slash, strip locale prefix. */
export function normalizeCtaHref(raw: string | null | undefined, fallback = "/packages"): string {
  let href = String(raw ?? "").trim();
  if (!href) return fallback;
  if (!href.startsWith("/")) href = `/${href}`;
  // Strip accidental locale prefixes from pasted URLs
  href = href.replace(/^\/(en|dari|ps)(?=\/|$)/, "") || "/";
  if (!href.startsWith("/")) href = `/${href}`;
  return href;
}

export function isKnownCtaHref(href: string): boolean {
  return KNOWN.has(href);
}
