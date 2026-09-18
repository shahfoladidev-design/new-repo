"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterCatalog, type CatalogItem } from "@/lib/catalog-search";
import type { Locale } from "@/i18n/config";

function titleFor(item: CatalogItem, locale: Locale) {
  if (locale === "dari" && item.title_dari) return item.title_dari;
  if (locale === "ps" && item.title_pashto) return item.title_pashto;
  return item.title_en;
}

export function HeaderSearch({
  catalog,
  className,
  compact = false,
  leading,
  prefix,
  trailing,
}: {
  catalog: CatalogItem[];
  className?: string;
  compact?: boolean;
  /** e.g. hamburger menu — rendered inside the pill on the start side */
  leading?: ReactNode;
  /** Desktop nav — rendered inside the pill before the search field */
  prefix?: ReactNode;
  /** e.g. Book CTA — rendered inside the pill on the end side */
  trailing?: ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => filterCatalog(catalog, { query }, locale).slice(0, 8),
    [catalog, query, locale],
  );

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const goToPackages = () => {
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/packages?q=${encodeURIComponent(q)}` : "/packages");
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToPackages();
        }}
        className={cn(
          "header-toolbar flex items-center gap-1 rounded-full border border-border/80 bg-background/90",
          compact ? "px-1.5 py-1 lg:gap-1.5 lg:px-2 lg:py-1.5" : "px-2 py-1.5",
        )}
      >
        {leading ? <div className="shrink-0">{leading}</div> : null}
        {prefix ? (
          <>
            <div className="header-toolbar__nav hidden min-w-0 shrink-0 lg:block">{prefix}</div>
            <div className="hidden h-5 w-px shrink-0 bg-border/70 lg:block" aria-hidden />
          </>
        ) : null}

        {/* Mobile: flat search row inside toolbar */}
        <div className="flex min-w-0 flex-1 items-center gap-1 lg:hidden">
          <Search className={cn("shrink-0 text-muted-foreground", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("search.placeholder")}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
              compact ? "text-xs" : "text-sm",
            )}
            aria-label={t("search.placeholder")}
          />
          {query ? (
            <button
              type="button"
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted"
              onClick={() => setQuery("")}
              aria-label={t("search.clear")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Desktop: nested rounded search field */}
        <div className="header-search-field hidden min-w-[8rem] flex-1 items-center gap-1.5 lg:flex">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("search.placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={t("search.placeholder")}
          />
          {query ? (
            <button
              type="button"
              className="rounded-full p-0.5 text-muted-foreground hover:bg-background/80"
              onClick={() => setQuery("")}
              aria-label={t("search.clear")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {trailing ? <div className="header-toolbar__actions shrink-0">{trailing}</div> : null}
      </form>

      {open && query.trim() && (
        <div className="nav-panel absolute end-0 top-full z-[60] mt-2 w-[min(92vw,340px)] rounded-2xl border border-border bg-background p-2 shadow-xl">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{t("search.noResults")}</p>
          ) : (
            <ul className="max-h-72 space-y-0.5 overflow-y-auto">
              {results.map((item) => (
                <li key={`${item.kind}-${item.slug}`}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-muted hover:text-primary"
                  >
                    <span className="block font-medium">{titleFor(item, locale)}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {item.kind === "package"
                        ? t("nav.packages")
                        : item.kind === "upcoming"
                          ? t("nav.upcomingTours")
                          : t("nav.destinations")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goToPackages}
            className="mt-2 w-full rounded-full border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
          >
            {t("search.viewAll")}
          </button>
        </div>
      )}
    </div>
  );
}
