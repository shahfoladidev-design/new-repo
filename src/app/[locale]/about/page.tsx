import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { getCachedAboutPage } from "@/lib/cms-pages";
import { ABOUT_SECTIONS, localizedAboutText } from "@/lib/about-page";
import { isUsableImageUrl } from "@/lib/cms-media";
import { buildMetadata, locales } from "@/lib/seo";
import { ScrollReveal } from "@/components/scroll-reveal";

const SECTION_LABEL_KEYS = {
  who_we_are: "whoWeAre",
  approach: "approach",
  purpose: "purpose",
  where_we_operate: "whereWeOperate",
  working_with_us: "workingWithUs",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  setRequestLocale(locale);
  const about = await getCachedAboutPage();
  const t = await getTranslations({ locale, namespace: "seo" });

  const title =
    (about && localizedAboutText(about, locale, "meta_title")) ||
    (about && localizedAboutText(about, locale, "title")) ||
    t("aboutTitle");
  const description =
    (about && localizedAboutText(about, locale, "meta_description")) ||
    (about && localizedAboutText(about, locale, "intro")) ||
    t("aboutDescription");

  return buildMetadata({
    locale,
    path: "/about",
    title,
    description,
    image: about?.hero_image_url,
    noIndex: !about,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const about = await getCachedAboutPage();
  if (!about) notFound();

  const title = localizedAboutText(about, locale, "title");
  const intro = localizedAboutText(about, locale, "intro");
  const sections = ABOUT_SECTIONS.map((key) => ({
    key,
    heading: t(`about.sections.${SECTION_LABEL_KEYS[key]}`),
    body: localizedAboutText(about, locale, key),
  })).filter((section) => section.body);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {intro ? <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p> : null}
      </ScrollReveal>

      {isUsableImageUrl(about.hero_image_url) ? (
        <ScrollReveal className="mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border">
            <Image
              src={about.hero_image_url!}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        </ScrollReveal>
      ) : null}

      <div className="mt-12 space-y-10">
        {sections.map((section, index) => (
          <ScrollReveal key={section.key} delay={index * 40}>
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-line">{section.body}</p>
            </section>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal className="mt-12">
        <div className="flex flex-wrap gap-3">
          <Link href="/team" className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted">
            {t("nav.team")}
          </Link>
          <Link href="/book" className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted">
            {t("nav.book")}
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            {t("nav.contact")}
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
