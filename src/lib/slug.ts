/**
 * CMS slugs are typed by admins, so rows can carry spaces, commas, capitals and
 * stray trailing whitespace (e.g. `"6-day, Kabul, Ghazni, Bamyan "`). Two things
 * then break on the public site:
 *
 * 1. Next.js hands dynamic route params to the page still percent-encoded, so a
 *    raw `.eq("slug", param)` lookup compares `"Minaret%20of%20jam%20tour"`
 *    against `"Minaret of jam tour"` and the page 404s.
 * 2. Browsers drop a trailing space from the URL, so even a decoded param never
 *    matches a row whose slug ends in whitespace.
 *
 * `toUrlSlug` gives each row one clean segment to link to, and `findBySlug`
 * matches an incoming param back to its row through either kind of drift.
 */

/** Canonical public URL segment: `"6-day, Kabul "` -> `"6-day-kabul"`. Keeps non-Latin letters. */
export function toUrlSlug(raw: unknown): string {
  const source = String(raw ?? "").trim();
  const cleaned = source
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  // Slugs made entirely of punctuation still need to round-trip through a URL.
  return cleaned || encodeURIComponent(source);
}

/** Percent-decodes a route param without throwing on malformed input. */
export function decodeSlugParam(raw: unknown): string {
  const value = String(raw ?? "");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Loose key so a param and its row match regardless of encoding, case or spacing. */
export function slugKey(raw: unknown): string {
  return toUrlSlug(decodeSlugParam(raw));
}

/** Resolves a route param to its row, tolerating encoding and formatting drift. */
export function findBySlug<T extends { slug?: unknown }>(rows: readonly T[], param: unknown): T | null {
  const decoded = decodeSlugParam(param);
  const raw = String(param ?? "");

  const exact = rows.find((row) => String(row.slug ?? "") === decoded || String(row.slug ?? "") === raw);
  if (exact) return exact;

  const key = slugKey(param);
  if (!key) return null;
  return rows.find((row) => slugKey(row.slug) === key) ?? null;
}
