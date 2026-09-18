import type { Locale } from "@/i18n/config";

/** Maps next-intl locales to Google Translate page-language codes. */
export function localeToGooglePageLanguage(locale: Locale): string {
  switch (locale) {
    case "dari":
      return "fa";
    case "ps":
      return "ps";
    default:
      return "en";
  }
}

/** Google codes reserved for native site locales — never shown in the translate list. */
export const SITE_GOOGLE_LANGUAGE_CODES = new Set(["en", "fa", "ps"]);

/** Detect the visitor's preferred language from browser / region settings. */
export function detectBrowserGoogleLanguage(): string {
  if (typeof navigator === "undefined") return "en";

  const raw = navigator.language || navigator.languages?.[0] || "en";
  const lower = raw.toLowerCase();

  if (lower.startsWith("zh")) {
    return lower.includes("tw") || lower.includes("hk") ? "zh-TW" : "zh-CN";
  }
  if (lower.startsWith("pt")) return "pt";
  if (lower.startsWith("fil") || lower.startsWith("tl")) return "tl";

  return lower.split("-")[0] || "en";
}

/** True when the native site locale already matches what the browser expects. */
export function browserMatchesSiteLocale(siteLocale: Locale, browserCode: string): boolean {
  const pageLang = localeToGooglePageLanguage(siteLocale);
  if (browserCode === pageLang) return true;

  if (siteLocale === "en" && browserCode.startsWith("en")) return true;
  if (siteLocale === "dari" && (browserCode === "fa" || browserCode === "prs")) return true;
  if (siteLocale === "ps" && browserCode === "ps") return true;

  return false;
}

export function readGoogleTranslateTarget(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match?.[1] || match[1] === "/auto/auto") return null;
  const parts = decodeURIComponent(match[1]).split("/").filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : null;
}

export function setGoogleTranslateTarget(pageLanguage: string, targetLanguage: string) {
  const value = `/${pageLanguage}/${targetLanguage}`;
  document.cookie = `googtrans=${value}; path=/`;

  const host = window.location.hostname;
  if (host.endsWith("shahfoladi.com")) {
    document.cookie = `googtrans=${value}; path=/; domain=.shahfoladi.com`;
  }
}

export function clearGoogleTranslateTarget() {
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; path=/; expires=${expires}`;

  const host = window.location.hostname;
  if (host.endsWith("shahfoladi.com")) {
    document.cookie = `googtrans=; path=/; domain=.shahfoladi.com; expires=${expires}`;
  }
}

export const GOOGLE_TRANSLATE_MANUAL_KEY = "sf-gtranslate-manual";
export const GOOGLE_TRANSLATE_AUTO_KEY = "sf-gtranslate-auto";

/** Languages offered for Google machine translation (excludes native site locales). */
export const GOOGLE_TRANSLATE_LANGUAGES = [
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "hi", label: "हिन्दी" },
  { code: "ur", label: "اردو" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "pt", label: "Português" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "th", label: "ไทย" },
  { code: "uk", label: "Українська" },
] as const;

export function googleTranslateLanguageOptions(pageLanguage: string) {
  return GOOGLE_TRANSLATE_LANGUAGES.filter(
    (lang) => lang.code !== pageLanguage && !SITE_GOOGLE_LANGUAGE_CODES.has(lang.code),
  );
}
