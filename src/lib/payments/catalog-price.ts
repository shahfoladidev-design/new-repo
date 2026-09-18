import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentCurrency } from "@/lib/payments/money";
import { snapshotFromPackagePrice } from "@/lib/payments/pay-amount";
import type { CatalogPriceFields } from "@/lib/catalog-price-display";

export type CatalogPrice = {
  price_minor: number;
  currency: PaymentCurrency;
};

type TourDeparturePriceRow = {
  slug: string;
  price_from?: number | null;
  price_currency?: string | null;
  package_id?: string | null;
};

/** Resolve display prices for upcoming tours (tour price, else linked package). */
export async function resolveUpcomingTourPrices(
  client: SupabaseClient,
  rows: TourDeparturePriceRow[],
): Promise<Map<string, CatalogPriceFields>> {
  const prices = new Map<string, CatalogPriceFields>();
  const packageIds = [
    ...new Set(rows.filter((row) => row.price_from == null && row.package_id).map((row) => row.package_id as string)),
  ];

  let packagesById = new Map<string, CatalogPriceFields>();
  if (packageIds.length) {
    const { data } = await client.from("packages").select("id, price_from, price_currency").in("id", packageIds);
    packagesById = new Map(
      (data ?? []).map((row) => [
        row.id,
        { price_from: row.price_from, price_currency: row.price_currency ?? "USD" },
      ]),
    );
  }

  for (const row of rows) {
    if (row.price_from != null) {
      prices.set(row.slug, { price_from: row.price_from, price_currency: row.price_currency ?? "USD" });
      continue;
    }
    if (row.package_id) {
      const pkg = packagesById.get(row.package_id);
      if (pkg?.price_from != null) {
        prices.set(row.slug, pkg);
      }
    }
  }

  return prices;
}

function toCatalog(priceFrom: number | string | null | undefined): CatalogPrice | null {
  const snap = snapshotFromPackagePrice(priceFrom, "USD");
  if (!snap) return null;
  return { price_minor: snap.reference_price_minor, currency: snap.reference_price_currency };
}

/** Load authoritative catalog price from Packages or Upcoming Tours admin data. */
export async function fetchCatalogPriceForBooking(
  client: SupabaseClient,
  referenceType: string,
  referenceSlug: string | null,
  packageTier: "standard" | "vip" | null = null,
): Promise<CatalogPrice | null> {
  if (!referenceSlug) return null;

  if (referenceType === "package") {
    const { data } = await client
      .from("packages")
      .select("price_from, vip_price, price_currency")
      .eq("slug", referenceSlug)
      .maybeSingle();
    const price =
      packageTier === "vip" && data?.vip_price != null ? data.vip_price : (data?.price_from ?? null);
    return toCatalog(price);
  }

  if (referenceType === "upcoming") {
    const { data } = await client
      .from("tour_departures")
      .select("price_from, price_currency, package_id")
      .eq("slug", referenceSlug)
      .maybeSingle();

    const tourPrice = toCatalog(data?.price_from ?? null);
    if (tourPrice) return tourPrice;

    if (data?.package_id) {
      const { data: pkg } = await client
        .from("packages")
        .select("price_from, price_currency")
        .eq("id", data.package_id)
        .maybeSingle();
      return toCatalog(pkg?.price_from ?? null);
    }
  }

  return null;
}

export function catalogAdminEditPath(referenceType: string, referenceSlug: string | null): string | null {
  if (!referenceSlug) return null;
  if (referenceType === "package") return `/admin/packages?highlight=${encodeURIComponent(referenceSlug)}`;
  if (referenceType === "upcoming") return `/admin/upcoming-tours?highlight=${encodeURIComponent(referenceSlug)}`;
  return null;
}
