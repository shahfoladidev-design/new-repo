"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { PREFETCH_ROUTES } from "@/lib/cache-config";

/** Prefetch a small set of high-intent routes during idle time only. */
export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const routes = [...PREFETCH_ROUTES];
    let cancelled = false;
    let index = 0;

    const prefetchNext = () => {
      if (cancelled || index >= routes.length) return;
      try {
        router.prefetch(routes[index]);
      } catch {
        // Ignore prefetch failures on unsupported paths
      }
      index += 1;
      if (index < routes.length) {
        window.setTimeout(prefetchNext, 400);
      }
    };

    const start = () => {
      if (cancelled) return;
      prefetchNext();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 5000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(start, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  return null;
}
