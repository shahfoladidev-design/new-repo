import { getSiteUrl, htmlLang } from "@/lib/seo";
import { locales, type Locale } from "@/i18n/config";
import { JsonLd } from "@/components/json-ld";

/** Helps Google understand the site + on-site search targets for each locale. */
export function WebsiteJsonLd() {
  const siteUrl = getSiteUrl();

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Shah Foladi Travel",
        url: siteUrl,
        inLanguage: locales.map((locale) => htmlLang(locale as Locale)),
        potentialAction: locales.map((locale) => ({
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/${locale}/packages?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
          inLanguage: htmlLang(locale as Locale),
        })),
      }}
    />
  );
}
