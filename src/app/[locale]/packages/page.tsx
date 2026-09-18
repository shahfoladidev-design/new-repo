import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CatalogBrowser } from "@/components/catalog-browser";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCachedPackageCatalog } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";
import { isPackageType } from "@/lib/package-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/packages", "packagesTitle", "packagesDescription");
}

export default async function PackagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { q = "", type } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = await getCachedPackageCatalog();
  const initialPackageType = isPackageType(type) ? type : "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("pages.packages") }]} />
      <ScrollReveal variant="rise">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">{t("pages.packages")}</h1>
          <p className="mt-3 text-muted-foreground">{t("search.packagesHint")}</p>
        </div>
      </ScrollReveal>
      <CatalogBrowser
        items={items}
        initialQuery={q}
        initialPackageType={initialPackageType}
        showPackageTypeTabs
      />
    </div>
  );
}
