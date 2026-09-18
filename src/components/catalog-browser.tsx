"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ContentCard } from "@/components/content-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AFGHAN_PROVINCES } from "@/lib/provinces";
import {
  filterCatalog,
  uniqueProvinces,
  type CatalogFilters,
  type CatalogItem,
} from "@/lib/catalog-search";
import { formatPackageCardMeta } from "@/lib/catalog-price-display";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { interpolate } from "@/lib/i18n-format";
import { PACKAGE_TYPES, normalizePackageType, type PackageType } from "@/lib/package-types";

/** The "all" pseudo-tab sits alongside the real package types. */
type PackageTypeTab = "all" | PackageType;

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

export function CatalogBrowser({
  items,
  initialQuery = "",
  initialPackageType = "all",
  showDuration = true,
  showPrice = true,
  showProvince = true,
  showPackageTypeTabs = false,
  emptyKey = "search.noResults",
  pageSize = 20,
}: {
  items: CatalogItem[];
  initialQuery?: string;
  initialPackageType?: PackageTypeTab;
  showDuration?: boolean;
  showPrice?: boolean;
  showProvince?: boolean;
  showPackageTypeTabs?: boolean;
  emptyKey?: string;
  pageSize?: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [duration, setDuration] = useState<CatalogFilters["duration"]>("any");
  const [price, setPrice] = useState<CatalogFilters["price"]>("any");
  const [province, setProvince] = useState("all");
  const [packageType, setPackageType] = useState<PackageTypeTab>(initialPackageType);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        query,
        duration,
        price,
        province,
        packageType,
        items: items.map((item) => `${item.kind}:${item.slug}`).join("|"),
      }),
    [items, query, duration, price, province, packageType],
  );

  return (
    <CatalogBrowserResults
      key={filterKey}
      items={items}
      query={query}
      setQuery={setQuery}
      duration={duration}
      setDuration={setDuration}
      price={price}
      setPrice={setPrice}
      province={province}
      setProvince={setProvince}
      packageType={packageType}
      setPackageType={setPackageType}
      showDuration={showDuration}
      showPrice={showPrice}
      showProvince={showProvince}
      showPackageTypeTabs={showPackageTypeTabs}
      emptyKey={emptyKey}
      pageSize={pageSize}
    />
  );
}

function CatalogBrowserResults({
  items,
  query,
  setQuery,
  duration,
  setDuration,
  price,
  setPrice,
  province,
  setProvince,
  packageType,
  setPackageType,
  showDuration,
  showPrice,
  showProvince,
  showPackageTypeTabs,
  emptyKey,
  pageSize,
}: {
  items: CatalogItem[];
  query: string;
  setQuery: (value: string) => void;
  duration: CatalogFilters["duration"];
  setDuration: (value: CatalogFilters["duration"]) => void;
  price: CatalogFilters["price"];
  setPrice: (value: CatalogFilters["price"]) => void;
  province: string;
  setProvince: (value: string) => void;
  packageType: PackageTypeTab;
  setPackageType: (value: PackageTypeTab) => void;
  showDuration: boolean;
  showPrice: boolean;
  showProvince: boolean;
  showPackageTypeTabs: boolean;
  emptyKey: string;
  pageSize: number;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const provinces = useMemo(() => {
    const slugs = uniqueProvinces(items);
    return slugs.map((slug) => ({
      slug,
      name: AFGHAN_PROVINCES.find((p) => p.slug === slug)?.name ?? slug,
    }));
  }, [items]);

  /** Tab counts stay against the whole set, so an empty tab still shows its zero. */
  const typeCounts = useMemo(() => {
    const counts: Record<PackageTypeTab, number> = { all: items.length, private: 0, group: 0 };
    for (const item of items) {
      if (item.kind !== "package") continue;
      counts[normalizePackageType(item.package_type)] += 1;
    }
    return counts;
  }, [items]);

  const typeScoped = useMemo(() => {
    if (!showPackageTypeTabs || packageType === "all") return items;
    return items.filter(
      (item) => item.kind !== "package" || normalizePackageType(item.package_type) === packageType,
    );
  }, [items, packageType, showPackageTypeTabs]);

  const filtered = useMemo(
    () =>
      filterCatalog(
        typeScoped,
        {
          query,
          duration: showDuration ? duration : "any",
          price: showPrice ? price : "any",
          province: showProvince ? province : "all",
        },
        locale,
      ),
    [typeScoped, query, duration, price, province, locale, showDuration, showPrice, showProvince],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div>
      {showPackageTypeTabs && (
        <div
          role="tablist"
          aria-label={t("packageTypes.tabsLabel")}
          className="mb-6 flex flex-wrap gap-2"
        >
          {(["all", ...PACKAGE_TYPES] as PackageTypeTab[]).map((value) => {
            const selected = packageType === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setPackageType(value)}
                className={cn(
                  "pressable rounded-full border px-5 py-2 text-sm font-medium transition",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {t(`packageTypes.${value}`)}
                <span className={cn("ms-2 text-xs", selected ? "opacity-80" : "opacity-60")}>
                  {typeCounts[value]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-8 space-y-4 rounded-3xl border border-border bg-card p-4 md:p-5">
        <label className="block">
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

        <div className="flex flex-wrap gap-3">
          {showDuration && (
            <FilterSelect
              label={t("search.duration")}
              value={duration ?? "any"}
              onChange={(v) => setDuration(v as CatalogFilters["duration"])}
              options={[
                { value: "any", label: t("search.any") },
                { value: "short", label: t("search.durationShort") },
                { value: "medium", label: t("search.durationMedium") },
                { value: "long", label: t("search.durationLong") },
              ]}
            />
          )}
          {showPrice && (
            <FilterSelect
              label={t("search.price")}
              value={price ?? "any"}
              onChange={(v) => setPrice(v as CatalogFilters["price"])}
              options={[
                { value: "any", label: t("search.any") },
                { value: "budget", label: t("search.priceBudget") },
                { value: "mid", label: t("search.priceMid") },
                { value: "premium", label: t("search.pricePremium") },
              ]}
            />
          )}
          {showProvince && provinces.length > 0 && (
            <FilterSelect
              label={t("search.province")}
              value={province}
              onChange={setProvince}
              options={[
                { value: "all", label: t("search.any") },
                ...provinces.map((p) => ({ value: p.slug, label: p.name })),
              ]}
            />
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {interpolate(t.raw("search.resultsCount"), { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
          {t(emptyKey)}
        </p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((item, i) => (
              <ScrollReveal
                key={`${item.kind}-${item.slug}`}
                delay={(i % 6) * 45}
                variant={i % 3 === 0 ? "scale" : i % 3 === 1 ? "slide" : "rise"}
              >
                <ContentCard
                  href={item.href}
                  title={titleFor(item, locale)}
                  summary={summaryFor(item, locale)}
                  imageUrl={item.image_url}
                  meta={formatPackageCardMeta({
                    route_label: item.route_label,
                    price_from: item.price_from,
                    price_currency: item.price_currency,
                    duration_days: item.duration_days,
                    fromLabel: t("common.from"),
                    daysLabel: t("common.days"),
                    locale,
                  }) || undefined}
                  cta={t("common.learnMore")}
                />
              </ScrollReveal>
            ))}
          </div>
          {hasMore ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + pageSize)}
                className={cn(
                  "pressable rounded-full border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/10",
                )}
              >
                {interpolate(t.raw("common.showMore"), { count: filtered.length - visibleCount })}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="min-w-[140px] flex-1">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
