import { NextResponse } from "next/server";
import { processHesabPayWebhook } from "@/lib/payments/hesabpay/webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const result = await processHesabPayWebhook(rawBody, request.headers);

  return NextResponse.json(
    { received: result.ok },
    { status: result.status, headers: { "Cache-Control": "no-store" } },
  );
}
