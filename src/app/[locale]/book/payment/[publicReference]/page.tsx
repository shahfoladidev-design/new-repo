import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PaymentResultClient } from "@/components/payment-result-client";
import { getPaymentStatus } from "@/lib/payments/payment-service";
import { getSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/i18n/config";
import { createServiceClient } from "@/lib/supabase/admin";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; publicReference: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/book", "bookTitle", "bookDescription");
}

export default async function PaymentResultPage({
  params,
}: {
  params: Promise<{ locale: Locale; publicReference: string }>;
}) {
  const { locale, publicReference } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");
  const th = await getTranslations("booking.hesabpay");
  const tNav = await getTranslations("nav");

  const status = await getPaymentStatus(publicReference);
  if (!status) notFound();

  const supabase = createServiceClient();
  const { data: attempt } = await supabase
    .from("payment_attempts")
    .select("booking_id")
    .eq("public_reference", publicReference)
    .maybeSingle();

  let booking = null;
  if (attempt?.booking_id) {
    const { data } = await supabase
      .from("booking_requests")
      .select(
        "payment_access_token, quoted_amount_minor, quoted_currency, payment_status, reference_price_minor, reference_price_currency, amount_paid_minor",
      )
      .eq("id", attempt.booking_id)
      .maybeSingle();
    booking = data;
  }

  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-3 py-8 sm:px-4 sm:py-12 md:px-6">
      <Breadcrumbs
        items={[
          { label: tNav("home"), href: "/" },
          { label: t("title"), href: "/book" },
          { label: th("confirming") },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{th("confirming")}</h1>
      <div className="mt-6">
        <PaymentResultClient
          publicReference={publicReference}
          initialStatus={status.status}
          bookingPaymentStatus={status.bookingPaymentStatus}
          paymentAccessToken={booking?.payment_access_token ?? status.paymentAccessToken}
          hesabPayEnabled={settings.hesabpay_enabled}
          referencePriceMinor={booking?.reference_price_minor ?? status.referencePriceMinor ?? null}
          referencePriceCurrency={booking?.reference_price_currency ?? null}
          quotedAmountMinor={booking?.quoted_amount_minor ?? status.quotedAmountMinor ?? null}
          quotedCurrency={booking?.quoted_currency ?? status.currency ?? null}
          amountPaidMinor={booking?.amount_paid_minor ?? status.amountPaidMinor ?? null}
        />
      </div>
    </div>
  );
}
