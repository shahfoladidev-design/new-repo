import dynamic from "next/dynamic";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PackageGridWithShowMore } from "@/components/package-grid-with-show-more";
import { localizedField, placeholderPackages } from "@/lib/content";
import { offerSelectValue } from "@/lib/booking-offers";
import { formatPackageCardMeta } from "@/lib/catalog-price-display";
import { getSiteSettings } from "@/lib/site-settings";
import { getCachedHomepageContent } from "@/lib/cms-cache";
import { getCachedAboutPage } from "@/lib/cms-pages";
import { localizedAboutText } from "@/lib/about-page";
import { toUrlSlug } from "@/lib/slug";
import type { Locale } from "@/i18n/config";
import type { LucideIcon } from "lucide-react";
import {
  Compass,
  HeartHandshake,
  Images,
  MapPinned,
  MessageSquareQuote,
  ShieldCheck,
  Star,
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SocialLinks } from "@/components/social-links";
import { GalleryMosaic } from "@/components/gallery-mosaic";
import { ServiceCard } from "@/components/service-card";
import { ReviewAvatar } from "@/components/review-avatar";
import { StarRating } from "@/components/star-rating";
const ReviewForm = dynamic(
  () => import("@/components/review-form").then((m) => ({ default: m.ReviewForm })),
  {
    loading: () => (
      <div className="h-56 animate-pulse rounded-3xl border border-border bg-muted/30" aria-hidden />
    ),
  },
);

type ServiceRow = {
  slug: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  summary_en?: string | null;
  summary_dari?: string | null;
  summary_pashto?: string | null;
  image_url?: string | null;
  icon_key?: string | null;
};

type FaqPreview = {
  id: string;
  question_en: string;
  question_dari?: string | null;
  question_pashto?: string | null;
  answer_en?: string | null;
  answer_dari?: string | null;
  answer_pashto?: string | null;
};

type GalleryRow = { image_url: string; title_en?: string | null; location_tag?: string | null };

