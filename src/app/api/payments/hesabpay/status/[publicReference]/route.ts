import { NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/payments/payment-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicReference: string }> },
) {
  const { publicReference } = await context.params;
  const status = await getPaymentStatus(publicReference);

  if (!status) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404, headers: noStore() });
  }

  return NextResponse.json(
    {
      ok: true,
      status: status.status,
      bookingPaymentStatus: status.bookingPaymentStatus,
      currency: status.currency,
      amountMinor: status.amountMinor,
      paidAt: status.paidAt,
      referenceLabel: status.referenceLabel,
    },
    { status: 200, headers: noStore() },
  );
}

function noStore() {
  return { "Cache-Control": "no-store" };
}
