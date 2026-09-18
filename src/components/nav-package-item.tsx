"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Minus, Plus } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { NavTourItem } from "@/lib/nav-types";
import { formatCatalogPriceLabel } from "@/lib/catalog-price-display";
import { cn } from "@/lib/utils";

function localizedTitle(item: NavTourItem, locale: Locale) {
  if (locale === "dari" && item.title_dari) return item.title_dari;
  if (locale === "ps" && item.title_pashto) return item.title_pashto;
  return item.title_en;
}

function localizedSummary(item: NavTourItem, locale: Locale) {
  if (locale === "dari" && item.summary_dari) return item.summary_dari;
  if (locale === "ps" && item.summary_pashto) return item.summary_pashto;
  return item.summary_en ?? "";
}

/**
 * One package row inside the header nav. The title still navigates to the package
 * page; the trailing + button expands its details in place so visitors can compare
 * packages without leaving the menu. Used by both the desktop dropdown and the
 * mobile slide-down panel.
 */
export function NavPackageItem({
  item,
  variant,
  onNavigate,
}: {
  item: NavTourItem;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const title = localizedTitle(item, locale);
  const summary = localizedSummary(item, locale);
  const price = formatCatalogPriceLabel(item.price_from, item.price_currency, t("common.from"), locale);
  const duration = item.duration_days != null ? `${item.duration_days} ${t("common.days")}` : null;
  const meta = [price, duration].filter(Boolean).join(" · ");

  const isMobile = variant === "mobile";

  return (
    <div className={cn("nav-package", open && "nav-package--open")}>
      <div className="flex items-center gap-1">
        <Link
          href={item.href}
          role={isMobile ? undefined : "menuitem"}
          onClick={onNavigate}
          className={cn(
            "min-w-0 flex-1 truncate transition hover:text-primary",
            isMobile ? "py-2 text-sm" : "rounded-xl px-3 py-2 text-sm hover:bg-primary/8",
          )}
        >
          {title}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t("nav.hidePackageDetails") : t("nav.showPackageDetails")}
          title={open ? t("nav.hidePackageDetails") : t("nav.showPackageDetails")}
          className="nav-package__toggle"
        >
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className={cn(
            "nav-package__details",
            isMobile ? "mb-1 ms-1 ps-3" : "mx-1 mb-1 rounded-xl px-3 py-2",
          )}
        >
          {item.route_label ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{item.route_label}</p>
          ) : null}
          {meta ? <p className="mt-0.5 text-[11px] font-medium text-foreground/80">{meta}</p> : null}
          {summary ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{summary}</p>
          ) : null}
          <Link
            href={item.href}
            onClick={onNavigate}
            className="mt-1.5 inline-flex text-xs font-medium text-primary hover:underline"
          >
            {t("nav.viewPackage")} →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
