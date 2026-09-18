import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooterClient } from "@/components/site-footer-client";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { LocaleDirection } from "@/components/locale-direction";
import { ServiceWorkerUpdater } from "@/components/service-worker-updater";
import { AppBackGuard } from "@/components/app-back-guard";
import { locales, type Locale } from "@/i18n/config";
import { getSiteSettings, siteSettingsCssVars } from "@/lib/site-settings";
import { getCachedNavCatalog } from "@/lib/cms-cache";
import { trimCatalogForLocale } from "@/lib/catalog-search";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { WebsiteJsonLd } from "@/components/website-json-ld";
import { RoutePrefetcher } from "@/components/route-prefetcher";
import { BrandMark } from "@/components/brand-mark";
import { LogoPreload } from "@/components/logo-preload";
import { resolveHeaderLogo } from "@/lib/logo";
import { GlassLookRoot } from "@/components/glass-look-root";
import { SiteBackground } from "@/components/site-background";
import { Analytics } from "@vercel/analytics/react";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    ...buildMetadata({
      locale,
      path: "",
      title: t("homeTitle"),
      description: t("homeDescription"),
    }),
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Shah Foladi",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const [settings, nav] = await Promise.all([getSiteSettings(), getCachedNavCatalog()]);
  const cssVars = siteSettingsCssVars(settings);
  const { packages: navPackages, destinations: navDestinations } = nav;
  const headerCatalog = trimCatalogForLocale(nav.catalog, locale as Locale);
  const headerLogo = resolveHeaderLogo(settings.logo_url, settings.updated_at);

  // Apply brand colors on :root so Tailwind `bg-primary` / `text-primary` resolve site-wide
  const rootColorCss = Object.entries(cssVars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

  return (
    <div
      style={cssVars}
      className={cn("site-shell relative flex min-h-screen flex-col", settings.glass_look_enabled && "glass-look")}
      data-glass={settings.glass_look_enabled ? "on" : "off"}
    >
      <SiteBackground />
      <LogoPreload src={headerLogo} />
      <style dangerouslySetInnerHTML={{ __html: `:root{${rootColorCss}}` }} />
      <NextIntlClientProvider messages={messages}>
        <LocaleDirection />
        <ServiceWorkerUpdater />
        <RoutePrefetcher />
        <GlassLookRoot enabled={Boolean(settings.glass_look_enabled)}>
          <AppBackGuard />
          <SiteHeader
            brandMark={<BrandMark src={headerLogo} />}
            packages={navPackages}
            destinations={navDestinations}
            catalog={headerCatalog}
          />
          <main className="flex-1 pb-20">{children}</main>
          <SiteFooterClient settings={settings} />
          <WhatsAppFloat whatsapp={settings.whatsapp ?? "+93700000000"} />
          <Analytics />
          <WebsiteJsonLd />
          <OrganizationJsonLd />
        </GlassLookRoot>
      </NextIntlClientProvider>
    </div>
  );
}
