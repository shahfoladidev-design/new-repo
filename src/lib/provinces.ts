import { slugify } from "@/lib/admin/notify";

export type ProvinceGeo = {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  aliases?: string[];
};

/** Provincial capitals / major cities — for package grouping and admin selects */
export const AFGHAN_PROVINCES: ProvinceGeo[] = [
  { name: "Kabul", slug: "kabul", lat: 34.5553, lng: 69.2075 },
  { name: "Bamiyan", slug: "bamiyan", lat: 34.8233, lng: 67.8233, aliases: ["Bamyan"] },
  { name: "Herat", slug: "herat", lat: 34.3529, lng: 62.204 },
  {
    name: "Mazar-i-Sharif",
    slug: "mazar-i-sharif",
    lat: 36.709,
    lng: 67.1109,
    aliases: ["Mazar-e-Sharif", "Mazari Sharif", "Balkh"],
  },
  { name: "Kandahar", slug: "kandahar", lat: 31.6289, lng: 65.7372 },
  { name: "Panjshir", slug: "panjshir", lat: 35.2676, lng: 69.5174 },
  { name: "Ghazni", slug: "ghazni", lat: 33.5458, lng: 68.4174 },
  { name: "Badakhshan", slug: "badakhshan", lat: 37.1167, lng: 70.5833 },
  { name: "Nangarhar", slug: "nangarhar", lat: 34.4344, lng: 70.4483, aliases: ["Jalalabad"] },
  { name: "Ghor", slug: "ghor", lat: 34.32, lng: 65.97 },
  { name: "Helmand", slug: "helmand", lat: 31.58, lng: 64.35 },
  { name: "Nuristan", slug: "nuristan", lat: 35.32, lng: 70.9 },
  { name: "Kunduz", slug: "kunduz", lat: 36.73, lng: 68.87 },
  { name: "Wakhan", slug: "wakhan", lat: 37.0, lng: 73.0, aliases: ["Wakhan Corridor"] },
];

const BY_SLUG = new Map(AFGHAN_PROVINCES.map((p) => [p.slug, p]));
const BY_NAME = new Map<string, ProvinceGeo>();

function normalizeKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

for (const province of AFGHAN_PROVINCES) {
  BY_NAME.set(normalizeKey(province.name), province);
  for (const alias of province.aliases ?? []) {
    BY_NAME.set(normalizeKey(alias), province);
  }
}

export function lookupProvince(provinceName: string): ProvinceGeo | null {
  const slug = slugify(provinceName);
  if (BY_SLUG.has(slug)) return BY_SLUG.get(slug)!;
  const key = normalizeKey(provinceName);
  if (BY_NAME.has(key)) return BY_NAME.get(key)!;
  return (
    AFGHAN_PROVINCES.find(
      (p) => key.includes(normalizeKey(p.name)) || normalizeKey(p.name).includes(key),
    ) ?? null
  );
}

export function provinceSlug(provinceName: string): string {
  return lookupProvince(provinceName)?.slug ?? slugify(provinceName);
}
