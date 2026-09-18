"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { isRtl, type Locale } from "@/i18n/config";

const htmlLang: Record<Locale, string> = {
  en: "en",
  dari: "fa-AF",
  ps: "ps",
};

export function LocaleDirection() {
  const locale = useLocale() as Locale;

  useEffect(() => {
    const rtl = isRtl(locale);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = htmlLang[locale];
    document.body.classList.toggle("rtl", rtl);
    document.body.classList.toggle("ltr", !rtl);
  }, [locale]);

  return null;
}
