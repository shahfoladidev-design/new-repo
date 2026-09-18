import { BRAND_COLORS } from "@/lib/brand";

/** Normalize to #rrggbb for <input type="color"> and CSS. */
export function normalizeHexColor(raw: string | null | undefined, fallback: string) {
  const value = (raw || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback.toLowerCase();
}

export function brandPrimary(raw?: string | null) {
  return normalizeHexColor(raw, BRAND_COLORS.primary);
}

export function brandSecondary(raw?: string | null) {
  return normalizeHexColor(raw, BRAND_COLORS.secondary);
}

export function brandAccent(raw?: string | null) {
  return normalizeHexColor(raw, BRAND_COLORS.accent);
}
