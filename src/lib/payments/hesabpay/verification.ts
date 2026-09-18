export function hasVerifiedHesabPayWebhookSignature(
  signature: string | null,
  verification: { valid?: boolean; isValid?: boolean } | null,
): boolean {
  return Boolean(signature) && (verification?.valid === true || verification?.isValid === true);
}

export function hasExpectedPaymentAmountAndCurrency(
  amountMinor: bigint | null,
  currency: string | null,
  expectedAmountMinor: bigint,
  expectedCurrency: string,
): boolean {
  return amountMinor === expectedAmountMinor && currency === expectedCurrency;
}