type VisitorReview = {
  id: string;
  full_name: string;
  country?: string | null;
  rating: number;
  review_text: string;
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [settings, home, about] = await Promise.all([
    getSiteSettings(),
    getCachedHomepageContent(),
    getCachedAboutPage(),
  ]);

  let packages: typeof placeholderPackages = [];
  let heroSlides: HeroSlide[] = [];
  let services: ServiceRow[] = [];
  let gallery: GalleryRow[] = [];
  let faqPreview: FaqPreview[] = [];
  let visitorReviews: VisitorReview[] = [];

  if (home.packages.length) packages = home.packages as typeof packages;
  if (home.heroSlides.length) heroSlides = home.heroSlides;
  gallery = home.gallery as GalleryRow[];
  services = home.services as ServiceRow[];
  faqPreview = home.faqs as FaqPreview[];
  visitorReviews = home.reviews as VisitorReview[];

  const aboutIntro = about ? localizedAboutText(about, locale, "intro") : "";
  const aboutTitle = about ? localizedAboutText(about, locale, "title") : "";

  const whyUs = Array.isArray(settings.why_us) && settings.why_us.length
    ? settings.why_us
    : [
        { title: t("features.expertGuides"), body: t("features.expertGuidesDesc") },
        { title: t("features.safetyComfort"), body: t("features.safetyComfortDesc") },
        { title: t("features.authentic"), body: t("features.authenticDesc") },
        { title: t("features.personalSupport"), body: t("features.personalSupportDesc") },
      ];

  const testimonials = Array.isArray(settings.testimonials) ? settings.testimonials : [];
  // ≤10 reviews → show all (max 10). >10 → show 5 + “read more”.
  const reviewPreviewLimit = visitorReviews.length > 10 ? 5 : Math.min(visitorReviews.length, 10);
  const visibleReviews = visitorReviews.slice(0, reviewPreviewLimit);
  const testimonialPreviewLimit = testimonials.length > 10 ? 5 : Math.min(testimonials.length, 10);
  const visibleTestimonials = testimonials.slice(0, testimonialPreviewLimit);
  const showMoreReviews =
    visitorReviews.length > reviewPreviewLimit ||
    (visitorReviews.length === 0 && testimonials.length > testimonialPreviewLimit);
  const whyIcons: LucideIcon[] = [Compass, ShieldCheck, MapPinned, HeartHandshake];

  /*
    Homepage flow (conversion → credibility → visuals → support):
    Hero → packages → why us → gallery → services → about → reviews → FAQ → social → CTA
  */
  return (
    <div>
      <HeroCarousel
        slides={heroSlides}
        locale={locale}
        fallbackPrimaryCta={t("hero.ctaPrimary")}
        fallbackSecondaryCta={t("hero.ctaSecondary")}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16 deferred-section">
        <ScrollReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">{t("sections.featuredPackages")}</h2>
              <p className="mt-3 text-muted-foreground">{t("sections.featuredPackagesDesc")}</p>
            </div>
            <Link href="/packages" className="pressable text-sm font-medium text-primary hover:underline">
              {t("sections.morePackages")}
            </Link>
          </div>
        </ScrollReveal>
        <PackageGridWithShowMore
          items={packages.map((item) => ({
            slug: item.slug,
            href: `/packages/${toUrlSlug(item.slug)}`,
            bookHref: `/book?ref=${encodeURIComponent(offerSelectValue({ kind: "package", slug: item.slug }))}`,
            title: localizedField(item, locale, "title"),
            summary: localizedField(item, locale, "summary"),
            imageUrl: item.image_url,
            meta: formatPackageCardMeta({
              route_label: "route_label" in item && item.route_label ? String(item.route_label) : null,
              price_from: item.price_from,
              price_currency: "price_currency" in item ? (item.price_currency as string | null) : null,
              duration_days: item.duration_days,
              fromLabel: t("common.from"),
              daysLabel: t("common.days"),
              locale,
            }),
          }))}
          ctaLabel={t("common.learnMore")}
          bookLabel={t("common.bookNow")}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16 deferred-section">
        <ScrollReveal>
          <div className="mb-10 max-w-2xl">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">{t("sections.whyUs")}</h2>
            <p className="mt-3 text-muted-foreground">{t("sections.whyUsDesc")}</p>
          </div>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {whyUs.slice(0, 4).map((item, i) => {
            const Icon = whyIcons[i % whyIcons.length];
            return <Feature key={`${item.title}-${i}`} icon={Icon} title={item.title} body={item.body} />;
          })}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <ScrollReveal>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-3xl font-semibold tracking-tight">{t("sections.galleryPreview")}</h2>
                <Link
                  href="/gallery"
                  className="pressable inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <Images className="h-4 w-4" aria-hidden />
                  {t("nav.gallery")}
                </Link>
              </div>
            </ScrollReveal>
            <GalleryMosaic
              href="/gallery"
              items={gallery.slice(0, 8).map((img) => ({
                image_url: img.image_url,
                title: img.title_en,
                location_tag: img.location_tag,
              }))}
            />
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16 deferred-section">
          <ScrollReveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">{t("sections.servicesPreview")}</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">{t("sections.servicesPreviewDesc")}</p>
              </div>
              <Link href="/services" className="pressable text-sm font-medium text-primary hover:underline">
                {t("sections.allServices")}
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.map((item) => (
              <ServiceCard
                key={item.slug}
                slug={item.slug}
                title={localizedField(item, locale, "title")}
                summary={localizedField(item, locale, "summary")}
                iconKey={item.icon_key}
                askLabel={t("sections.bookService")}
                href={`/book?ref=${encodeURIComponent(`service:${item.slug}`)}`}
              />
            ))}
          </div>
        </section>
      )}

      {aboutIntro ? (
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {aboutTitle || t("sections.aboutTeaser")}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{aboutIntro}</p>
                <Link href="/about" className="pressable mt-6 inline-flex text-sm font-medium text-primary hover:underline">
                  {t("sections.readMore")}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {(visitorReviews.length > 0 || testimonials.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16 deferred-section">
          <ScrollReveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <MessageSquareQuote className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">{t("sections.testimonials")}</h2>
              </div>
              {showMoreReviews ? (
                <Link href="/reviews" className="pressable text-sm font-medium text-primary hover:underline">
                  {t("sections.readMoreReviews")}
                </Link>
              ) : null}
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-2">
            {visibleReviews.map((item) => (
              <blockquote key={item.id} className="pressable rounded-3xl border border-border bg-card p-6">
                  <MessageSquareQuote className="mb-3 h-5 w-5 text-primary/50" aria-hidden />
                  <div className="flex items-center gap-3">
                    <ReviewAvatar name={item.full_name} />
                    <footer className="min-w-0 flex-1">
                      <span className="reviewer-name block text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4">
                        {item.full_name}
                      </span>
                      {item.country ? (
                        <span className="text-sm font-normal text-muted-foreground">{item.country}</span>
                      ) : null}
                      <div className="mt-1">
                        <StarRating rating={Number(item.rating)} size="sm" />
                      </div>
                    </footer>
                  </div>
                  <p className="mt-4 text-muted-foreground leading-relaxed">&ldquo;{item.review_text}&rdquo;</p>
                </blockquote>
            ))}
            {visitorReviews.length === 0 &&
              visibleTestimonials.map((item, i) => (
                  <blockquote key={`${item.name}-${i}`} className="pressable rounded-3xl border border-border bg-card p-6">
                    <MessageSquareQuote className="mb-3 h-5 w-5 text-primary/50" aria-hidden />
                    <div className="flex items-center gap-3">
                      <ReviewAvatar name={item.name} avatarUrl={item.avatar_url} />
                      <footer className="text-sm font-medium">
                        <span className="reviewer-name block font-semibold text-primary underline decoration-primary/40 underline-offset-4">
                          {item.name}
                        </span>
                        {item.country ? (
                          <span className="font-normal text-muted-foreground">{item.country}</span>
                        ) : null}
                      </footer>
                    </div>
                    <p className="mt-4 text-muted-foreground leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                  </blockquote>
              ))}
          </div>
          {showMoreReviews ? (
            <div className="mt-8 text-center md:hidden">
              <Link href="/reviews" className="pressable text-sm font-medium text-primary hover:underline">
                {t("sections.readMoreReviews")}
              </Link>
            </div>
          ) : null}
        </section>
      )}

      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            <ScrollReveal>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Star className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">{t("reviews.sectionTitle")}</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">{t("reviews.sectionSubtitle")}</p>
            </ScrollReveal>
            <ScrollReveal delay={50}>
              <ReviewForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {faqPreview.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16 deferred-section">
          <ScrollReveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight">{t("sections.faqPreview")}</h2>
                <p className="mt-3 text-muted-foreground">{t("sections.faqPreviewDesc")}</p>
              </div>
              <Link href="/faq" className="pressable text-sm font-medium text-primary hover:underline">
                {t("sections.seeAllFaq")}
              </Link>
            </div>
          </ScrollReveal>
          <div className="space-y-3">
            {faqPreview.map((faq) => {
              const q =
                (locale === "dari" && faq.question_dari) ||
                (locale === "ps" && faq.question_pashto) ||
                faq.question_en;
              const a =
                (locale === "dari" && faq.answer_dari) ||
                (locale === "ps" && faq.answer_pashto) ||
                faq.answer_en ||
                "";
              return (
                <details key={faq.id} className="rounded-2xl border border-border bg-card px-5 py-4">
                  <summary className="cursor-pointer font-medium">{q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
                </details>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16 deferred-section">
        <ScrollReveal>
          <div className="rounded-[2rem] border border-border bg-card/80 px-8 py-10 backdrop-blur-sm md:px-12">
            <h2 className="text-2xl font-semibold tracking-tight">{t("social.connectTitle")}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("social.connectBody")}</p>
            <SocialLinks settings={settings} className="mt-6" />
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:px-6">
        <ScrollReveal>
          <div className="rounded-[2rem] bg-primary px-8 py-12 text-primary-foreground md:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">{t("sections.ctaTitle")}</h2>
            <p className="mt-4 max-w-2xl text-primary-foreground/85">{t("sections.ctaDesc")}</p>
            <Link
              href="/book"
              className="pressable mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary hover:text-white hover:ring-1 hover:ring-white"
            >
              {t("sections.bookToday")}
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="pressable rounded-3xl border border-border bg-card p-6">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
