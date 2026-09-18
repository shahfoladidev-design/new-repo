"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCatalogPriceLabel } from "@/lib/catalog-price-display";
import {
  hasVipTier,
  packageHasVipChoice,
  parseIncludesList,
  parseCatalogPrice,
  tierIncludes,
  type PackageTier,
} from "@/lib/package-tiers";

export type PackageTierData = {
  price_from?: number | null;
  vip_price?: number | null;
  price_currency?: string | null;
  standard_includes?: unknown;
  vip_includes?: unknown;
  includes?: unknown;
};

type PackageTierCardsProps = {
  pkg: PackageTierData;
  locale: string;
  selectedTier?: PackageTier | null;
  onSelectTier?: (tier: PackageTier) => void;
  /** When true, cards are clickable with visible selected state (booking flow). */
  choiceMode?: boolean;
  /** Booking form: emit native radio inputs named package_tier. */
  bookingMode?: boolean;
  className?: string;
};

function TierCard({
  tier,
  title,
  priceLabel,
  items,
  selected,
  choiceMode,
  bookingMode,
  onSelect,
}: {
  tier: PackageTier;
  title: string;
  priceLabel: string | null;
  items: string[];
  selected: boolean;
  choiceMode: boolean;
  bookingMode: boolean;
  onSelect?: (tier: PackageTier) => void;
}) {
  const cardClass = cn(
    "block w-full rounded-3xl border bg-card p-6 text-start transition md:p-8",
    choiceMode && "cursor-pointer select-none",
    selected && choiceMode
      ? "border-primary bg-primary/10 ring-2 ring-primary/35 shadow-sm"
      : "border-border",
    choiceMode && !selected && "hover:border-primary/45 hover:bg-primary/[0.03]",
  );

  const selectionMark = choiceMode ? (
    <span
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/45 bg-background",
      )}
      aria-hidden
    >
      {selected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
    </span>
  ) : null;

  const body = (
    <>
      <div className="flex items-start gap-3">
        {selectionMark}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {priceLabel ? (
              <p className="text-lg font-semibold text-secondary">{priceLabel}</p>
            ) : null}
          </div>
          {items.length > 0 ? (
            <ul className="mt-4 list-disc space-y-1.5 ps-5 text-sm text-muted-foreground">
              {items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </>
  );

  if (choiceMode && bookingMode) {
    return (
      <label className={cardClass}>
        <input
          type="radio"
          name="package_tier"
          value={tier}
          checked={selected}
          onChange={() => onSelect?.(tier)}
          className="sr-only"
          required
        />
        {body}
      </label>
    );
  }

  if (choiceMode) {
    return (
      <button type="button" onClick={() => onSelect?.(tier)} className={cardClass}>
        {body}
      </button>
    );
  }

  return <article className={cn(cardClass, "cursor-default")}>{body}</article>;
}

export function PackageTierCards({
  pkg,
  locale,
  selectedTier = "standard",
  onSelectTier,
  choiceMode = false,
  bookingMode = false,
  className,
}: PackageTierCardsProps) {
  const t = useTranslations("packageDetail");
  const tc = useTranslations("common");
  const showVip = packageHasVipChoice(pkg);
  const standardItems = tierIncludes("standard", pkg.standard_includes, pkg.vip_includes, pkg.includes);
  const vipItems = tierIncludes("vip", pkg.standard_includes, pkg.vip_includes, pkg.includes);
  const currency = pkg.price_currency ?? "USD";
  const tierChoiceActive = choiceMode && showVip;

  const standardPrice = formatCatalogPriceLabel(
    pkg.price_from,
    currency,
    tc("from"),
    locale,
  );
  const vipPrice = showVip
    ? formatCatalogPriceLabel(pkg.vip_price, currency, tc("from"), locale)
    : null;

  if (!showVip && standardItems.length === 0 && parseCatalogPrice(pkg.price_from) == null) {
    return bookingMode ? <input type="hidden" name="package_tier" value="standard" /> : null;
  }

  return (
    <div className={cn("grid gap-6", showVip ? "md:grid-cols-2" : "max-w-xl", className)}>
      {!tierChoiceActive && bookingMode ? (
        <input type="hidden" name="package_tier" value={selectedTier ?? "standard"} />
      ) : null}
      <TierCard
        tier="standard"
        title={t("standardTier")}
        priceLabel={standardPrice}
        items={standardItems}
        selected={selectedTier === "standard"}
        choiceMode={tierChoiceActive}
        bookingMode={bookingMode}
        onSelect={onSelectTier}
      />
      {showVip ? (
        <TierCard
          tier="vip"
          title={t("vipTier")}
          priceLabel={vipPrice}
          items={vipItems.length > 0 ? vipItems : standardItems}
          selected={selectedTier === "vip"}
          choiceMode={tierChoiceActive}
          bookingMode={bookingMode}
          onSelect={onSelectTier}
        />
      ) : null}
    </div>
  );
}

export { parseIncludesList, hasVipTier, packageHasVipChoice };
export { packageTierLabel } from "@/lib/package-tiers";
