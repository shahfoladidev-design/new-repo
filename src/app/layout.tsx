import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { getSiteUrl, isNonProductionDeployment, languageAlternates } from "@/lib/seo";
import { BRAND_COLORS } from "@/lib/brand";
import { resolveDocumentHtmlAttrs } from "@/lib/document-locale";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();
const homeAlternates = languageAlternates("");
const previewNoIndex = isNonProductionDeployment();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_COLORS.primary },
    { media: "(prefers-color-scheme: dark)", color: BRAND_COLORS.primary },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shah Foladi Travel | Explore Afghanistan",
    template: "%s | Shah Foladi Travel",
  },
  description:
    "Shah Foladi Travel is a local Afghanistan tour company offering curated packages, destinations, and booking support across the country.",
  applicationName: "Shah Foladi Travel",
  authors: [{ name: "Shah Foladi Travel" }],
  creator: "Shah Foladi Travel",
  publisher: "Shah Foladi Travel",
  keywords: [
    "Afghanistan tours",
    "Shah Foladi",
    "Afghanistan travel agency",
    "Bamyan tour",
    "Wakhan tour",
    "Kabul travel",
    "Explore Afghanistan",
    "Afghanistan tour guide",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    title: "Shah Foladi",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/en`,
    siteName: "Shah Foladi Travel",
    title: "Shah Foladi Travel | Explore Afghanistan",
    description:
      "Local Afghanistan tours with curated packages, destinations, and trusted on-ground support.",
  },
  twitter: {
    card: "summary",
    title: "Shah Foladi Travel | Explore Afghanistan",
    description:
      "Local Afghanistan tours with curated packages, destinations, and trusted on-ground support.",
  },
  robots: previewNoIndex
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
  alternates: {
    canonical: homeAlternates.en,
    languages: homeAlternates,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: "travel",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, dir } = await resolveDocumentHtmlAttrs();

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shah Foladi" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${dmSans.variable} ${outfit.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
