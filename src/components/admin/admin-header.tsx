"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AdminLocaleSwitcher } from "@/components/admin/admin-locale-switcher";
import type { Locale } from "@/i18n/config";

export function AdminHeader({ email }: { email: string }) {
  const t = useTranslations("admin.header");
  const locale = useLocale() as Locale;

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:ps-6">
      <div className="ps-12 lg:ps-0">
        <p className="text-sm text-muted-foreground">{t("signedInAs")}</p>
        <p className="font-medium">{email}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 ps-12 lg:ps-0">
        <AdminLocaleSwitcher />
        <Link href="/admin/account" className="text-sm underline-offset-4 hover:underline">
          {t("account")}
        </Link>
        <Link href={`/${locale}`} target="_blank" className="text-sm underline-offset-4 hover:underline">
          {t("viewWebsite")}
        </Link>
        <form action="/admin/logout" method="post">
          <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
            {t("signOut")}
          </button>
        </form>
      </div>
    </header>
  );
}
