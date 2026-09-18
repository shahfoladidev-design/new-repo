import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { localizedField } from "@/lib/content";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceCard } from "@/components/service-card";
import { getCachedServices } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/services", "servicesTitle", "servicesDescription");
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = await getCachedServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("pages.services") }]} />
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("pages.services")}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("pages.servicesDesc")}</p>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <ScrollReveal key={String(item.slug)} delay={i * 40}>
            <ServiceCard
              slug={String(item.slug)}
              title={localizedField(item as never, locale, "title")}
              summary={
                localizedField(item as never, locale, "description") ||
                localizedField(item as never, locale, "summary")
              }
              iconKey={typeof item.icon_key === "string" ? item.icon_key : null}
              askLabel={t("sections.askAboutService")}
              href={`/book?ref=${encodeURIComponent(`service:${String(item.slug)}`)}`}
            />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
