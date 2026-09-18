"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import type { NavTourItem } from "@/lib/nav-types";
import { HeaderSearch } from "./header-search";
import type { CatalogItem } from "@/lib/catalog-search";
import { HeaderLanguageMenu } from "@/components/header-language-menu";
import { HeaderDesktopNav } from "@/components/header-desktop-nav";
import { NavPackageItem } from "@/components/nav-package-item";

function itemTitle(item: NavTourItem, locale: Locale) {
  if (locale === "dari" && item.title_dari) return item.title_dari;
  if (locale === "ps" && item.title_pashto) return item.title_pashto;
  return item.title_en;
}

function isCommercePath(pathname: string) {
  return (
    pathname === "/book" ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/packages/") ||
    pathname.includes("/pay/")
  );
}

export function SiteHeader({
  brandMark,
  packages = [],
  destinations = [],
  catalog = [],
}: {
  brandMark: ReactNode;
  packages?: NavTourItem[];
  destinations?: NavTourItem[];
  catalog?: CatalogItem[];
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(true);
  const [destinationsOpen, setDestinationsOpen] = useState(true);
  const [aboutMobileOpen, setAboutMobileOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);

  const closeMenu = () => {
    setOpen(false);
    setToursOpen(true);
    setDestinationsOpen(true);
    setAboutMobileOpen(true);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    closeMenu();
    setHeaderHidden(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      if (open) {
        setHeaderHidden(false);
        lastScrollY.current = window.scrollY;
        return;
      }

      if (isCommercePath(pathname)) {
        setHeaderHidden(false);
        lastScrollY.current = window.scrollY;
        return;
      }

      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (y < 48) {
        setHeaderHidden(false);
      } else if (delta > 6) {
        setHeaderHidden(true);
      } else if (delta < -6) {
        setHeaderHidden(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, pathname]);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-50 border-b transition-transform duration-300 ease-out",
        headerHidden && !open ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-0 px-3 py-0.5 sm:px-4">
        <div className="flex justify-center leading-none">{brandMark}</div>
        <HeaderSearch
          catalog={catalog}
          className="-mt-2 w-full"
          compact
          leading={
            <button
              ref={toggleRef}
              type="button"
              className="rounded-full p-1 transition hover:bg-muted lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          }
          prefix={<HeaderDesktopNav inline packages={packages} destinations={destinations} />}
          trailing={
            <div className="flex shrink-0 items-center gap-1 lg:gap-1.5">
              <HeaderLanguageMenu compact />
              <Link
                href="/book"
                className="btn-primary rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap lg:px-4 lg:py-1.5 lg:text-xs"
              >
                {t("nav.book")}
              </Link>
            </div>
          }
        />
      </div>

      {open && (
        <div
          ref={menuRef}
          className="nav-panel relative z-50 max-h-[min(70dvh,calc(100dvh-9rem))] overflow-y-auto overscroll-contain border-t border-border bg-background px-4 py-4 shadow-lg [-webkit-overflow-scrolling:touch]"
        >
          <nav className="flex flex-col gap-0.5">
            <Link href="/" onClick={closeMenu} className="py-3 text-base font-medium">
              {t("nav.home")}
            </Link>

            <button
              type="button"
              className="flex items-center justify-between py-3 text-left text-base font-medium"
              onClick={() => setToursOpen((v) => !v)}
              aria-expanded={toursOpen}
            >
              {t("nav.tours")}
              <ChevronDown className={cn("h-4 w-4 transition", toursOpen && "rotate-180")} />
            </button>
            {toursOpen && (
              <div className="mb-2 ms-1 flex flex-col gap-0.5 border-s border-border ps-3">
                <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("nav.packages")}
                </p>
                {packages.map((pkg) => (
                  <NavPackageItem key={pkg.slug} item={pkg} variant="mobile" onNavigate={closeMenu} />
                ))}
                <Link href="/packages" onClick={closeMenu} className="py-2 text-sm font-medium text-primary">
                  {t("nav.viewAllPackages")} →
                </Link>
                <Link href="/upcoming-tours" onClick={closeMenu} className="py-2 text-sm font-medium text-primary">
                  {t("nav.upcomingTours")} →
                </Link>
              </div>
            )}

            <button
              type="button"
              className="flex items-center justify-between py-3 text-left text-base font-medium"
              onClick={() => setDestinationsOpen((v) => !v)}
              aria-expanded={destinationsOpen}
            >
              {t("nav.destinations")}
              <ChevronDown className={cn("h-4 w-4 transition", destinationsOpen && "rotate-180")} />
            </button>
            {destinationsOpen && (
              <div className="mb-2 ms-1 flex flex-col gap-0.5 border-s border-border ps-3">
                {destinations.map((dest) => (
                  <Link
                    key={dest.slug}
                    href={dest.href}
                    onClick={closeMenu}
                    className="py-2 text-sm hover:text-primary"
                  >
                    {itemTitle(dest, locale)}
                  </Link>
                ))}
                <Link href="/destinations" onClick={closeMenu} className="py-2 text-sm font-medium text-primary">
                  {t("nav.viewAllDestinations")} →
                </Link>
              </div>
            )}

            <Link href="/services" onClick={closeMenu} className="py-3 text-base font-medium">
              {t("nav.services")}
            </Link>

            <button
              type="button"
              className="flex items-center justify-between py-3 text-left text-base font-medium"
              onClick={() => setAboutMobileOpen((v) => !v)}
              aria-expanded={aboutMobileOpen}
            >
              {t("nav.about")}
              <ChevronDown className={cn("h-4 w-4 transition", aboutMobileOpen && "rotate-180")} />
            </button>
            {aboutMobileOpen && (
              <div className="mb-2 ms-1 flex flex-col gap-0.5 border-s border-border ps-3">
                <Link href="/about" onClick={closeMenu} className="py-2 text-sm">
                  {t("nav.aboutUs")}
                </Link>
                <Link href="/team" onClick={closeMenu} className="py-2 text-sm">
                  {t("nav.team")}
                </Link>
                <Link href="/gallery" onClick={closeMenu} className="py-2 text-sm">
                  {t("nav.gallery")}
                </Link>
              </div>
            )}

            <Link href="/blog" onClick={closeMenu} className="py-3 text-base font-medium">
              {t("nav.articles")}
            </Link>
            <Link href="/faq" onClick={closeMenu} className="py-3 text-base font-medium">
              {t("nav.faq")}
            </Link>
            <Link href="/contact" onClick={closeMenu} className="py-3 text-base font-medium">
              {t("nav.contact")}
            </Link>
            <Link href="/book" onClick={closeMenu} className="py-3 text-base font-medium text-primary">
              {t("nav.book")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
