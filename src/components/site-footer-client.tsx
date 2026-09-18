"use client";

import type { SiteSettings } from "@/lib/site-settings";
import { FooterContactLinks, SocialLinks } from "@/components/social-links";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { interpolate } from "@/lib/i18n-format";

function localizedAddress(settings: SiteSettings, locale: Locale) {
  if (locale === "dari") return settings.address_dari ?? settings.address_en;
  if (locale === "ps") return settings.address_pashto ?? settings.address_en;
  return settings.address_en;
}

export function SiteFooterClient({ settings }: { settings: SiteSettings }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("footer");
  const tBrand = useTranslations();
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const year = new Date().getFullYear();
  const address = localizedAddress(settings, locale);

  const officialEmails = [
    { address: "info@shahfoladi.com", label: t("emailInfo") },
    { address: "support@shahfoladi.com", label: t("emailSupport") },
    { address: "contact@shahfoladi.com", label: t("emailContact") },
    { address: "bookings@shahfoladi.com", label: t("emailBookings") },
    { address: "tours@shahfoladi.com", label: t("emailTours") },
    { address: "partners@shahfoladi.com", label: t("emailPartners") },
  ] as const;
  const primaryEmails = [
    officialEmails.find((e) => e.address === "bookings@shahfoladi.com") ?? officialEmails[3],
    officialEmails.find((e) => e.address === "info@shahfoladi.com") ?? officialEmails[0],
  ];
  const secondaryEmails = officialEmails.filter(
    (item) => !primaryEmails.some((primary) => primary.address === item.address),
  );

  const explore = [
    { href: "/", label: tNav("home") },
    { href: "/packages", label: tNav("packages") },
    { href: "/destinations", label: tNav("destinations") },
    { href: "/services", label: tNav("services") },
    { href: "/upcoming-tours", label: tNav("upcomingTours") },
  ] as const;

  const company = [
    { href: "/about", label: tNav("aboutUs") },
    { href: "/team", label: tNav("team") },
    { href: "/gallery", label: tNav("gallery") },
    { href: "/blog", label: tNav("articles") },
    { href: "/faq", label: tNav("faq") },
    { href: "/agreements", label: t("legalAgreements") },
    { href: "/contact", label: tNav("contact") },
    { href: "/book", label: tNav("book") },
  ] as const;

  return (
    <footer className="site-footer mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-4 md:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5">
          <div className="col-span-2 space-y-3 lg:col-span-1">
            <p className="font-display text-lg font-semibold tracking-tight">{tBrand("brand")}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t("agencyLine")}</p>
            {address ? <p className="text-sm text-muted-foreground">{address}</p> : null}
            {settings.phone ? (
              <a href={`tel:${settings.phone}`} className="block text-sm hover:text-primary hover:underline">
                {settings.phone}
              </a>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("explore")}</p>
            <ul className="mt-3 space-y-2">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-primary hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("company")}</p>
            <ul className="mt-3 space-y-2">
              {company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-primary hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("officialEmails")}</p>
            <ul className="mt-3 space-y-3">
              {primaryEmails.map((item) => (
                <li key={item.address}>
                  <a href={`mailto:${item.address}`} className="block text-xs hover:text-primary hover:underline">
                    {item.address}
                  </a>
                  <span className="block text-[11px] text-muted-foreground">{item.label}</span>
                </li>
              ))}
            </ul>
            {secondaryEmails.length > 0 ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
                  {t("moreEmails")}
                </summary>
                <ul className="mt-2 space-y-2">
                  {secondaryEmails.map((item) => (
                    <li key={item.address}>
                      <a href={`mailto:${item.address}`} className="block text-xs hover:text-primary hover:underline">
                        {item.address}
                      </a>
                      <span className="block text-[11px] text-muted-foreground">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>

          <div className="col-span-2 space-y-3 lg:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("followUs")}</p>
            <SocialLinks settings={settings} />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <FooterContactLinks
                settings={settings}
                labels={{
                  whatsapp: tContact("whatsappHelp"),
                  telegram: tContact("telegram"),
                  email: settings.email ?? tContact("email"),
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p>{interpolate(t.raw("copyright"), { year })}</p>
            <p>{t("trademark")}</p>
            <p>{t("disclaimer")}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <Link href="/privacy" className="hover:text-primary hover:underline">
                {t("privacyPolicy")}
              </Link>
              <Link href="/terms" className="hover:text-primary hover:underline">
                {t("termsOfService")}
              </Link>
              <Link href="/agreements" className="hover:text-primary hover:underline">
                {t("legalAgreements")}
              </Link>
              <Link href="/contact" className="hover:text-primary hover:underline">
                {tNav("contact")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5 pb-2">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("getTheApp")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t("installHint")}</p>
            </div>
            <PwaInstallButton className="w-full sm:w-auto" />
          </div>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[9px] leading-relaxed text-muted-foreground opacity-55">
            <span>{t("developerCredit")}</span>
            <a
              href="https://akbaridev.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2"
            >
              <img
                src="/brand/akbari-dev-logo.png"
                alt=""
                aria-hidden="true"
                className="h-3.5 w-auto object-contain opacity-70"
              />
              <span>Mohammad Afzal Akbari, Akbari Development Group</span>
            </a>
            <span>· 0788995093</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
