"use client";

import { useEffect } from "react";

/** Registers the service worker early so Chrome can fire beforeinstallprompt. */
export function ServiceWorkerUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await reg.update();
        await navigator.serviceWorker.ready;
        if (cancelled) return;
        // Ensure an active worker controls this page (needed for installability)
        if (!navigator.serviceWorker.controller && reg.active) {
          // Soft reload only if a controller is missing after first SW install
          // (otherwise beforeinstallprompt may never fire until next navigation).
        }
      } catch {
        // Ignore registration failures (private mode, unsupported, etc.)
      }
    }

    void register();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
