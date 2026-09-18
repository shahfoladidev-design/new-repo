import { isUsableImageUrl } from "@/lib/cms-media";

/** Admin-uploaded logo only — no bundled default mark. Optional cacheVersion busts CDN/browser cache after updates. */
export function resolveHeaderLogo(
  logoUrl?: string | null,
  cacheVersion?: string | null,
): string | null {
  const trimmed = logoUrl?.trim();
  if (!trimmed || !isUsableImageUrl(trimmed)) return null;
  if (!cacheVersion) return trimmed;
  const sep = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${sep}v=${encodeURIComponent(cacheVersion)}`;
}

export function isRemoteLogo(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}
