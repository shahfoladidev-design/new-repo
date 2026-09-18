export const locales = ["en", "dari", "ps"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  dari: "دری",
  ps: "پښتو",
};

/** Compact labels for the assembled language selector */
export const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  dari: "دری",
  ps: "پښتو",
};

export const rtlLocales: Locale[] = ["dari", "ps"];

export function isRtl(locale: Locale) {
  return rtlLocales.includes(locale);
}
