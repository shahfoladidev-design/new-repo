"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useIsClient } from "@/lib/use-is-client";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  offerSelectValue,
  type BookingOfferOption,
} from "@/lib/booking-offers";
import { formatCatalogPriceLabel } from "@/lib/catalog-price-display";

type BookingOfferPickerProps = {
  name?: string;
  offers: BookingOfferOption[];
  defaultValue?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
};

function offerTitle(option: BookingOfferOption, locale: string) {
  if (locale === "dari" && option.title_dari) return option.title_dari;
  if (locale === "ps" && option.title_pashto) return option.title_pashto;
  return option.title_en;
}

function offerDays(option: BookingOfferOption) {
  if (option.duration_days) return `${option.duration_days} days`;
  return null;
}

function offerPrice(option: BookingOfferOption, locale: string, fromLabel: string) {
  return formatCatalogPriceLabel(option.price_from, option.price_currency, fromLabel, locale);
}

function offerDate(option: BookingOfferOption) {
  if (option.kind === "upcoming" && option.start_date) return option.start_date;
  return null;
}

export function BookingOfferPicker({
  name = "reference",
  offers,
  defaultValue = "",
  required,
  onValueChange,
}: BookingOfferPickerProps) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const listId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState(defaultValue);
  const mounted = useIsClient();

  const packages = offers.filter((o) => o.kind === "package");
  const services = offers.filter((o) => o.kind === "service");
  const upcoming = offers.filter((o) => o.kind === "upcoming");

  const selectedOffer = useMemo(
    () => offers.find((o) => offerSelectValue(o) === value) ?? null,
    [offers, value],
  );

  const selectedLabel =
    value === "custom"
      ? t("referenceCustom")
      : selectedOffer
        ? offerTitle(selectedOffer, locale)
        : "";

  const selectedCode = selectedOffer?.reference_code ?? "";

  const filterOffers = (list: BookingOfferOption[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => {
      const title = offerTitle(o, locale).toLowerCase();
      return title.includes(q) || o.reference_code.toLowerCase().includes(q);
    });
  };

  const filteredPackages = filterOffers(packages);
  const filteredUpcoming = filterOffers(upcoming);
  const filteredServices = filterOffers(services);
  const customMatches =
    !query.trim() ||
    t("referenceCustom").toLowerCase().includes(query.trim().toLowerCase());

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function hideKeyboard() {
    searchRef.current?.blur();
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  }

  // Adjust during render instead of in an effect, so a new defaultValue never shows
  // the stale selection for a frame.
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
  if (prevDefaultValue !== defaultValue) {
    setPrevDefaultValue(defaultValue);
    setValue(defaultValue);
  }

  function select(next: string) {
    setValue(next);
    onValueChange?.(next);
    setOpen(false);
    setQuery("");
  }

  const panel = open ? (
    <div className="fixed inset-0 z-[100] flex flex-col bg-muted text-foreground sm:items-center sm:justify-center sm:bg-black/45 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 hidden sm:block"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div
        id={listId}
        role="listbox"
        className={cn(
          "relative z-[101] flex h-full w-full flex-col overflow-hidden bg-muted",
          "sm:h-[min(90dvh,720px)] sm:max-w-lg sm:rounded-3xl sm:border sm:border-border sm:bg-card sm:shadow-2xl",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t("reference")}</p>
            <p className="truncate text-[11px] text-muted-foreground">{t("referenceHint")}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-muted p-2 text-muted-foreground ring-1 ring-black/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-black/10 bg-card px-3 py-2.5">
          <label className="flex items-center gap-2 rounded-2xl border border-black/10 bg-muted px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("referenceSearch")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              enterKeyHint="search"
            />
          </label>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain bg-muted p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bg-card"
          onScroll={hideKeyboard}
          onTouchMove={hideKeyboard}
        >
          {customMatches ? (
            <OptionRow
              selected={value === "custom"}
              title={t("referenceCustom")}
              onSelect={() => select("custom")}
            />
          ) : null}

          <Group label={t("referencePackages")}>
            {filteredPackages.map((opt) => (
              <OptionRow
                key={offerSelectValue(opt)}
                selected={value === offerSelectValue(opt)}
                title={offerTitle(opt, locale)}
                code={opt.reference_code}
                days={offerDays(opt)}
                price={offerPrice(opt, locale, tc("from"))}
                onSelect={() => select(offerSelectValue(opt))}
              />
            ))}
          </Group>

          <Group label={t("referenceUpcoming")}>
            {filteredUpcoming.map((opt) => (
              <OptionRow
                key={offerSelectValue(opt)}
                selected={value === offerSelectValue(opt)}
                title={offerTitle(opt, locale)}
                code={opt.reference_code}
                days={offerDays(opt)}
                price={offerPrice(opt, locale, tc("from"))}
                date={offerDate(opt)}
                onSelect={() => select(offerSelectValue(opt))}
              />
            ))}
          </Group>

          <Group label={t("referenceServices")}>
            {filteredServices.map((opt) => (
              <OptionRow
                key={offerSelectValue(opt)}
                selected={value === offerSelectValue(opt)}
                title={offerTitle(opt, locale)}
                code={opt.reference_code}
                price={offerPrice(opt, locale, tc("from"))}
                onSelect={() => select(offerSelectValue(opt))}
              />
            ))}
          </Group>

          {!customMatches &&
          filteredPackages.length === 0 &&
          filteredUpcoming.length === 0 &&
          filteredServices.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("referenceNoResults")}</p>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  const selectedDays = selectedOffer ? offerDays(selectedOffer) : null;
  const selectedPrice = selectedOffer ? offerPrice(selectedOffer, locale, tc("from")) : null;

  return (
    <div className="relative min-w-0">
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-black/10 bg-card px-3 py-3 text-start shadow-sm transition",
          "hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          open && "border-primary ring-2 ring-primary/20",
        )}
      >
        <span className="min-w-0 flex-1">
          {value ? (
            <>
              <span className="block truncate text-sm font-medium">{selectedLabel}</span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                {selectedCode ? (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                    {selectedCode}
                  </span>
                ) : null}
                {selectedDays ? (
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                    {selectedDays}
                  </span>
                ) : null}
                {selectedPrice ? (
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                    {selectedPrice}
                  </span>
                ) : null}
              </span>
            </>
          ) : (
            <span className="block truncate text-sm text-muted-foreground">{t("referencePlaceholder")}</span>
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-180")}
        />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const childArray = Array.isArray(children) ? children.filter(Boolean) : [children];
  if (childArray.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="px-1 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function OptionRow({
  selected,
  title,
  code,
  days,
  price,
  date,
  onSelect,
}: {
  selected: boolean;
  title: string;
  code?: string;
  days?: string | null;
  price?: string | null;
  date?: string | null;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border border-black/10 bg-card px-3 py-3.5 text-start transition",
        selected && "border-primary bg-primary/5 ring-1 ring-primary/30",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug">{title}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          {code ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold">
              {code}
            </span>
          ) : null}
          {days ? (
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
              {days}
            </span>
          ) : null}
          {price ? (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              {price}
            </span>
          ) : null}
          {date ? (
            <span className="rounded-md border border-black/10 bg-muted px-1.5 py-0.5 text-[11px] font-medium">
              {date}
            </span>
          ) : null}
        </span>
      </span>
      {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
    </button>
  );
}
