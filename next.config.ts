import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function supabaseImagePattern() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const hostname = new URL(raw).hostname;
    return hostname ? ({ protocol: "https" as const, hostname }) : null;
  } catch {
    return null;
  }
}

const PRODUCTION_HOST = "www.shahfoladi.com";
const LEGACY_VERCEL_HOST = "shah-foladi-website.vercel.app";
const APEX_HOST = "shahfoladi.com";
const LOCALES = "en|dari|ps";

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
] as const;

/** Retired public sections → current IA (301, locale preserved when present). */
const legacySectionRedirects = [
  { source: `/:locale(${LOCALES})/hotels`, destination: "/:locale/destinations" },
  { source: `/:locale(${LOCALES})/hotels/:slug`, destination: "/:locale/destinations" },
  { source: `/:locale(${LOCALES})/guides`, destination: "/:locale/team" },
  { source: `/:locale(${LOCALES})/guides/:slug`, destination: "/:locale/team" },
  { source: `/:locale(${LOCALES})/itineraries`, destination: "/:locale/packages" },
  { source: `/:locale(${LOCALES})/itineraries/:slug`, destination: "/:locale/packages" },
  { source: "/hotels", destination: "/en/destinations" },
  { source: "/hotels/:slug", destination: "/en/destinations" },
  { source: "/guides", destination: "/en/team" },
  { source: "/guides/:slug", destination: "/en/team" },
  { source: "/itineraries", destination: "/en/packages" },
  { source: "/itineraries/:slug", destination: "/en/packages" },
] as const;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Cap generated widths — default includes 3840 which paired with loose sizes caused ~800KB+ payloads.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage — env hostname plus fallback for any project ref
      ...(supabaseImagePattern() ? [supabaseImagePattern()!] : []),
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Gallery/admin uploads go through Server Actions (professional images up to ~20 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
    proxyClientMaxBodySize: "20mb",
  },
  async redirects() {
    return [
      // Old production Vercel hostname → canonical custom domain (preserves path + query)
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_VERCEL_HOST }],
        destination: `https://${PRODUCTION_HOST}/:path*`,
        permanent: true,
      },
      // Apex → www (safe; does not affect localhost or preview *.vercel.app hosts)
      {
        source: "/:path*",
        has: [{ type: "host", value: APEX_HOST }],
        destination: `https://${PRODUCTION_HOST}/:path*`,
        permanent: true,
      },
      ...legacySectionRedirects.map(({ source, destination }) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
      {
        source: "/:locale(en|dari|ps)/book/pay/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/api/payments/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/image",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
