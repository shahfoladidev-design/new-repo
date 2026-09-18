"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Refresh admin auth in the background so idle tabs stay signed in (~1 hour JWT). */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function AdminSessionKeepAlive() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function refreshSession() {
      if (cancelled) return;
      const { error } = await supabase.auth.refreshSession();
      if (!error) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login?error=session_expired");
      }
    }

    const interval = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }

    document.addEventListener("visibilitychange", onVisible);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/admin/login?error=session_expired");
      }
    });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
