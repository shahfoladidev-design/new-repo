"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import {
  browserMatchesSiteLocale,
  clearGoogleTranslateTarget,
  detectBrowserGoogleLanguage,
  GOOGLE_TRANSLATE_AUTO_KEY,
  GOOGLE_TRANSLATE_MANUAL_KEY,
  googleTranslateLanguageOptions,
  localeToGooglePageLanguage,
  readGoogleTranslateTarget,
  setGoogleTranslateTarget,
} from "@/lib/google-translate";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string;
              autoDisplay?: boolean;
              layout?: number;
            },
            elementId: string,
          ): void;
          InlineLayout: {
            SIMPLE: number;
          };
        };
      };
    };
  }
}

const SCRIPT_ID = "google-translate-script";
const ENGINE_ID = "sf_google_translate_engine";

function maybeAutoTranslate(pageLanguage: string, siteLocale: Locale): boolean {
  try {
    if (localStorage.getItem(GOOGLE_TRANSLATE_MANUAL_KEY) === "1") return false;
    if (readGoogleTranslateTarget()) return false;
    if (sessionStorage.getItem(GOOGLE_TRANSLATE_AUTO_KEY) === "1") return false;

    const browserLang = detectBrowserGoogleLanguage();
    if (browserMatchesSiteLocale(siteLocale, browserLang)) return false;
    if (browserLang === pageLanguage) return false;
    if (googleTranslateLanguageOptions(pageLanguage).every((lang) => lang.code !== browserLang)) {
      return false;
    }

    sessionStorage.setItem(GOOGLE_TRANSLATE_AUTO_KEY, "1");
    setGoogleTranslateTarget(pageLanguage, browserLang);
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

function loadTranslateEngine(pageLanguage: string) {
  window.googleTranslateElementInit = () => {
    const element = document.getElementById(ENGINE_ID);
    if (!element || !window.google?.translate?.TranslateElement) return;

    element.innerHTML = "";
    new window.google.translate.TranslateElement(
      {
        pageLanguage,
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      ENGINE_ID,
    );
  };

  if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit();
    return;
  }

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function HeaderLanguageMenu({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const pageLanguage = localeToGooglePageLanguage(locale);
  const [open, setOpen] = useState(false);
  const [googleTarget, setGoogleTarget] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readGoogleTranslateTarget(),
  );
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (maybeAutoTranslate(pageLanguage, locale)) return;
    loadTranslateEngine(pageLanguage);
  }, [locale, pageLanguage]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function chooseSiteLanguage(next: Locale) {
    setOpen(false);
    const hadGoogleTranslation = Boolean(googleTarget ?? readGoogleTranslateTarget());

    clearGoogleTranslateTarget();
    setGoogleTarget(null);

    try {
      localStorage.setItem(GOOGLE_TRANSLATE_MANUAL_KEY, "1");
    } catch {
      // ignore
    }

    // Google Translate mutates the DOM; clearing the cookie alone is not enough.
    if (hadGoogleTranslation) {
      const url = new URL(window.location.href);
      url.pathname = `/${next}${pathname === "/" ? "" : pathname}`;
      window.location.assign(url.toString());
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  function chooseGoogleLanguage(code: string) {
    setOpen(false);
    try {
      localStorage.setItem(GOOGLE_TRANSLATE_MANUAL_KEY, "1");
    } catch {
      // ignore
    }
    setGoogleTranslateTarget(pageLanguage, code);
    window.location.reload();
  }

  function resetTranslation() {
    setOpen(false);
    try {
      localStorage.setItem(GOOGLE_TRANSLATE_MANUAL_KEY, "1");
    } catch {
      // ignore
    }
    clearGoogleTranslateTarget();
    window.location.reload();
  }

  const translateOptions = googleTranslateLanguageOptions(pageLanguage);

  return (
    <>
      <div id={ENGINE_ID} className="sf-translate-engine notranslate" aria-hidden="true" />

      <div ref={rootRef} className="relative shrink-0 notranslate">
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary",
            compact ? "h-7 w-7" : "h-8 w-8",
            open && "bg-muted text-primary",
          )}
          aria-label={t("translatePage")}
          aria-expanded={open}
          aria-haspopup="menu"
          title={t("translateHint")}
          onClick={() => setOpen((v) => !v)}
        >
          <Globe className={compact ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]"} aria-hidden />
        </button>

        {open && (
          <div
            role="menu"
            className="nav-panel absolute end-0 top-[calc(100%+0.35rem)] z-[70] max-h-[min(70vh,24rem)] w-[min(92vw,15rem)] overflow-y-auto rounded-2xl border border-border bg-background p-1.5 shadow-xl"
          >
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("siteLanguage")}
            </p>
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                role="menuitem"
                disabled={pending}
                onClick={() => chooseSiteLanguage(code)}
                className={cn(
                  "flex w-full rounded-lg px-2.5 py-2 text-start text-sm transition hover:bg-muted hover:text-primary",
                  locale === code && !googleTarget && "bg-muted font-semibold text-primary",
                )}
              >
                {localeLabels[code]}
              </button>
            ))}

            <div className="my-1.5 border-t border-border/80" role="separator" aria-hidden />

            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("translatePage")}
            </p>
            <p className="px-2.5 pb-1 text-[11px] leading-snug text-muted-foreground">{t("translateHint")}</p>
            {googleTarget && (
              <button
                type="button"
                role="menuitem"
                onClick={resetTranslation}
                className="flex w-full rounded-lg px-2.5 py-2 text-start text-sm transition hover:bg-muted hover:text-primary"
              >
                {t("translateOriginal")}
              </button>
            )}
            {translateOptions.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={() => chooseGoogleLanguage(lang.code)}
                className={cn(
                  "flex w-full rounded-lg px-2.5 py-2 text-start text-sm transition hover:bg-muted hover:text-primary",
                  googleTarget === lang.code && "bg-muted font-semibold text-primary",
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
