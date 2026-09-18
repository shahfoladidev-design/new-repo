import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CatalogBrowser } from "@/components/catalog-browser";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCachedDestinationCatalog } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";
import { MapPinPulse } from "@/components/animations/map-pin-pulse";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/destinations", "destinationsTitle", "destinationsDescription");
}

export default async function DestinationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = await getCachedDestinationCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("pages.destinations") }]} />
      <ScrollReveal variant="rise">
        <div className="mb-10 flex max-w-2xl items-start gap-3">
          <MapPinPulse className="mt-1 shrink-0" />
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{t("pages.destinations")}</h1>
            <p className="mt-3 text-muted-foreground">{t("search.destinationsHint")}</p>
          </div>
        </div>
      </ScrollReveal>
      <CatalogBrowser items={items} initialQuery={q} showDuration={false} showPrice={false} showProvince={false} />
    </div>
  );
}
