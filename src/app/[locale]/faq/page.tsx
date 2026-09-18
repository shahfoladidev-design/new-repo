import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCachedFaqs } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/faq", "faqTitle", "faqDescription");
}

export default async function FaqPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const faqs = await getCachedFaqs();

  const byCategory = faqs.reduce<Record<string, Array<Record<string, unknown>>>>((acc, faq) => {
    const key = String(faq.category ?? "general");
    acc[key] = acc[key] ?? [];
    acc[key].push(faq);
    return acc;
  }, {});

  const faqEntities = faqs
    .map((faq) => {
      const q = String(
        (locale === "dari" && faq.question_dari) ||
          (locale === "ps" && faq.question_pashto) ||
          faq.question_en ||
          "",
      );
      const a = String(
        (locale === "dari" && faq.answer_dari) ||
          (locale === "ps" && faq.answer_pashto) ||
          faq.answer_en ||
          "",
      );
      if (!q || !a) return null;
      return {
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      };
    })
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      {faqEntities.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqEntities,
          }}
        />
      ) : null}
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("pages.faq") }]} />
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("pages.faq")}</h1>
        <p className="mt-4 text-muted-foreground">{t("pages.faqDesc")}</p>
      </ScrollReveal>

      <div className="mt-12 space-y-10">
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-4 text-xl font-semibold capitalize">{category.replaceAll("_", " ")}</h2>
            <div className="space-y-3">
              {items.map((faq) => {
                const q = String(
                  (locale === "dari" && faq.question_dari) ||
                    (locale === "ps" && faq.question_pashto) ||
                    faq.question_en ||
                    "",
                );
                const a = String(
                  (locale === "dari" && faq.answer_dari) ||
                    (locale === "ps" && faq.answer_pashto) ||
                    faq.answer_en ||
                    "",
                );
                return (
                  <details key={String(faq.id)} className="rounded-2xl border border-border bg-card px-5 py-4">
                    <summary className="cursor-pointer font-medium">{q}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
                  </details>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
