import type { Locale } from "@/i18n/config";
import type { PaymentCurrency } from "@/lib/payments/money";

export type CatalogPriceFields = {
  price_from?: number | null;
  price_currency?: string | null;
};

export function catalogCurrency(_value?: string | null): PaymentCurrency {
  return "USD";
}

function intlLocale(locale?: string): string {
  if (locale === "ps") return "ps-AF";
  if (locale === "dari") return "fa-AF";
  return "en";
}

/** e.g. "$890" */
export function formatCatalogPriceAmount(
  priceFrom: number,
  _currency?: PaymentCurrency,
  locale?: string,
): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(priceFrom);
}

/** e.g. "From $890" — returns null when admin has not set a price. */
export function formatCatalogPriceLabel(
  priceFrom: unknown,
  currency: string | null | undefined,
  fromLabel: string,
  locale?: string,
): string | null {
  const price =
    typeof priceFrom === "number" && Number.isFinite(priceFrom) && priceFrom > 0
      ? priceFrom
      : typeof priceFrom === "string" && priceFrom.trim() !== ""
        ? (() => {
            const n = Number(priceFrom.trim());
            return Number.isFinite(n) && n > 0 ? n : null;
          })()
        : null;
  if (price == null) return null;
  return `${fromLabel} ${formatCatalogPriceAmount(price, catalogCurrency(currency), locale)}`;
}

export function formatPackageCardMeta(opts: {
  price_from?: number | null;
  price_currency?: string | null;
  duration_days?: number | null;
  route_label?: string | null;
  fromLabel: string;
  daysLabel: string;
  locale?: Locale | string;
}): string {
  if (opts.route_label) return opts.route_label;

  const parts: string[] = [];
  const price = formatCatalogPriceLabel(opts.price_from, opts.price_currency, opts.fromLabel, opts.locale);
  if (price) parts.push(price);
  if (opts.duration_days != null) parts.push(`${opts.duration_days} ${opts.daysLabel}`);
  return parts.join(" · ");
}

/** Overlay admin catalog prices onto placeholder package cards (content stays from placeholders). */
export function mergePlaceholdersWithCatalogPrices<T extends { slug: string }>(
  placeholders: T[],
  catalogRows: Array<{ slug: string } & CatalogPriceFields>,
): Array<T & CatalogPriceFields> {
  const bySlug = new Map(catalogRows.map((row) => [row.slug, row]));

  return placeholders.map((placeholder) => {
    const row = bySlug.get(placeholder.slug);
    if (!row) {
      return { ...placeholder, price_from: null, price_currency: null };
    }

    return {
      ...placeholder,
      price_from: row.price_from ?? null,
      price_currency: row.price_currency ?? null,
    };
  });
}