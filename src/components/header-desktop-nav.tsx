"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import type { NavTourItem } from "@/lib/nav-types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { NavPackageItem } from "@/components/nav-package-item";

const HOVER_CLOSE_MS = 140;

function itemTitle(item: NavTourItem, locale: Locale) {
  if (locale === "dari" && item.title_dari) return item.title_dari;
  if (locale === "ps" && item.title_pashto) return item.title_pashto;
  return item.title_en;
}

function NavDropdown({
  label,
  active,
  inline,
  panelClassName,
  children,
}: {
  label: string;
  active?: boolean;
  inline?: boolean;
  panelClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="nav-dropdown relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn("nav-trigger", inline && "nav-trigger--inline", active && "nav-trigger-active")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        onFocus={openMenu}
      >
        {label}
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          role="menu"
          className={cn("nav-dropdown__panel absolute start-0 top-full z-50 min-w-[13rem] pt-1.5", panelClassName)}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="nav-panel max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain rounded-2xl border p-2 shadow-xl">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DropdownLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="block rounded-xl px-3 py-2 text-sm transition hover:bg-primary/8 hover:text-primary"
    >
      {children}
    </Link>
  );
}

export function HeaderDesktopNav({
  packages,
  destinations,
  inline = false,
}: {
  packages: NavTourItem[];
  destinations: NavTourItem[];
  inline?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  return (
    <nav
      className={cn(
        "inline-flex items-center gap-0.5",
        inline ? "hidden gap-0.5 lg:flex lg:flex-nowrap" : "hidden flex-wrap justify-center gap-1 lg:flex",
      )}
      aria-label={t("nav.menu")}
    >
      <NavDropdown label={t("nav.home")} inline={inline} active={pathname === "/"}>
        <DropdownLink href="/">{t("nav.home")}</DropdownLink>
        <DropdownLink href="/packages">{t("nav.packages")}</DropdownLink>
        <DropdownLink href="/upcoming-tours">{t("nav.upcomingTours")}</DropdownLink>
      </NavDropdown>

      <NavDropdown
        label={t("nav.tours")}
        inline={inline}
        active={isActive("/packages") || isActive("/upcoming-tours")}
        panelClassName="w-[22rem] max-w-[calc(100vw-2rem)]"
      >
        {packages.slice(0, 8).map((pkg) => (
          <NavPackageItem key={pkg.slug} item={pkg} variant="desktop" />
        ))}
        <DropdownLink href="/packages">{t("nav.viewAllPackages")} →</DropdownLink>
        <DropdownLink href="/upcoming-tours">{t("nav.upcomingTours")} →</DropdownLink>
      </NavDropdown>

      <NavDropdown label={t("nav.destinations")} inline={inline} active={isActive("/destinations")}>
        {destinations.slice(0, 8).map((dest) => (
          <DropdownLink key={dest.slug} href={dest.href}>
            {itemTitle(dest, locale)}
          </DropdownLink>
        ))}
        <DropdownLink href="/destinations">{t("nav.viewAllDestinations")} →</DropdownLink>
      </NavDropdown>

      <NavDropdown label={t("nav.services")} inline={inline} active={isActive("/services")}>
        <DropdownLink href="/services">{t("nav.services")}</DropdownLink>
        <DropdownLink href="/book">{t("nav.book")}</DropdownLink>
      </NavDropdown>

      <NavDropdown
        label={t("nav.about")}
        inline={inline}
        active={
          isActive("/about") ||
          isActive("/team") ||
          isActive("/gallery") ||
          isActive("/blog") ||
          isActive("/faq")
        }
      >
        <DropdownLink href="/about">{t("nav.aboutUs")}</DropdownLink>
        <DropdownLink href="/team">{t("nav.team")}</DropdownLink>
        <DropdownLink href="/gallery">{t("nav.gallery")}</DropdownLink>
        <DropdownLink href="/blog">{t("nav.articles")}</DropdownLink>
        <DropdownLink href="/faq">{t("nav.faq")}</DropdownLink>
      </NavDropdown>

      <NavDropdown label={t("nav.contact")} inline={inline} active={isActive("/contact") || pathname === "/book"}>
        <DropdownLink href="/contact">{t("nav.contact")}</DropdownLink>
        <DropdownLink href="/book">{t("nav.book")}</DropdownLink>
      </NavDropdown>
    </nav>
  );
}
