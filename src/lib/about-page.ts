import type { Locale } from "@/i18n/config";

/** Singleton About Us row — admin is the only content source. */
export type AboutPage = {
  id: number;
  hero_image_url: string | null;
  title_en: string;
  title_dari: string | null;
  title_pashto: string | null;
  intro_en: string;
  intro_dari: string | null;
  intro_pashto: string | null;
  who_we_are_en: string;
  who_we_are_dari: string | null;
  who_we_are_pashto: string | null;
  approach_en: string;
  approach_dari: string | null;
  approach_pashto: string | null;
  purpose_en: string;
  purpose_dari: string | null;
  purpose_pashto: string | null;
  where_we_operate_en: string;
  where_we_operate_dari: string | null;
  where_we_operate_pashto: string | null;
  working_with_us_en: string;
  working_with_us_dari: string | null;
  working_with_us_pashto: string | null;
  meta_title_en: string | null;
  meta_title_dari: string | null;
  meta_title_pashto: string | null;
  meta_description_en: string | null;
  meta_description_dari: string | null;
  meta_description_pashto: string | null;
  is_published: boolean;
  updated_at: string | null;
};

export type AboutSectionKey =
  | "who_we_are"
  | "approach"
  | "purpose"
  | "where_we_operate"
  | "working_with_us";

export const ABOUT_SECTIONS: AboutSectionKey[] = [
  "who_we_are",
  "approach",
  "purpose",
  "where_we_operate",
  "working_with_us",
];

/** Locale column pick with English fallback (same rule as the rest of the CMS). */
export function localizedAboutText(
  row: Record<string, unknown> | AboutPage,
  locale: Locale,
  base: string,
): string {
  const en = String((row as Record<string, unknown>)[`${base}_en`] ?? "").trim();
  const dari = String((row as Record<string, unknown>)[`${base}_dari`] ?? "").trim();
  const pashto = String((row as Record<string, unknown>)[`${base}_pashto`] ?? "").trim();
  if (locale === "dari") return dari || en;
  if (locale === "ps") return pashto || en;
  return en;
}

export function aboutHasPublicContent(row: AboutPage | null | undefined): boolean {
  if (!row || !row.is_published) return false;
  return Boolean(
    localizedAboutText(row, "en", "title") ||
      localizedAboutText(row, "en", "intro") ||
      ABOUT_SECTIONS.some((key) => localizedAboutText(row, "en", key)),
  );
}
