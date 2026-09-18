import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GalleryBrowser } from "@/components/gallery-browser";
import { localizedField } from "@/lib/content";
import { getCachedGalleryImages } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/gallery", "galleryTitle", "galleryDescription");
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = await getCachedGalleryImages();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("pages.gallery") }]} />
      <ScrollReveal>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight">{t("pages.gallery")}</h1>
        <p className="mb-10 max-w-2xl text-muted-foreground">{t("pages.galleryDesc")}</p>
      </ScrollReveal>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
          {t("pages.galleryEmpty")}
        </p>
      ) : (
        <GalleryBrowser
          allLabel={t("search.all")}
          items={items.map((item) => ({
            image_url: item.image_url,
            title:
              localizedField(
                {
                  title_en: item.title_en ?? undefined,
                  title_dari: item.title_dari,
                  title_pashto: item.title_pashto,
                },
                locale,
                "title",
              ) || null,
            location_tag: item.location_tag ?? null,
          }))}
        />
      )}
    </div>
  );
}
