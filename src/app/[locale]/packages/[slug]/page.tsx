import type { Metadata } from "next";
import { CmsMediaImage } from "@/components/cms-media-image";
import { HERO_IMAGE_SIZES, HERO_SECTION_CLASS } from "@/lib/hero-media";
import { isUsableImageUrl } from "@/lib/cms-media";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingForm } from "@/components/booking-form";
import { PackageTierCards } from "@/components/package-tier-cards";
import { packageHasVipChoice, parseCatalogPrice } from "@/lib/package-tiers";
import { localizedField } from "@/lib/content";
import { catalogCurrency, formatPackageCardMeta } from "@/lib/catalog-price-display";
import { getCachedPackageDetail } from "@/lib/cms-pages";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBookingOffers } from "@/lib/booking-offers-server";
import { offerSelectValue } from "@/lib/booking-offers";
import { getSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/i18n/config";
import { absoluteUrl, buildMetadata, getSiteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { PackageBookBar } from "@/components/package-book-bar";
import { PackageDayList } from "@/components/package-day-list";
import { PackageProvinceGallery } from "@/components/package-province-gallery";
import { toUrlSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const detail = await getCachedPackageDetail(slug);
  const item = detail?.item;

  if (!item) {
    return buildMetadata({
      locale,
      path: `/packages/${toUrlSlug(slug)}`,
      title: "Tour package",
      description: "Afghanistan tour package with Shah Foladi Travel.",
    });
  }

  // Canonical URL always uses the row's clean slug, never the (possibly encoded) param.
  const canonicalSlug = toUrlSlug(item.slug);

  const title = localizedField(item as never, locale, "title");
  const description =
    localizedField(item as never, locale, "summary") ||
    localizedField(item as never, locale, "description") ||
    title;

  return buildMetadata({
    locale,
    path: `/packages/${canonicalSlug}`,
    title,
    description: String(description).slice(0, 160),
    image: typeof item.image_url === "string" ? item.image_url : null,
  });
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // Independent reads — run them together so a cold cache costs one round trip, not three.
  const [offers, settings, detail] = await Promise.all([
    getBookingOffers(),
    getSiteSettings(),
    getCachedPackageDetail(slug),
  ]);
  if (!detail) notFound();

  const { item, days, provinces } = detail;

  // Match offers on the resolved row slug — the URL param may be encoded or normalized.
  const packageSlug = String(item.slug ?? slug);
  const canonicalSlug = toUrlSlug(packageSlug);

  // Legacy links (encoded spaces/commas from unsafe CMS slugs) resolve, but send
  // crawlers and users on to the clean URL so there is only one indexable page.
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${locale}/packages/${canonicalSlug}`);
  }
  const selectedValue = offers.find((o) => o.kind === "package" && o.slug === packageSlug)
    ? offerSelectValue({ kind: "package", slug: packageSlug })
    : "";

  const includes = asStringArray(item.standard_includes ?? item.includes);
  const excludes = asStringArray(item.excludes);
  const vipPrice = parseCatalogPrice(item.vip_price);
  const showTiers =
    includes.length > 0 ||
    packageHasVipChoice({ vip_price: item.vip_price, vip_includes: item.vip_includes }) ||
    parseCatalogPrice(item.price_from) != null;
  const travelStyle = (item.travel_style && typeof item.travel_style === "object"
    ? (item.travel_style as Record<string, string>)
    : {}) as Record<string, string>;
  const audience = String(
    (locale === "dari" && item.audience_dari) ||
      (locale === "ps" && item.audience_pashto) ||
      item.audience_en ||
      "",
  );
  const notes = String(
    (locale === "dari" && item.important_notes_dari) ||
      (locale === "ps" && item.important_notes_pashto) ||
      item.important_notes_en ||
      "",
  );

  const title = localizedField(item as never, locale, "title");
  const summary =
    localizedField(item as never, locale, "description") ||
    localizedField(item as never, locale, "summary");
  const cardMeta = formatPackageCardMeta({
    price_from: parseCatalogPrice(item.price_from),
    price_currency: typeof item.price_currency === "string" ? item.price_currency : null,
    duration_days: typeof item.duration_days === "number" ? item.duration_days : null,
    fromLabel: t("common.from"),
    daysLabel: t("common.days"),
    locale,
  });

  return (
    <div className="pb-24 lg:pb-0">
      {isUsableImageUrl(typeof item.image_url === "string" ? item.image_url : null) && (
        <div className={cn(HERO_SECTION_CLASS, "relative")}>
          <CmsMediaImage
            src={String(item.image_url)}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes={HERO_IMAGE_SIZES}
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-10 pt-20 md:px-6 md:pb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">{t("packageDetail.tourItinerary")}</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {typeof item.route_label === "string" && item.route_label ? (
              <p className="mt-2 text-sm font-medium text-white/90">{item.route_label}</p>
            ) : null}
            {cardMeta ? <p className="mt-3 text-sm text-white/85">{cardMeta}</p> : null}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: title,
          description: summary,
          url: absoluteUrl(locale, `/packages/${canonicalSlug}`),
          image:
            typeof item.image_url === "string" && item.image_url
              ? item.image_url.startsWith("http")
                ? item.image_url
                : `${getSiteUrl()}${item.image_url}`
              : undefined,
          provider: {
            "@type": "TravelAgency",
            name: "Shah Foladi Travel",
            url: getSiteUrl(),
          },
          offers:
            item.price_from != null
              ? {
                  "@type": "Offer",
                  price: item.price_from,
                  priceCurrency: catalogCurrency(
                    typeof item.price_currency === "string" ? item.price_currency : null,
                  ),
                  url: absoluteUrl(locale, `/packages/${canonicalSlug}`),
                }
              : undefined,
        }}
      />
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("pages.packages"), href: "/packages" },
          { label: title },
        ]}
      />

      {!isUsableImageUrl(typeof item.image_url === "string" ? item.image_url : null) ? (
        <>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{t("packageDetail.tourItinerary")}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
          {typeof item.route_label === "string" && item.route_label ? (
            <p className="mt-2 text-secondary font-medium">{item.route_label}</p>
          ) : null}
          {cardMeta ? <p className="mt-3 text-muted-foreground">{cardMeta}</p> : null}
        </>
      ) : null}

      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{summary}</p>

      <div className="mt-10 rounded-3xl border border-border bg-muted/20 p-6">
        <h2 className="text-xl font-semibold">{t("packageDetail.upcomingGroups")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("packageDetail.upcomingGroupsDesc")}</p>
        <Link href="/upcoming-tours" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
          {t("nav.upcomingTours")}
        </Link>
      </div>

      {notes && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("packageDetail.importantNotes")}</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">{notes}</p>
        </section>
      )}

      {audience && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("packageDetail.whoFor")}</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">{audience}</p>
        </section>
      )}

      {Object.keys(travelStyle).length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("packageDetail.travelStyle")}</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {Object.entries(travelStyle).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium capitalize text-foreground">{key}: </span>
                {value}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(includes.length > 0 || excludes.length > 0) && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {showTiers ? (
            <section className="md:col-span-2">
              <h2 className="text-xl font-semibold">{t("packageDetail.chooseTier")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("packageDetail.chooseTierDesc")}</p>
              <PackageTierCards
                className="mt-6"
                pkg={{
                  price_from: parseCatalogPrice(item.price_from),
                  vip_price: vipPrice,
                  price_currency: typeof item.price_currency === "string" ? item.price_currency : null,
                  standard_includes: item.standard_includes ?? item.includes,
                  vip_includes: item.vip_includes,
                  includes: item.includes,
                }}
                locale={locale}
              />
            </section>
          ) : null}
          {excludes.length > 0 && (
            <section className={showTiers ? "md:col-span-2" : ""}>
              <h2 className="text-xl font-semibold">{t("packageDetail.notIncluded")}</h2>
              <ul className="mt-3 list-disc space-y-1 ps-5 text-muted-foreground">
                {excludes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <PackageProvinceGallery
        provinces={provinces}
        locale={locale}
        heading={t("packageDetail.provincesTitle")}
        daysLabel={t("common.days")}
      />

      {days.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">{t("packageDetail.itinerary")}</h2>
          <PackageDayList
            dayLabel={t("packageDetail.day")}
            overnightLabel={t("packageDetail.overnight")}
            days={days.map((day) => ({
              dayNumber: day.day_number,
              title: localizedField(day, locale, "title"),
              body: localizedField(day, locale, "body"),
              overnight: day.overnight_location ?? null,
            }))}
          />
        </section>
      )}

      <div id="book" className="mt-12 scroll-mt-28">
        <h2 className="mb-6 text-2xl font-semibold">{t("common.bookNow")}</h2>
        {typeof item.reference_code === "string" && item.reference_code ? (
          <p className="mb-4 text-sm text-muted-foreground">
            {t("booking.reference")}: <span className="font-mono font-semibold text-primary">{item.reference_code}</span>
          </p>
        ) : null}
        <BookingForm
          offers={offers}
          selectedValue={selectedValue}
          whatsapp={settings.whatsapp ?? "+93700000000"}
          whatsappNote={settings.payment_whatsapp_note_en}
          hesabPayEnabled={settings.hesabpay_enabled}
          offlinePaymentEnabled={settings.offline_payment_enabled}
        />
      </div>
      <PackageBookBar title={title} meta={cardMeta || null} bookLabel={t("common.bookNow")} />
    </div>
    </div>
  );
}
