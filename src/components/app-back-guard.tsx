"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Phone/browser Back:
 * - From any in-app page, Back steps through history toward Home (normal stack).
 * - On Home, Back does not leave the site (stays on Home).
 */
export function AppBackGuard() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  useEffect(() => {
    if (!isHome) return;

    const lockHome = () => {
      window.history.pushState({ shahFoladiHome: true }, "", window.location.href);
    };

    // Seed an extra Home entry so the first Back stays on Home
    lockHome();

    const onPopState = () => {
      // User pressed Back while already on Home — stay here
      lockHome();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isHome]);

  return null;
}
