"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/scroll-reveal";
import { filterCatalog, type CatalogItem } from "@/lib/catalog-search";
import { formatCatalogPriceLabel } from "@/lib/catalog-price-display";
import type { Locale } from "@/i18n/config";
import { interpolate } from "@/lib/i18n-format";

function titleFor(item: CatalogItem, locale: Locale) {
  if (locale === "dari" && item.title_dari) return item.title_dari;
  if (locale === "ps" && item.title_pashto) return item.title_pashto;
  return item.title_en;
}

function summaryFor(item: CatalogItem, locale: Locale) {
  if (locale === "dari" && item.summary_dari) return item.summary_dari;
  if (locale === "ps" && item.summary_pashto) return item.summary_pashto;
  return item.summary_en ?? "";
}

export function UpcomingToursBrowser({
  items,
  initialQuery = "",
}: {
  items: CatalogItem[];
  initialQuery?: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(
    () => filterCatalog(items, { query, kind: "upcoming" }, locale),
    [items, query, locale],
  );

  return (
    <div className="mt-10">
      <label className="mb-6 block max-w-xl">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("search.label")}
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </label>

      <p className="mb-6 text-sm text-muted-foreground">{interpolate(t.raw("search.resultsCount"), { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
          {t("search.noResults")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((tour, i) => (
            <ScrollReveal key={tour.slug} delay={i * 40}>
              <article className="rounded-3xl border border-border bg-card p-6">
                {tour.route_label ? (
                  <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary">
                    {tour.route_label}
                  </span>
                ) : null}
                <h2 className="mt-3 text-xl font-semibold">{titleFor(tour, locale)}</h2>
                {tour.duration_days != null || tour.price_from != null ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[
                      tour.duration_days != null ? `${tour.duration_days} ${t("common.days")}` : null,
                      formatCatalogPriceLabel(tour.price_from, tour.price_currency, t("common.from"), locale),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summaryFor(tour, locale)}</p>
                <Link
                  href={`/book?ref=${encodeURIComponent(`upcoming:${tour.slug}`)}`}
                  className="mt-5 inline-flex rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
                >
                  {t("common.bookNow")}
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
