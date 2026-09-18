import type { Metadata } from "next";
import { CmsMediaImage } from "@/components/cms-media-image";
import { DETAIL_COVER_SIZES } from "@/lib/hero-media";
import { isUsableImageUrl } from "@/lib/cms-media";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localizedField } from "@/lib/content";
import { getCachedBlogPost } from "@/lib/cms-pages";
import { getSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/i18n/config";
import { absoluteUrl, buildMetadata, getSiteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { toUrlSlug } from "@/lib/slug";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = await getCachedBlogPost(slug);

  if (!item) {
    return buildMetadata({
      locale,
      path: `/blog/${toUrlSlug(slug)}`,
      title: "Article",
      description: "Travel article from Shah Foladi.",
    });
  }

  const title = localizedField(item as never, locale, "title");
  const description =
    localizedField(item as never, locale, "excerpt") ||
    localizedField(item as never, locale, "content") ||
    title;

  return buildMetadata({
    locale,
    path: `/blog/${toUrlSlug(item.slug)}`,
    title,
    description: String(description).slice(0, 160),
    image: typeof item.image_url === "string" ? item.image_url : null,
    type: "article",
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const [item, settings] = await Promise.all([getCachedBlogPost(slug), getSiteSettings()]);

  if (!item) notFound();

  // Legacy/encoded slugs resolve, but redirect to the clean URL so only one page is indexed.
  const canonicalSlug = toUrlSlug(item.slug);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${locale}/blog/${canonicalSlug}`);
  }
  const publisherLogo = isUsableImageUrl(settings.logo_url)
    ? settings.logo_url!.startsWith("http")
      ? settings.logo_url!
      : `${getSiteUrl()}${settings.logo_url}`
    : undefined;

  const body = localizedField(item as never, locale, "content") || localizedField(item as never, locale, "excerpt");
  const title = localizedField(item as never, locale, "title");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: localizedField(item as never, locale, "excerpt") || body.slice(0, 160),
          image: typeof item.image_url === "string" ? item.image_url : undefined,
          url: absoluteUrl(locale, `/blog/${toUrlSlug(item.slug)}`),
          author: { "@type": "Organization", name: "Shah Foladi Travel", url: getSiteUrl() },
          publisher: {
            "@type": "Organization",
            name: "Shah Foladi Travel",
            ...(publisherLogo ? { logo: publisherLogo } : {}),
          },
        }}
      />
      {isUsableImageUrl(typeof item.image_url === "string" ? item.image_url : null) && (
        <div className="media-zoom group relative mb-8 aspect-[16/7] rounded-[2rem]">
          <CmsMediaImage src={String(item.image_url)} alt={title} fill className="object-cover" priority sizes={DETAIL_COVER_SIZES} />
        </div>
      )}
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{body}</p>
      <Link href="/blog" className="mt-10 inline-flex text-sm font-medium text-primary hover:underline">
        {t("back")}
      </Link>
    </article>
  );
}
