export type BookingOfferKind = "package" | "service" | "upcoming";

export type BookingOfferOption = {
  kind: BookingOfferKind;
  slug: string;
  reference_code: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  duration_days?: number | null;
  price_from?: number | null;
  vip_price?: number | null;
  price_currency?: string | null;
  standard_includes?: string[] | null;
  vip_includes?: string[] | null;
  includes?: string[] | null;
  start_date?: string | null;
};

export const BOOKING_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "traveling",
  "declined",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function offerSelectValue(option: Pick<BookingOfferOption, "kind" | "slug">) {
  return `${option.kind}:${option.slug}`;
}

export function parseOfferSelectValue(
  raw: string,
): { kind: BookingOfferKind; slug: string } | null {
  const [kind, ...rest] = raw.split(":");
  const slug = rest.join(":").trim();
  if ((kind !== "package" && kind !== "service" && kind !== "upcoming") || !slug) return null;
  return { kind, slug };
}

export function formatOfferLabel(option: BookingOfferOption, locale: string) {
  const title =
    (locale === "dari" && option.title_dari) ||
    (locale === "ps" && option.title_pashto) ||
    option.title_en;
  const bits: string[] = [];
  if (option.kind === "package" && option.duration_days) bits.push(`${option.duration_days}d`);
  if (option.kind === "upcoming" && option.start_date) bits.push(option.start_date);
  if (option.kind === "upcoming" && option.duration_days) bits.push(`${option.duration_days}d`);
  const meta = bits.length ? ` · ${bits.join(" · ")}` : "";
  return `${option.reference_code} — ${title}${meta}`;
}

export function buildBookingWhatsAppUrl(opts: {
  whatsapp: string;
  referenceCode?: string | null;
  referenceTitle?: string | null;
  fullName?: string;
  packageTier?: string | null;
  note?: string | null;
}) {
  const wa = opts.whatsapp.replace(/\D/g, "") || "937000000000";
  const ref = [opts.referenceCode, opts.referenceTitle].filter(Boolean).join(" — ") || "Custom / TBD";
  const tierLine =
    opts.packageTier === "vip"
      ? "Tier: VIP"
      : opts.packageTier === "standard"
        ? "Tier: Standard"
        : null;
  const lines = [
    opts.note?.trim() || "Please confirm my booking and payment details before I transfer money.",
    "",
    `Name: ${opts.fullName || ""}`,
    `Reference: ${ref}`,
    ...(tierLine ? [tierLine] : []),
  ];
  return `https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`;
}
