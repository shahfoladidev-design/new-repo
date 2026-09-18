import { cookies, headers } from "next/headers";
import { defaultLocale, isRtl, locales, type Locale } from "@/i18n/config";
import { htmlLang } from "@/lib/seo";

export async function resolveDocumentLocale(): Promise<Locale> {
  const headersList = await headers();
  const fromHeader = headersList.get("x-site-locale");
  if (fromHeader && locales.includes(fromHeader as Locale)) {
    return fromHeader as Locale;
  }

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("NEXT_LOCALE")?.value;
  if (fromCookie && locales.includes(fromCookie as Locale)) {
    return fromCookie as Locale;
  }

  return defaultLocale;
}

export async function resolveDocumentHtmlAttrs() {
  const locale = await resolveDocumentLocale();
  return {
    locale,
    lang: htmlLang(locale),
    dir: isRtl(locale) ? ("rtl" as const) : ("ltr" as const),
  };
}
