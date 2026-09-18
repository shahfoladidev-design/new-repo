import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/scroll-reveal";
import { UpcomingToursBrowser } from "@/components/upcoming-tours-browser";
import { getCachedUpcomingCatalog } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/upcoming-tours", "upcomingTitle", "upcomingDescription");
}

export default async function UpcomingToursPage({
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
  const items = await getCachedUpcomingCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("pages.upcomingTours")}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("pages.upcomingToursDesc")}</p>
      </ScrollReveal>
      <UpcomingToursBrowser items={items} initialQuery={q} />
    </div>
  );
}
