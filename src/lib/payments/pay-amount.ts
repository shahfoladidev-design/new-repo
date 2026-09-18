import type { PaymentCurrency } from "@/lib/payments/money";
import { majorToMinor } from "@/lib/payments/money";

/** Convert packages.price_from (numeric major units) to minor units. */
export function packagePriceToMinor(priceFrom: number | string | null | undefined): bigint | null {
  if (priceFrom == null || priceFrom === "") return null;
  const n = typeof priceFrom === "number" ? priceFrom : Number(priceFrom);
  if (!Number.isFinite(n) || n <= 0) return null;
  return majorToMinor(n.toFixed(2), "USD");
}

export type ReferencePriceSnapshot = {
  reference_price_minor: number;
  reference_price_currency: PaymentCurrency;
};

export function snapshotFromPackagePrice(
  priceFrom: number | string | null | undefined,
  currency: PaymentCurrency = "USD",
): ReferencePriceSnapshot | null {
  const minor = packagePriceToMinor(priceFrom);
  if (minor == null) return null;
  return {
    reference_price_minor: Number(minor),
    reference_price_currency: currency,
  };
}

/**
 * Validate guest-selected pay amount against admin quote and remaining balance.
 * Browser amount is never trusted without these checks.
 */
export function resolveAuthorizedPayAmount(opts: {
  payAmountMinor: bigint;
  quotedAmountMinor: bigint;
  amountPaidMinor: bigint;
  currency: PaymentCurrency;
  quotedCurrency: PaymentCurrency;
}): bigint {
  if (opts.currency !== opts.quotedCurrency) {
    throw new Error("Currency mismatch");
  }
  if (opts.payAmountMinor <= BigInt(0)) {
    throw new Error("Amount must be positive");
  }
  const remaining = opts.quotedAmountMinor - opts.amountPaidMinor;
  if (remaining <= BigInt(0)) {
    throw new Error("Nothing left to pay");
  }
  if (opts.payAmountMinor > remaining) {
    throw new Error("Amount exceeds remaining balance");
  }
  return opts.payAmountMinor;
}

export function remainingPayableMinor(quotedAmountMinor: number | null, amountPaidMinor: number | null): bigint | null {
  if (quotedAmountMinor == null) return null;
  const remaining = BigInt(quotedAmountMinor) - BigInt(amountPaidMinor ?? 0);
  return remaining > BigInt(0) ? remaining : BigInt(0);
}
