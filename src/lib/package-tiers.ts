export type PackageTier = "standard" | "vip";

export function parseIncludesList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((s) => s.trim()).filter(Boolean);
}

/** Coerce Supabase numeric / Postgres decimal strings to a positive price. */
export function parseCatalogPrice(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function hasVipTier(vipPrice: unknown): boolean {
  return parseCatalogPrice(vipPrice) != null;
}

/** Package offers Standard + VIP choice when VIP price or VIP includes are configured. */
export function packageHasVipChoice(pkg: {
  vip_price?: unknown;
  vip_includes?: unknown;
}): boolean {
  return hasVipTier(pkg.vip_price) || parseIncludesList(pkg.vip_includes).length > 0;
}

export function tierPrice(
  tier: PackageTier,
  standardPrice: unknown,
  vipPrice: unknown,
): number | null {
  if (tier === "vip") return parseCatalogPrice(vipPrice);
  return parseCatalogPrice(standardPrice);
}

export function tierIncludes(
  tier: PackageTier,
  standardIncludes: unknown,
  vipIncludes: unknown,
  legacyIncludes?: unknown,
): string[] {
  const standard = parseIncludesList(standardIncludes);
  if (standard.length > 0) {
    return tier === "vip" ? parseIncludesList(vipIncludes) : standard;
  }
  const legacy = parseIncludesList(legacyIncludes);
  return tier === "vip" ? parseIncludesList(vipIncludes) : legacy;
}

export function tierLabelKey(tier: PackageTier): "standard" | "vip" {
  return tier;
}

export function packageTierLabel(tier: string | null | undefined): string | null {
  if (tier === "vip") return "VIP";
  if (tier === "standard") return "Standard";
  return null;
}
