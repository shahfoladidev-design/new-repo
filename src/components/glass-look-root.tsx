"use client";

import { useEffect, type ReactNode } from "react";

/** Syncs Admin glass-look toggle onto <html> so CSS can style the full public site. */
export function GlassLookRoot({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("glass-look", enabled);
    root.dataset.glass = enabled ? "on" : "off";
    return () => {
      root.classList.remove("glass-look");
      delete root.dataset.glass;
    };
  }, [enabled]);

  return <>{children}</>;
}
