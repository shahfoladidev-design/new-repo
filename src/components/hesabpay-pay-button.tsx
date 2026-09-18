"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney, majorToMinor, minorToMajor, type PaymentCurrency } from "@/lib/payments/money";
import { interpolate } from "@/lib/i18n-format";

type Props = {
  paymentAccessToken: string;
  hesabPayEnabled: boolean;
  referencePriceMinor: number | null;
  referencePriceCurrency: string | null;
  quotedAmountMinor: number | null;
  quotedCurrency: string | null;
  amountPaidMinor: number | null;
  paymentStatus: string;
  compact?: boolean;
};

export function HesabPayPaymentPanel({
  paymentAccessToken,
  hesabPayEnabled,
  referencePriceMinor,
  referencePriceCurrency,
  quotedAmountMinor,
  quotedCurrency,
  amountPaidMinor,
  paymentStatus,
  compact = false,
}: Props) {
  const t = useTranslations("booking.hesabpay");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currency = (quotedCurrency ?? referencePriceCurrency ?? "USD") as PaymentCurrency;
  const intlLocale = locale === "ps" ? "ps-AF" : locale === "dari" ? "fa-AF" : "en";

  const remainingMinor = useMemo(() => {
    if (quotedAmountMinor == null) return null;
    const rem = BigInt(quotedAmountMinor) - BigInt(amountPaidMinor ?? 0);
    return rem > BigInt(0) ? rem : BigInt(0);
  }, [quotedAmountMinor, amountPaidMinor]);

  const defaultPayMajor = remainingMinor != null ? minorToMajor(remainingMinor) : "";

  const [payAmount, setPayAmount] = useState(defaultPayMajor);

  if (!hesabPayEnabled) return null;

  if (paymentStatus === "paid") {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        {t("confirmed")}
      </p>
    );
  }

  const referenceLabel =
    referencePriceMinor != null && referencePriceCurrency
      ? formatMoney(BigInt(referencePriceMinor), referencePriceCurrency as PaymentCurrency, intlLocale)
      : null;

  const dueLabel =
    quotedAmountMinor != null && quotedCurrency
      ? formatMoney(BigInt(quotedAmountMinor), quotedCurrency as PaymentCurrency, intlLocale)
      : null;

  const showCatalogSeparate =
    referenceLabel && dueLabel && referencePriceMinor !== quotedAmountMinor;

  const paidLabel =
    amountPaidMinor != null && amountPaidMinor > 0 && quotedCurrency
      ? formatMoney(BigInt(amountPaidMinor), currency, intlLocale)
      : null;

  if (!quotedAmountMinor || !quotedCurrency || remainingMinor === null || remainingMinor <= BigInt(0)) {
    return (
      <div className="space-y-2">
        {referenceLabel ? (
          <p className="text-sm text-muted-foreground">
            {t("packagePrice")}: <span className="font-medium text-foreground">{referenceLabel}</span>
          </p>
        ) : null}
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {t("awaitingAmount")}
        </p>
      </div>
    );
  }

  async function startPayment() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/hesabpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentAccessToken,
          locale,
          payAmount,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || t("failed"));
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError(t("failed"));
      setLoading(false);
    }
  }

  const payingLabel = (() => {
    try {
      if (!payAmount.trim()) return null;
      return formatMoney(majorToMinor(payAmount.trim(), currency), currency, intlLocale);
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-4">
      <dl className="grid gap-2 text-sm">
        {showCatalogSeparate ? (
          <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
            <dt className="text-muted-foreground">{t("packagePrice")}</dt>
            <dd className="font-semibold">{referenceLabel}</dd>
          </div>
        ) : null}
        {dueLabel ? (
          <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
            <dt className="text-muted-foreground">{t("totalAmountDue")}</dt>
            <dd className="font-semibold">{dueLabel}</dd>
          </div>
        ) : referenceLabel ? (
          <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
            <dt className="text-muted-foreground">{t("totalAmountDue")}</dt>
            <dd className="font-semibold">{referenceLabel}</dd>
          </div>
        ) : null}
        {paidLabel ? (
          <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
            <dt className="text-muted-foreground">{t("alreadyPaid")}</dt>
            <dd className="font-semibold">{paidLabel}</dd>
          </div>
        ) : null}
        {remainingMinor != null && remainingMinor > BigInt(0) ? (
          <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
            <dt className="text-muted-foreground">{t("remaining")}</dt>
            <dd className="font-semibold">{formatMoney(remainingMinor, currency, intlLocale)}</dd>
          </div>
        ) : null}
      </dl>

      <label className="grid gap-1.5 text-sm">
        <span>{t("payAmountLabel")}</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="w-full min-w-[8rem] max-w-xs rounded-lg border border-border bg-background px-3 py-2.5 sm:rounded-xl"
            aria-describedby="hesabpay-amount-notice"
          />
          <span className="text-muted-foreground">{currency}</span>
        </div>
        <span id="hesabpay-amount-notice" className="text-xs text-muted-foreground">
          {t("payAmountHint")}
        </span>
      </label>

      {referenceLabel && payingLabel ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {interpolate(t.raw("partialNotice"), { paying: payingLabel, packagePrice: referenceLabel })}
        </p>
      ) : null}

      <button
        type="button"
        onClick={startPayment}
        disabled={loading || !payAmount.trim()}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:w-fit"
        aria-busy={loading}
      >
        {loading ? t("redirecting") : t("paySecurely")}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!compact ? (
        <>
          <p className="text-xs text-muted-foreground">{t("pendingNote")}</p>
          <Link href={`/book/pay/${paymentAccessToken}`} className="text-sm underline">
            {t("viewPaymentPage")}
          </Link>
        </>
      ) : null}
    </div>
  );
}

/** @deprecated Use HesabPayPaymentPanel */
export function HesabPayPayButton(props: Omit<Props, "compact">) {
  return <HesabPayPaymentPanel {...props} compact />;
}
