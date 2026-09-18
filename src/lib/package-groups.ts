import { AFGHAN_PROVINCES } from "@/lib/provinces";

export type PackageWithDestinations = {
  id: string;
  slug: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  province_slug?: string | null;
  image_url?: string | null;
  price_from?: number | null;
  duration_days?: number | null;
  package_destinations: Array<{
    id: string;
    days: number | null;
    sort_order: number;
    destinations: {
      id: string;
      slug: string;
      title_en: string;
      title_dari?: string | null;
      title_pashto?: string | null;
      image_url?: string | null;
    } | null;
  }>;
};

export type DestinationEntry = {
  slug: string;
  title: string;
  imageUrl: string | null;
  days: number | null;
};

export type ProvinceGroup = {
  provinceSlug: string;
  provinceName: string;
  destinations: DestinationEntry[];
};

const PROVINCE_ORDER = new Map(AFGHAN_PROVINCES.map((p, i) => [p.slug, i]));
const PROVINCE_NAMES = new Map(AFGHAN_PROVINCES.map((p) => [p.slug, p.name]));

export function groupPackagesByProvince(packages: PackageWithDestinations[]): ProvinceGroup[] {
  const provinceMap = new Map<string, Map<string, DestinationEntry>>();

  for (const pkg of province_slug(packages)) {
    const slug = pkg.province_slug!;
    if (!provinceMap.has(slug)) provinceMap.set(slug, new Map());

    const destMap = provinceMap.get(slug)!;
    for (const pd of pkg.package_destinations) {
      if (!pd.destinations) continue;
      const dest = pd.destinations;
      const existing = destMap.get(dest.slug);
      if (existing) {
        if (pd.days != null && (existing.days == null || pd.days < existing.days)) {
          existing.days = pd.days;
        }
      } else {
        destMap.set(dest.slug, {
          slug: dest.slug,
          title: dest.title_en || "",
          imageUrl: dest.image_url ?? null,
          days: pd.days,
        });
      }
    }
  }

  const groups: ProvinceGroup[] = [];
  for (const [slug, destMap] of provinceMap) {
    const destinations = Array.from(destMap.values());
    destinations.sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity));
    groups.push({
      provinceSlug: slug,
      provinceName: PROVINCE_NAMES.get(slug) ?? slug,
      destinations,
    });
  }

  groups.sort((a, b) => (PROVINCE_ORDER.get(a.provinceSlug) ?? 999) - (PROVINCE_ORDER.get(b.provinceSlug) ?? 999));

  return groups;
}

function province_slug(packages: PackageWithDestinations[]): PackageWithDestinations[] {
  return packages.filter((p) => p.province_slug);
}
