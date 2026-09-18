import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Browser return from HesabPay — never marks paid; redirects to localized result page. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const publicReference = url.searchParams.get("ref");
  const locale = url.searchParams.get("locale") || "en";
  const outcome = url.searchParams.get("outcome") || "return";

  if (!publicReference) {
    return NextResponse.json({ ok: false, error: "Missing reference" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const siteUrl = getSiteUrl();
  const target = `${siteUrl}/${locale}/book/payment/${publicReference}?outcome=${encodeURIComponent(outcome)}`;

  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  return GET(request);
}
