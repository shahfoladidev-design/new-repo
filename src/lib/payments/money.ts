/** All prices and payments use USD. */
export const PAYMENT_CURRENCY = "USD" as const;
export type PaymentCurrency = typeof PAYMENT_CURRENCY;

/** Minor units: USD cents (2 decimal places). */
export function majorToMinor(amount: string | number, _currency: PaymentCurrency): bigint {
  const normalized = String(amount).trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Invalid monetary amount");
  }
  const [whole, frac = ""] = normalized.split(".");
  const padded = (frac + "00").slice(0, 2);
  const minor = BigInt(whole) * BigInt(100) + BigInt(padded);
  if (minor <= BigInt(0)) throw new Error("Amount must be positive");
  return minor;
}

export function minorToMajor(amountMinor: bigint): string {
  const negative = amountMinor < BigInt(0);
  const abs = negative ? -amountMinor : amountMinor;
  const whole = abs / BigInt(100);
  const frac = (abs % BigInt(100)).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${frac}`;
}

export function formatMoney(amountMinor: bigint, currency: PaymentCurrency, locale = "en"): string {
  const major = Number(minorToMajor(amountMinor));
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(major);
}

/** Provider APIs typically expect decimal major units as number or string. */
export function minorToProviderAmount(amountMinor: bigint): number {
  return Number(minorToMajor(amountMinor));
}

export function isPaymentCurrency(value: string): value is PaymentCurrency {
  return value === PAYMENT_CURRENCY;
}
