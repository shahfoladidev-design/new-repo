import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/seo";
import { majorToMinor, minorToMajor, minorToProviderAmount, type PaymentCurrency } from "@/lib/payments/money";
import { createPaymentSession, HesabPayApiError } from "@/lib/payments/hesabpay/client";
import { isAllowedCheckoutUrl } from "@/lib/payments/hesabpay/config";
import { getResolvedHesabPayConfig, isHesabPayOperational } from "@/lib/payments/hesabpay/settings-server";
import { resolveAuthorizedPayAmount } from "@/lib/payments/pay-amount";
import { mapProviderStatus } from "@/lib/payments/hesabpay/types";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/seo";

export type BookingPayRow = {
  id: string;
  full_name: string;
  email: string;
  reference_title: string | null;
  reference_code: string | null;
  reference_price_minor: number | null;
  reference_price_currency: string | null;
  quoted_amount_minor: number | null;
  quoted_currency: string | null;
  amount_paid_minor: number | null;
  payment_status: string;
  payment_access_token: string;
  paid_at: string | null;
};

const BOOKING_PAY_SELECT =
  "id, full_name, email, reference_title, reference_code, reference_price_minor, reference_price_currency, quoted_amount_minor, quoted_currency, amount_paid_minor, payment_status, payment_access_token, paid_at";

export async function loadBookingByAccessToken(token: string): Promise<BookingPayRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("booking_requests")
    .select(BOOKING_PAY_SELECT)
    .eq("payment_access_token", token)
    .maybeSingle();
  return data as BookingPayRow | null;
}

export async function loadBookingById(id: string): Promise<BookingPayRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("booking_requests").select(BOOKING_PAY_SELECT).eq("id", id).maybeSingle();
  return data as BookingPayRow | null;
}

function bookingProductName(booking: BookingPayRow, payMinor: bigint, currency: PaymentCurrency): string {
  const base = [booking.reference_code, booking.reference_title].filter(Boolean).join(" — ") || "Tour booking";
  const payLabel = minorToMajor(payMinor);
  const refMinor =
    booking.reference_price_minor != null ? BigInt(booking.reference_price_minor) : null;
  if (refMinor != null && payMinor < refMinor) {
    return `${base} (partial ${payLabel} ${currency}; full ${minorToMajor(refMinor)} ${currency})`;
  }
  return base;
}

export async function createHesabPayAttempt(opts: {
  bookingId: string;
  locale: Locale;
  payAmountMajor?: string;
  idempotencyKey?: string;
}): Promise<{ checkoutUrl: string; publicReference: string }> {
  if (!(await isHesabPayOperational())) {
    throw new PaymentServiceError("HesabPay online payments are not available", "not_configured");
  }

  const config = await getResolvedHesabPayConfig();
  if (!config) throw new PaymentServiceError("HesabPay is not configured", "not_configured");

  const booking = await loadBookingById(opts.bookingId);
  if (!booking) throw new PaymentServiceError("Booking not found", "not_found");

  if (booking.payment_status === "paid") {
    throw new PaymentServiceError("This booking is already fully paid", "already_paid");
  }

  if (!booking.quoted_amount_minor || !booking.quoted_currency) {
    throw new PaymentServiceError("Payment amount has not been set by our team yet", "amount_not_set");
  }

  if (booking.quoted_currency !== "USD") {
    throw new PaymentServiceError("Unsupported payment currency", "invalid_currency");
  }

  const currency: PaymentCurrency = "USD";
  const quotedMinor = BigInt(booking.quoted_amount_minor);
  const paidMinor = BigInt(booking.amount_paid_minor ?? 0);

  let payMinor: bigint;
  try {
    const raw = opts.payAmountMajor?.trim();
    if (!raw) {
      payMinor = quotedMinor - paidMinor;
    } else {
      payMinor = majorToMinor(raw, currency);
    }
    resolveAuthorizedPayAmount({
      payAmountMinor: payMinor,
      quotedAmountMinor: quotedMinor,
      amountPaidMinor: paidMinor,
      currency,
      quotedCurrency: currency,
    });
  } catch {
    throw new PaymentServiceError("Invalid or excessive payment amount", "invalid_amount");
  }

  const idempotencyKey = opts.idempotencyKey ?? crypto.randomUUID();
  const publicReference = crypto.randomUUID();
  const siteUrl = getSiteUrl();
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("payment_attempts")
    .select("id, status, provider_checkout_url, public_reference, amount_minor")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (
    existing?.provider_checkout_url &&
    ["created", "pending", "processing"].includes(existing.status) &&
    existing.amount_minor === Number(payMinor)
  ) {
    if (!isAllowedCheckoutUrl(existing.provider_checkout_url, config.allowedCheckoutHosts)) {
      throw new PaymentServiceError("Saved checkout URL is not from an approved HesabPay host", "unsafe_redirect");
    }
    return { checkoutUrl: existing.provider_checkout_url, publicReference: existing.public_reference };
  }

  const returnBase = `${siteUrl}${localePath(opts.locale, `/book/payment/${publicReference}`)}`;
  const webhookUrl = `${siteUrl}/api/payments/hesabpay/webhook`;

  const { checkoutUrl, sessionId } = await createPaymentSession(config, {
    items: [
      {
        name: bookingProductName(booking, payMinor, currency),
        quantity: 1,
        price: minorToProviderAmount(payMinor),
      },
    ],
    currency,
    orderReferenceNumber: publicReference,
    successUrl: `${returnBase}?outcome=return`,
    failureUrl: `${returnBase}?outcome=cancelled`,
    webhookUrl,
  });

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase.from("payment_attempts").insert({
    public_reference: publicReference,
    booking_id: booking.id,
    status: "pending",
    currency,
    amount_minor: Number(payMinor),
    provider_session_id: sessionId,
    provider_checkout_url: checkoutUrl,
    idempotency_key: idempotencyKey,
    expires_at: expiresAt,
  });

  if (insertError) {
    throw new PaymentServiceError("Could not start payment", "db_error");
  }

  return { checkoutUrl, publicReference };
}

export async function getPaymentStatus(publicReference: string) {
  const supabase = createServiceClient();
  const { data: attempt } = await supabase
    .from("payment_attempts")
    .select("status, currency, amount_minor, paid_at, booking_id, provider_status")
    .eq("public_reference", publicReference)
    .maybeSingle();

  if (!attempt) return null;

  const { data: booking } = await supabase
    .from("booking_requests")
    .select(
      "payment_status, payment_access_token, full_name, reference_code, reference_title, quoted_amount_minor, amount_paid_minor, reference_price_minor",
    )
    .eq("id", attempt.booking_id)
    .maybeSingle();

  return {
    status: attempt.status,
    providerStatus: attempt.provider_status,
    currency: attempt.currency,
    amountMinor: attempt.amount_minor,
    paidAt: attempt.paid_at,
    bookingPaymentStatus: booking?.payment_status ?? null,
    paymentAccessToken: booking?.payment_access_token ?? null,
    referenceLabel: [booking?.reference_code, booking?.reference_title].filter(Boolean).join(" — ") || null,
    amountPaidMinor: booking?.amount_paid_minor ?? null,
    quotedAmountMinor: booking?.quoted_amount_minor ?? null,
    referencePriceMinor: booking?.reference_price_minor ?? null,
  };
}

export class PaymentServiceError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "PaymentServiceError";
    this.code = code;
  }
}

export { mapProviderStatus, HesabPayApiError };
