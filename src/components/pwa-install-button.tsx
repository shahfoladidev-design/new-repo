"use client";

import { useCallback, useEffect, useId, useSyncExternalStore, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  isIosDevice,
  isSafariBrowser,
  isStandaloneDisplay,
} from "@/lib/pwa-install";

type ClientFlags = {
  standalone: boolean;
  ios: boolean;
  safari: boolean;
};

const SERVER_FLAGS: ClientFlags = { standalone: false, ios: false, safari: true };

let cachedFlags: ClientFlags = SERVER_FLAGS;

function readClientFlags(): ClientFlags {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return SERVER_FLAGS;
  }
  const ua = navigator.userAgent;
  const platform = navigator.platform ?? "";
  const next: ClientFlags = {
    standalone: isStandaloneDisplay(
      window.matchMedia("(display-mode: standalone)").matches,
      (navigator as Navigator & { standalone?: boolean }).standalone,
    ),
    ios: isIosDevice(ua, platform, navigator.maxTouchPoints ?? 0),
    safari: isSafariBrowser(ua),
  };
  if (
    cachedFlags.standalone === next.standalone &&
    cachedFlags.ios === next.ios &&
    cachedFlags.safari === next.safari
  ) {
    return cachedFlags;
  }
  cachedFlags = next;
  return cachedFlags;
}

function subscribeDisplayMode(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const mq = window.matchMedia("(display-mode: standalone)");
  const handler = () => {
    cachedFlags = SERVER_FLAGS;
    onStoreChange();
  };
  mq.addEventListener("change", handler);
  window.addEventListener("appinstalled", handler);
  return () => {
    mq.removeEventListener("change", handler);
    window.removeEventListener("appinstalled", handler);
  };
}

function useClientFlags() {
  return useSyncExternalStore(subscribeDisplayMode, readClientFlags, () => SERVER_FLAGS);
}

type HelpKind = "ios" | "android" | null;

/**
 * Always-visible footer CTA to install the PWA.
 * - Android/Chrome: native beforeinstallprompt when available, else manual steps
 * - iOS: Safari “Add to Home Screen” guide (Apple does not allow programmatic install)
 */
export function PwaInstallButton({ className }: { className?: string }) {
  const t = useTranslations("footer");
  const flags = useClientFlags();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [help, setHelp] = useState<HelpKind>(null);
  const [installing, setInstalling] = useState(false);
  const [installedHint, setInstalledHint] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (flags.standalone) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setInstalledHint(true);
      setHelp(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [flags.standalone]);

  const openHelp = useCallback(() => {
    setHelp(flags.ios ? "ios" : "android");
  }, [flags.ios]);

  const onInstallClick = useCallback(async () => {
    if (flags.ios) {
      openHelp();
      return;
    }

    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (choice.outcome === "accepted") {
          setInstalledHint(true);
          setHelp(null);
        } else {
          openHelp();
        }
      } catch {
        openHelp();
      } finally {
        setInstalling(false);
      }
      return;
    }

    openHelp();
  }, [deferredPrompt, flags.ios, openHelp]);

  if (flags.standalone || installedHint) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>{t("alreadyInstalled")}</p>
    );
  }

  const Icon = flags.ios ? Share : Download;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={onInstallClick}
        disabled={installing}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-60 sm:w-auto"
        aria-expanded={help !== null}
        aria-controls={help ? titleId : undefined}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {installing ? t("installing") : t("install")}
      </button>

      {help ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="absolute bottom-full start-0 z-30 mb-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-border bg-background p-4 text-sm shadow-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <p id={titleId} className="font-semibold text-foreground">
              {help === "ios" ? t("iosInstallTitle") : t("androidInstallTitle")}
            </p>
            <button
              type="button"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label={t("closeInstallHelp")}
              onClick={() => setHelp(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {help === "ios" && !flags.safari ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {t("iosOpenInSafari")}
            </p>
          ) : null}

          {help === "android" && !deferredPrompt ? (
            <p className="mt-2 text-xs text-muted-foreground">{t("androidInstallFallback")}</p>
          ) : null}

          <ol className="mt-3 list-decimal space-y-1.5 ps-4 text-muted-foreground">
            {help === "ios" ? (
              <>
                <li>{t("iosInstallStep1")}</li>
                <li>{t("iosInstallStep2")}</li>
                <li>{t("iosInstallStep3")}</li>
              </>
            ) : (
              <>
                <li>{t("androidInstallStep1")}</li>
                <li>{t("androidInstallStep2")}</li>
                <li>{t("androidInstallStep3")}</li>
              </>
            )}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
