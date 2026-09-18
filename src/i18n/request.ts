import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "dari" | "ps")) {
    const cookieStore = await cookies();
    locale = cookieStore.get("NEXT_LOCALE")?.value;
  }

  if (!locale || !routing.locales.includes(locale as "en" | "dari" | "ps")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
