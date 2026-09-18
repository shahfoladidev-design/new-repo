"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HesabPayPaymentPanel } from "@/components/hesabpay-pay-button";

type Props = {
  publicReference: string;
  initialStatus: string;
  bookingPaymentStatus: string | null;
  paymentAccessToken: string | null;
  hesabPayEnabled: boolean;
  referencePriceMinor: number | null;
  referencePriceCurrency: string | null;
  quotedAmountMinor: number | null;
  quotedCurrency: string | null;
  amountPaidMinor: number | null;
};

export function PaymentResultClient({
  publicReference,
  initialStatus,
  bookingPaymentStatus,
  paymentAccessToken,
  hesabPayEnabled,
  referencePriceMinor,
  referencePriceCurrency,
  quotedAmountMinor,
  quotedCurrency,
  amountPaidMinor,
}: Props) {
  const t = useTranslations("booking.hesabpay");
  const [status, setStatus] = useState(initialStatus);
  const [bookingPaid, setBookingPaid] = useState(bookingPaymentStatus === "paid");

  useEffect(() => {
    if (bookingPaid || status === "succeeded") return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/hesabpay/status/${publicReference}`, { cache: "no-store" });
        const data = (await res.json()) as {
          status?: string;
          bookingPaymentStatus?: string;
        };
        if (cancelled) return;
        if (data.status) setStatus(data.status);
        if (data.bookingPaymentStatus === "paid") setBookingPaid(true);
      } catch {
        /* ignore */
      }
    };

    poll();
    const id = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicReference, bookingPaid, status]);

  const verified = bookingPaid || status === "succeeded";
  const partial = bookingPaymentStatus === "partial";
  const failed = status === "failed" || status === "cancelled" || status === "expired";

  return (
    <div className="space-y-4">
      {verified ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="font-medium">{t("confirmed")}</p>
        </div>
      ) : partial ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-sky-900">
          <p className="font-medium">{t("partialReceived")}</p>
          <p className="mt-2 text-sm">{t("confirming")}</p>
        </div>
      ) : failed ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p className="font-medium">{t("notCompleted")}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-medium">{t("confirming")}</p>
          <p className="mt-2 text-sm">{t("doNotClose")}</p>
        </div>
      )}

      {!verified && paymentAccessToken ? (
        <HesabPayPaymentPanel
          paymentAccessToken={paymentAccessToken}
          hesabPayEnabled={hesabPayEnabled}
          referencePriceMinor={referencePriceMinor}
          referencePriceCurrency={referencePriceCurrency}
          quotedAmountMinor={quotedAmountMinor}
          quotedCurrency={quotedCurrency}
          amountPaidMinor={amountPaidMinor}
          paymentStatus={bookingPaymentStatus ?? "unpaid"}
          compact
        />
      ) : null}

      {paymentAccessToken ? (
        <Link href={`/book/pay/${paymentAccessToken}`} className="text-sm underline">
          {t("backToBooking")}
        </Link>
      ) : null}
    </div>
  );
}
