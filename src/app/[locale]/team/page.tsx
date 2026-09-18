import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getCachedTeamMembers } from "@/lib/cms-pages";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/team", "teamTitle", "teamDescription");
}

export default async function TeamPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const members = await getCachedTeamMembers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <ScrollReveal>
        <h1 className="text-4xl font-semibold tracking-tight">{t("pages.team")}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("pages.teamDesc")}</p>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member, i) => (
          <ScrollReveal key={String(member.id ?? member.name)} delay={i * 40}>
            <article className="group overflow-hidden rounded-3xl border border-border bg-card">
              {typeof member.image_url === "string" && member.image_url && (
                <div className="media-zoom relative aspect-[4/3]">
                  <Image src={member.image_url} alt={String(member.name)} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold">{String(member.name)}</h2>
                <p className="mt-1 text-sm text-primary">
                  {String(
                    (locale === "dari" && member.role_dari) ||
                      (locale === "ps" && member.role_pashto) ||
                      member.role_en ||
                      "",
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {String(
                    (locale === "dari" && member.bio_dari) ||
                      (locale === "ps" && member.bio_pashto) ||
                      member.bio_en ||
                      "",
                  )}
                </p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
