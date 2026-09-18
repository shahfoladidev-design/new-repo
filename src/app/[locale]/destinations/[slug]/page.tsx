import type { Metadata } from "next";
import { CmsMediaImage } from "@/components/cms-media-image";
import { DETAIL_COVER_SIZES, HIGHLIGHT_CARD_SIZES } from "@/lib/hero-media";
import { isUsableImageUrl } from "@/lib/cms-media";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapEmbed } from "@/components/map-embed";
import { localizedField } from "@/lib/content";
import { getCachedDestinationDetailWithAttractions } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { toUrlSlug } from "@/lib/slug";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const detail = await getCachedDestinationDetailWithAttractions(slug);
  const item = detail?.item;

  if (!item) {
    return buildMetadata({
      locale,
      path: `/destinations/${toUrlSlug(slug)}`,
      title: "Destination",
      description: "Afghanistan destination with Shah Foladi Travel.",
    });
  }

  const title = localizedField(item as never, locale, "title");
  const description =
    localizedField(item as never, locale, "summary") ||
    localizedField(item as never, locale, "description") ||
    title;

  return buildMetadata({
    locale,
    path: `/destinations/${toUrlSlug(item.slug)}`,
    title,
    description: String(description).slice(0, 160),
    image: typeof item.image_url === "string" ? item.image_url : null,
  });
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const detail = await getCachedDestinationDetailWithAttractions(slug);
  if (!detail) notFound();

  const { item, attractions } = detail;

  // Legacy/encoded slugs resolve, but redirect to the clean URL so only one page is indexed.
  const canonicalSlug = toUrlSlug(item.slug);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${locale}/destinations/${canonicalSlug}`);
  }
  const lat = item.latitude != null ? Number(item.latitude) : null;
  const lng = item.longitude != null ? Number(item.longitude) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      {isUsableImageUrl(typeof item.image_url === "string" ? item.image_url : null) && (
        <div className="media-zoom group relative mb-8 aspect-[16/7] rounded-[2rem]">
          <CmsMediaImage
            src={String(item.image_url)}
            alt={localizedField(item as never, locale, "title")}
            fill
            className="object-cover"
            priority
            sizes={DETAIL_COVER_SIZES}
          />
        </div>
      )}
      <h1 className="text-4xl font-semibold tracking-tight">{localizedField(item as never, locale, "title")}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {localizedField(item as never, locale, "description") || localizedField(item as never, locale, "summary")}
      </p>

      {attractions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">{t("pages.highlights")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {attractions.map((a) => (
              <article key={String(a.id)} className="overflow-hidden rounded-2xl border border-border bg-card">
                {isUsableImageUrl(typeof a.image_url === "string" ? a.image_url : null) && (
                  <div className="media-zoom relative aspect-[16/10] bg-muted">
                    <CmsMediaImage
                      src={String(a.image_url)}
                      alt={localizedField(a as never, locale, "title")}
                      fill
                      className="object-cover"
                      sizes={HIGHLIGHT_CARD_SIZES}
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold">{localizedField(a as never, locale, "title")}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{localizedField(a as never, locale, "summary")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {lat && lng && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">{t("common.location")}</h2>
          <MapEmbed latitude={lat} longitude={lng} title={localizedField(item as never, locale, "title")} />
        </div>
      )}
      <Link href="/book" className="mt-10 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
        {t("nav.book")}
      </Link>
    </div>
  );
}
