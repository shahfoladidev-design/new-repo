/** Hostname for Supabase Storage public URLs (from NEXT_PUBLIC_SUPABASE_URL). */
export function supabaseStorageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname || null;
  } catch {
    return null;
  }
}

/** True when the URL can be used as an image src on the public site. */
export function isUsableImageUrl(url: string | null | undefined): url is string {
  const value = String(url ?? "").trim();
  if (!value) return false;
  if (value.startsWith("blob:") || value.startsWith("data:")) return false;
  if (value.startsWith("/")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Normalize admin-provided image URLs before persisting to the database. */
export function normalizeStoredImageUrl(raw: string | null | undefined): string | null {
  const url = String(raw ?? "").trim();
  if (!isUsableImageUrl(url)) return null;
  return url;
}

/** Return a usable image URL or null — no stock/placeholder fallbacks. */
export function resolveImageSrc(url: string | null | undefined): string | null {
  return isUsableImageUrl(url) ? url : null;
}
