import { getTranslations, setRequestLocale } from "next-intl/server";
import { ScrollReveal } from "@/components/scroll-reveal";
import { localizedField } from "@/lib/content";
import { getCachedLegalDocuments } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";

export default async function AgreementsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("agreements");
  const docs = await getCachedLegalDocuments();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </ScrollReveal>
      <div className="mt-10 space-y-10">
        {docs.map((doc, i) => (
          <ScrollReveal key={doc.doc_type} delay={i * 50}>
            <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-xl font-semibold">{localizedField(doc, locale, "title")}</h2>
              <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-muted-foreground">
                {localizedField(doc, locale, "content")}
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
