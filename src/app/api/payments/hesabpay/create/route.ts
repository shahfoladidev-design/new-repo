import { NextResponse } from "next/server";
import { createHesabPayAttempt, PaymentServiceError } from "@/lib/payments/payment-service";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { clientIpFromHeaders, isRateLimited } from "@/lib/request-rate-limit";

export const dynamic = "force-dynamic";

type CreateBody = {
  paymentAccessToken?: string;
  locale?: string;
  idempotencyKey?: string;
  payAmount?: string;
};

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  if (isRateLimited(`pay-create:ip:${ip}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429, headers: noStore() });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400, headers: noStore() });
  }

  const token = body.paymentAccessToken?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Payment access token required" }, { status: 400, headers: noStore() });
  }

  if (isRateLimited(`pay-create:token:${token}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429, headers: noStore() });
  }

  const locale = locales.includes(body.locale as Locale) ? (body.locale as Locale) : "en";

  const { loadBookingByAccessToken } = await import("@/lib/payments/payment-service");
  const booking = await loadBookingByAccessToken(token);
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404, headers: noStore() });
  }

  try {
    const { checkoutUrl, publicReference } = await createHesabPayAttempt({
      bookingId: booking.id,
      locale,
      idempotencyKey: body.idempotencyKey,
      payAmountMajor: body.payAmount,
    });

    return NextResponse.json(
      { ok: true, checkoutUrl, publicReference },
      { status: 200, headers: noStore() },
    );
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      const status =
        err.code === "not_found" ? 404 :
        err.code === "already_paid" ? 409 :
        err.code === "amount_not_set" ? 422 :
        err.code === "invalid_amount" ? 422 :
        err.code === "not_configured" ? 503 : 400;
      return NextResponse.json({ ok: false, error: err.message, code: err.code }, { status, headers: noStore() });
    }
    return NextResponse.json({ ok: false, error: "Payment could not be started" }, { status: 500, headers: noStore() });
  }
}

function noStore() {
  return { "Cache-Control": "no-store" };
}
