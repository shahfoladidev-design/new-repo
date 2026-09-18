import type { Metadata } from "next";
import { BookingForm } from "@/components/booking-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OfflinePaymentInfo } from "@/components/offline-payment-info";
import { PaymentSecurityNote } from "@/components/payment-security-note";
import { getBookingOffers } from "@/lib/booking-offers-server";
import { offerSelectValue } from "@/lib/booking-offers";
import { getSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/i18n/config";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/book", "bookTitle", "bookDescription");
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("booking");
  const tNav = await getTranslations("nav");
  const [offers, settings] = await Promise.all([getBookingOffers(), getSiteSettings()]);
  const selectedValue =
    ref && offers.some((offer) => offerSelectValue(offer) === ref) ? ref : "";

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <Breadcrumbs items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:mt-4 sm:text-base">{t("subtitle")}</p>
      <div
        className={`mt-6 min-w-0 gap-6 lg:mt-8 lg:gap-8 ${
          settings.offline_payment_enabled ? "grid lg:grid-cols-[1.2fr_0.8fr]" : ""
        }`}
      >
        <div className="min-w-0 space-y-4">
          <BookingForm
            offers={offers}
            selectedValue={selectedValue}
            whatsapp={settings.whatsapp ?? "+93700000000"}
            whatsappNote={settings.payment_whatsapp_note_en}
            hesabPayEnabled={settings.hesabpay_enabled}
            offlinePaymentEnabled={settings.offline_payment_enabled}
          />
          <PaymentSecurityNote />
        </div>
        {settings.offline_payment_enabled ? (
          <OfflinePaymentInfo settings={settings} locale={locale} title={t("paymentInfoTitle")} />
        ) : null}
      </div>
    </div>
  );
}
