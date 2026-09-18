import type { Metadata } from "next";
import "../globals.css";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleDirection } from "@/components/locale-direction";
import { isRtl, type Locale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: "Admin | Shah Foladi",
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const rtl = isRtl(locale);

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      lang={locale}
      className={`${geistSans.variable} min-h-screen bg-background text-foreground`}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <LocaleDirection />
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
