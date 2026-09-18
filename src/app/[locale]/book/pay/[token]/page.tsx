import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HesabPayPaymentPanel } from "@/components/hesabpay-pay-button";
import { OfflinePaymentInfo } from "@/components/offline-payment-info";
import { PaymentSecurityNote } from "@/components/payment-security-note";
import { loadBookingByAccessToken } from "@/lib/payments/payment-service";
import { getSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/book", "bookTitle", "bookDescription");
}

export default async function BookPayPage({
  params,
}: {
  params: Promise<{ locale: Locale; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");
  const th = await getTranslations("booking.hesabpay");
  const tNav = await getTranslations("nav");

  const booking = await loadBookingByAccessToken(token);
  if (!booking) notFound();

  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <Breadcrumbs
        items={[
          { label: tNav("home"), href: "/" },
          { label: t("title"), href: "/book" },
          { label: th("payNowTitle") },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{th("payNowTitle")}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{th("payNowSubtitle")}</p>

      <div
        className={`mt-6 min-w-0 gap-6 lg:mt-8 lg:gap-8 ${
          settings.offline_payment_enabled ? "grid lg:grid-cols-[1.2fr_0.8fr]" : ""
        }`}
      >
        <div className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">{t("fullName")}</dt>
              <dd className="font-medium">{booking.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("yourReference")}</dt>
              <dd className="font-medium">
                {[booking.reference_code, booking.reference_title].filter(Boolean).join(" — ") || "—"}
              </dd>
            </div>
          </dl>

          <HesabPayPaymentPanel
            paymentAccessToken={token}
            hesabPayEnabled={settings.hesabpay_enabled}
            referencePriceMinor={booking.reference_price_minor}
            referencePriceCurrency={booking.reference_price_currency}
            quotedAmountMinor={booking.quoted_amount_minor}
            quotedCurrency={booking.quoted_currency}
            amountPaidMinor={booking.amount_paid_minor}
            paymentStatus={booking.payment_status}
          />

          <PaymentSecurityNote />
          {settings.offline_payment_enabled ? (
            <p className="text-xs text-muted-foreground">{th("offlineStillAvailable")}</p>
          ) : null}
        </div>

        {settings.offline_payment_enabled ? (
          <OfflinePaymentInfo settings={settings} locale={locale} title={t("paymentInfoTitle")} />
        ) : null}
      </div>
    </div>
  );
}
