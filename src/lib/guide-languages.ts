/** Languages guests can request for tour guides (stored as codes on booking_requests.preferred_language). */
export const GUIDE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "dari", label: "Dari" },
  { code: "ps", label: "Pashto" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "tr", label: "Turkish" },
  { code: "fa", label: "Persian (Farsi)" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "zh", label: "Chinese (Mandarin)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "pl", label: "Polish" },
  { code: "sv", label: "Swedish" },
  { code: "other", label: "Other" },
] as const;

export type GuideLanguageCode = (typeof GUIDE_LANGUAGES)[number]["code"];

const labelByCode = new Map<string, string>(GUIDE_LANGUAGES.map((lang) => [lang.code, lang.label]));

export function getGuideLanguageLabel(code: string | null | undefined): string {
  if (!code) return "—";
  return labelByCode.get(code) ?? code;
}

/** Comma-separated list for plain-text fields (e.g. admin guide profiles). */
export function guideLanguagesPlainList() {
  return GUIDE_LANGUAGES.filter((lang) => lang.code !== "other")
    .map((lang) => lang.label)
    .join(", ");
}
