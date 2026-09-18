import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";
import { SocialLinks } from "@/components/social-links";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSiteSettings } from "@/lib/site-settings";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/contact", "contactTitle", "contactDescription");
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tNav = await getTranslations("nav");
  const tSocial = await getTranslations("social");
  const settings = await getSiteSettings();
  const wa = settings.whatsapp?.replace(/\D/g, "") ?? "937000000000";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <Breadcrumbs items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} />
      <ScrollReveal variant="rise">
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </ScrollReveal>

      <ScrollReveal delay={40} variant="scale">
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-white shadow-md transition hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon className="h-6 w-6 shrink-0" />
            <div className="text-start">
              <p className="font-semibold">{t("whatsappHelp")}</p>
              <p className="text-sm text-emerald-50">{t("whatsappPrimary")}</p>
            </div>
          </a>
          <Link
            href="/book"
            className="flex items-center justify-center rounded-2xl bg-primary px-6 py-4 text-center font-semibold text-primary-foreground transition hover:opacity-95"
          >
            {tNav("book")}
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={70} variant="slide">
        <p className="mt-8 text-sm font-medium text-muted-foreground">{t("otherWays")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted/50">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-sm">{settings.phone}</span>
            </a>
          )}
          {settings.email && settings.email.toLowerCase() !== "contact@shahfoladi.com" && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted/50">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm">{settings.email}</span>
            </a>
          )}
          <a href="mailto:contact@shahfoladi.com" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted/50">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm">
              <span className="block">contact@shahfoladi.com</span>
              <span className="block text-xs text-muted-foreground">{t("generalEmailHint")}</span>
            </span>
          </a>
          {settings.telegram_url && (
            <a
              href={settings.telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted/50"
            >
              <Send className="h-5 w-5 text-primary" />
              <span className="text-sm">{t("telegram")}</span>
            </a>
          )}
          {settings.address_en && (
            <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm">
                {locale === "dari" ? settings.address_dari ?? settings.address_en : locale === "ps" ? settings.address_pashto ?? settings.address_en : settings.address_en}
              </span>
            </div>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={90} variant="rise">
        <div className="mt-8 rounded-2xl border border-border bg-muted/20 p-5">
          <p className="text-sm font-medium">{tSocial("connectTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{tSocial("connectBody")}</p>
          <SocialLinks settings={settings} className="mt-4" />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={110} variant="scale">
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">{t("formTitle")}</h2>
          <ContactForm />
        </div>
      </ScrollReveal>
    </div>
  );
}
