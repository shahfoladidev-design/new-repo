import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MessageSquareQuote } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ReviewAvatar } from "@/components/review-avatar";
import { StarRating } from "@/components/star-rating";
import { Link } from "@/i18n/navigation";
import { getCachedPublishedReviews } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/reviews", "reviewsTitle", "reviewsDescription");
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const reviews = await getCachedPublishedReviews();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("pages.reviews") }]} />
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("pages.reviews")}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("pages.reviewsDesc")}</p>
      </ScrollReveal>

      {reviews.length === 0 ? (
        <p className="mt-12 text-muted-foreground">{t("pages.reviewsEmpty")}</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {reviews.map((item, i) => (
            <ScrollReveal key={item.id} delay={Math.min(i, 8) * 30}>
              <blockquote className="pressable rounded-3xl border border-border bg-card p-6">
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
            </ScrollReveal>
          ))}
        </div>
      )}

      <ScrollReveal delay={50}>
        <p className="mt-12 text-center">
          <Link href="/" className="pressable text-sm font-medium text-primary hover:underline">
            {t("pages.reviewsBackHome")}
          </Link>
        </p>
      </ScrollReveal>
    </div>
  );
}
