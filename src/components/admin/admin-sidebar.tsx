"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Mail,
  FileText,
  Package,
  MapPin,
  Users,
  Route,
  BookOpen,
  Images,
  Settings,
  Menu,
  X,
  PanelsTopLeft,
  Star,
  UserCog,
  UsersRound,
  HardDrive,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", key: "overview", icon: LayoutDashboard },
  { href: "/admin/bookings", key: "bookings", icon: CalendarCheck },
  { href: "/admin/contacts", key: "contacts", icon: Mail },
  { href: "/admin/reviews", key: "reviews", icon: Star },
  { href: "/admin/hero", key: "hero", icon: PanelsTopLeft },
  { href: "/admin/packages", key: "privatePackages", icon: Package },
  { href: "/admin/group-packages", key: "groupPackages", icon: UsersRound },
  { href: "/admin/upcoming-tours", key: "upcomingTours", icon: CalendarCheck },
  { href: "/admin/destinations", key: "destinations", icon: MapPin },
  { href: "/admin/services", key: "services", icon: Route },
  { href: "/admin/about", key: "about", icon: BookOpen },
  { href: "/admin/team", key: "team", icon: Users },
  { href: "/admin/faqs", key: "faqs", icon: FileText },
  { href: "/admin/blog", key: "blog", icon: BookOpen },
  { href: "/admin/gallery", key: "gallery", icon: Images },
  { href: "/admin/storage", key: "storage", icon: HardDrive },
  { href: "/admin/agreements", key: "agreements", icon: FileText },
  { href: "/admin/account", key: "account", icon: UserCog },
  { href: "/admin/settings", key: "settings", icon: Settings },
] as const;

export function AdminSidebar({
  unseenBookings = 0,
  unseenContacts = 0,
}: {
  unseenBookings?: number;
  unseenContacts?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin");
  const tBrand = useTranslations();

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
      {links.map(({ href, key, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t(`nav.${key}`)}</span>
            {href === "/admin/bookings" && unseenBookings > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unseenBookings}</span>
            )}
            {href === "/admin/contacts" && unseenContacts > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unseenContacts}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed start-4 top-4 z-50 rounded-lg border border-border bg-background p-2 lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("header.toggleMenu")}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-64 shrink-0 flex-col border-e border-border bg-card shadow-sm transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="shrink-0 border-b border-border px-4 py-5">
          <p className="font-semibold">{tBrand("brand")}</p>
          <p className="text-xs text-muted-foreground">{t("dashboard")}</p>
        </div>
        {nav}
      </aside>
    </>
  );
}
