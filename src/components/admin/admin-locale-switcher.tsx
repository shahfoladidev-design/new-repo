"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { localeLabels, locales, type Locale } from "@/i18n/config";

export function AdminLocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  function onChange(next: string) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <select
      value={locale}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
      aria-label="Language"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
