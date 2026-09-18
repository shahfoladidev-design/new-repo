import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { isUsableImageUrl } from "@/lib/cms-media";

/** Canonical production domain — single source of truth for all SEO URLs */
const FALLBACK_SITE = "https://www.shahfoladi.com";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE).replace(/\/$/, "");
}

/** True for Vercel preview / development deployments (should not be indexed) */
export function isNonProductionDeployment() {
  const env = process.env.VERCEL_ENV;
  return env === "preview" || env === "development";
}

/** BCP-47 language tags for <html lang> / content language */
export function htmlLang(locale: Locale): string {
  if (locale === "dari") return "fa-AF";
  if (locale === "ps") return "ps-AF";
  return "en";
}

/** Open Graph locale codes */
export function ogLocale(locale: Locale): string {
  if (locale === "dari") return "fa_AF";
  if (locale === "ps") return "ps_AF";
  return "en_US";
}

/** Path without locale prefix, e.g. `/packages/bamyan` or `` for home */
export function normalizePath(path = ""): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${normalizePath(path)}`;
}

export function absoluteUrl(locale: Locale, path = ""): string {
  return `${getSiteUrl()}${localePath(locale, path)}`;
}

/**
 * hreflang map — route prefixes stay `/en`, `/dari`, `/ps`;
 * BCP-47 codes are `en`, `fa-AF`, `ps-AF`, plus `x-default` → English.
 */
export function languageAlternates(path = ""): Record<string, string> {
  const site = getSiteUrl();
  const suffix = normalizePath(path);
  return {
    en: `${site}/en${suffix}`,
    "fa-AF": `${site}/dari${suffix}`,
    "ps-AF": `${site}/ps${suffix}`,
    "x-default": `${site}/en${suffix}`,
  };
}

export function absoluteAsset(url?: string | null): string | null {
  if (!isUsableImageUrl(url)) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getSiteUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

type BuildMetadataInput = {
  locale: Locale;
  /** Path without locale, e.g. `/packages` or `/packages/slug` */
  path?: string;
  title: string;
  description: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
};

export function buildMetadata({
  locale,
  path = "",
  title,
  description,
  image,
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(locale, path);
  const ogImage = absoluteAsset(image);
  const languages = languageAlternates(path);
  const blockIndexing = noIndex || isNonProductionDeployment();

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type,
      locale: ogLocale(locale),
      url,
      siteName: "Shah Foladi Travel",
      title,
      description,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: blockIndexing
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function sitemapLanguageAlternates(path = ""): Record<string, string> {
  return languageAlternates(path);
}

export { locales };

/** Shared metadata for static marketing pages under `[locale]/…` */
export async function staticPageMetadata(
  params: Promise<{ locale: string }>,
  path: string,
  titleKey: string,
  descriptionKey: string,
): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path,
    title: t(titleKey),
    description: t(descriptionKey),
  });
}
