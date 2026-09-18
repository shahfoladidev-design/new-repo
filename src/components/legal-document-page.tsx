import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ScrollReveal } from "@/components/scroll-reveal";

type LegalDocumentPageProps = {
  namespace: "legal.privacy" | "legal.terms";
};

export async function LegalDocumentPage({ namespace }: LegalDocumentPageProps) {
  const t = await getTranslations(namespace);
  const tNav = await getTranslations("nav");
  const tLegal = await getTranslations("legal");
  const sections = t.raw("sections") as Array<{ title: string; body: string }>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <Breadcrumbs
        items={[
          { label: tNav("home"), href: "/" },
          { label: t("title") },
        ]}
      />
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </ScrollReveal>

      <ScrollReveal delay={40}>
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
          {t("placeholderNotice")}
        </div>
      </ScrollReveal>

      <div className="mt-10 space-y-8">
        {sections.map((section, i) => (
          <ScrollReveal key={section.title} delay={50 + i * 30}>
            <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={70}>
        <p className="mt-10 text-sm text-muted-foreground">
          {tLegal("questionsPrefix")}{" "}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            {tNav("contact")}
          </Link>
          .
        </p>
      </ScrollReveal>
    </div>
  );
}
