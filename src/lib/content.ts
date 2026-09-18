import type { Locale } from "@/i18n/config";

type LocalizedRecord = {
  title_en?: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  summary_en?: string | null;
  summary_dari?: string | null;
  summary_pashto?: string | null;
  description_en?: string | null;
  description_dari?: string | null;
  description_pashto?: string | null;
  name_en?: string | null;
  name_dari?: string | null;
  name_pashto?: string | null;
  bio_en?: string | null;
  bio_dari?: string | null;
  bio_pashto?: string | null;
  excerpt_en?: string | null;
  excerpt_dari?: string | null;
  excerpt_pashto?: string | null;
  content_en?: string | null;
  content_dari?: string | null;
  content_pashto?: string | null;
};

export function localizedField<T extends LocalizedRecord>(
  item: T,
  locale: Locale,
  field: "title" | "summary" | "description" | "name" | "bio" | "excerpt" | "content" | "body",
) {
  const enKey = `${field}_en` as keyof T;
  const dariKey = `${field}_dari` as keyof T;
  const psKey = `${field}_pashto` as keyof T;

  if (locale === "dari") {
    return (item[dariKey] as string | null | undefined) || (item[enKey] as string | undefined) || "";
  }
  if (locale === "ps") {
    return (item[psKey] as string | null | undefined) || (item[enKey] as string | undefined) || "";
  }
  return (item[enKey] as string | undefined) || "";
}

export const placeholderPackages = [
  {
    slug: "bamiyan-highlands",
    title_en: "Bamiyan Highlands Escape",
    summary_en: "A refined journey through ancient valleys, crystal lakes, and UNESCO heritage landscapes.",
    price_from: null as number | null,
    price_currency: null as string | null,
    duration_days: 5,
    image_url: null as string | null,
  },
  {
    slug: "kabul-cultural-weekend",
    title_en: "Kabul Cultural Weekend",
    summary_en: "An elegant short break combining heritage sites, artisan markets, and fine local dining.",
    price_from: null as number | null,
    price_currency: null as string | null,
    duration_days: 3,
    image_url: null as string | null,
  },
];

export const placeholderDestinations = [
  {
    slug: "bamiyan",
    title_en: "Bamiyan",
    summary_en: "Mountain serenity, Buddhist heritage, and breathtaking highland scenery.",
    image_url: null as string | null,
  },
  {
    slug: "herat",
    title_en: "Herat",
    summary_en: "Timurid architecture, vibrant bazaars, and centuries of artistic tradition.",
    image_url: null as string | null,
  },
];

export const placeholderHotels = [
  {
    slug: "serene-kabul",
    title_en: "Serene Kabul Hotel",
    summary_en: "Boutique comfort in the heart of the capital.",
    location_en: "Kabul",
    image_url: null as string | null,
  },
];

export const placeholderGuides: Array<{
  slug: string;
  name_en: string;
  bio_en: string;
  languages: string;
  image_url: string;
}> = [];

export const placeholderGallery: Array<{ image_url: string; title_en: string }> = [];

export const placeholderBlog: Array<{
  slug: string;
  title_en: string;
  excerpt_en: string;
  image_url: string;
}> = [];

export const placeholderItineraries = [
  {
    slug: "heritage-trail",
    title_en: "Heritage Trail",
    summary_en: "Five days of curated cultural highlights.",
    days: [
      { day: 1, title: "Arrival & welcome dinner" },
      { day: 2, title: "Old city walking tour" },
      { day: 3, title: "Museum & artisan visit" },
      { day: 4, title: "Day excursion" },
      { day: 5, title: "Departure" },
    ],
  },
];
