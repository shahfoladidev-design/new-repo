import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/seo";
import { isUsableImageUrl } from "@/lib/cms-media";
import { JsonLd } from "@/components/json-ld";

export async function OrganizationJsonLd() {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();
  const logo = isUsableImageUrl(settings.logo_url) ? absoluteLogo(settings.logo_url, siteUrl) : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "Shah Foladi Travel",
        url: siteUrl,
        ...(logo ? { logo } : {}),
        description:
          "Local Afghanistan tour company offering curated packages, destinations, and booking support.",
        telephone: settings.phone ?? undefined,
        email: settings.email ?? undefined,
        address: settings.address_en
          ? {
              "@type": "PostalAddress",
              addressLocality: settings.address_en,
              addressCountry: "AF",
            }
          : undefined,
        areaServed: {
          "@type": "Country",
          name: "Afghanistan",
        },
        sameAs: [
          settings.social_facebook,
          settings.social_instagram,
          settings.social_tiktok,
          settings.social_youtube,
          settings.social_linkedin,
          settings.social_x,
          settings.tripadvisor_url,
        ].filter(Boolean),
      }}
    />
  );
}

function absoluteLogo(url: string, siteUrl: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}
