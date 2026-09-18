/**
 * Packages come in two flavours. Private tours run on request for one party;
 * group tours run on a shared departure that strangers join. Everything that
 * existed before the split is private, so that stays the fallback everywhere.
 */
export const PACKAGE_TYPES = ["private", "group"] as const;

export type PackageType = (typeof PACKAGE_TYPES)[number];

export const DEFAULT_PACKAGE_TYPE: PackageType = "private";

export function isPackageType(value: unknown): value is PackageType {
  return typeof value === "string" && (PACKAGE_TYPES as readonly string[]).includes(value);
}

/** Anything unrecognised (null, legacy blank, typo) falls back to private. */
export function normalizePackageType(value: unknown): PackageType {
  if (typeof value !== "string") return DEFAULT_PACKAGE_TYPE;
  const trimmed = value.trim().toLowerCase();
  return isPackageType(trimmed) ? trimmed : DEFAULT_PACKAGE_TYPE;
}

/** i18n key under `packageTypes` for a type label. */
export function packageTypeLabelKey(type: PackageType): string {
  return `packageTypes.${type}`;
}
