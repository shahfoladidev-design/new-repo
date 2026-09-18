import { unstable_cache } from "next/cache";
import { CMS_CACHE_SECONDS } from "@/lib/cache-config";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { BRAND_COLORS } from "@/lib/brand";
import { brandAccent, brandPrimary, brandSecondary } from "@/lib/colors";

export type PaymentSettings = {
  payment_bank_name: string | null;
  payment_account_name: string | null;
  payment_account_number: string | null;
  payment_iban: string | null;
  payment_swift: string | null;
  payment_currency: string | null;
  payment_instructions_en: string | null;
  payment_instructions_dari: string | null;
  payment_instructions_pashto: string | null;
  payment_whatsapp_note_en: string | null;
  hesabpay_enabled: boolean;
  offline_payment_enabled: boolean;
};

export type SiteSettings = {
  id: number;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address_en: string | null;
  address_dari: string | null;
  address_pashto: string | null;
  logo_url: string | null;
  updated_at: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  telegram_url: string | null;
  notification_email: string | null;
  social_tiktok: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_x: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  tripadvisor_url: string | null;
  google_reviews_url: string | null;
  why_us: Array<{ title: string; body: string }> | null;
  testimonials: Array<{ quote: string; name: string; country?: string; avatar_url?: string }> | null;
  glass_look_enabled: boolean;
} & PaymentSettings;

const defaults: SiteSettings = {
  id: 1,
  whatsapp: "+93700000000",
  phone: "+93700000000",
  email: "hello@shahfoladi.com",
  address_en: "Kabul, Afghanistan",
  address_dari: "کابل، افغانستان",
  address_pashto: "کابل، افغانستان",
  logo_url: null,
  updated_at: null,
  primary_color: BRAND_COLORS.primary,
  secondary_color: BRAND_COLORS.secondary,
  accent_color: BRAND_COLORS.accent,
  telegram_url: null,
  notification_email: null,
  social_tiktok: null,
  social_instagram: null,
  social_facebook: null,
  social_x: null,
  social_youtube: null,
  social_linkedin: null,
  tripadvisor_url: null,
  google_reviews_url: null,
  why_us: null,
  testimonials: null,
  glass_look_enabled: false,
  payment_bank_name: null,
  payment_account_name: null,
  payment_account_number: null,
  payment_iban: null,
  payment_swift: null,
  payment_currency: "USD",
  payment_instructions_en:
    "Do not pay online on this website. After you submit a booking, confirm details with us on WhatsApp. We will verify your request, then share or confirm the bank transfer steps.",
  payment_instructions_dari: null,
  payment_instructions_pashto: null,
  payment_whatsapp_note_en: "Please confirm my booking and payment details before I transfer money.",
  hesabpay_enabled: false,
  offline_payment_enabled: true,
};

/** Columns safe for anon/public reads — excludes notification_email. */
const PUBLIC_SETTINGS_SELECT =
  "id,whatsapp,phone,email,address_en,address_dari,address_pashto,logo_url,updated_at,primary_color,secondary_color,accent_color,telegram_url,social_tiktok,social_instagram,social_facebook,social_x,social_youtube,social_linkedin,tripadvisor_url,google_reviews_url,why_us,testimonials,glass_look_enabled,payment_bank_name,payment_account_name,payment_account_number,payment_iban,payment_swift,payment_currency,payment_instructions_en,payment_instructions_dari,payment_instructions_pashto,payment_whatsapp_note_en,hesabpay_enabled,offline_payment_enabled";

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    // Prefer service role when available so public logo/settings never break if
    // anon table grants drift. Fall back to anon (cookie-free) for static cache.
    const supabase = hasServiceRole() ? createServiceClient() : createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(PUBLIC_SETTINGS_SELECT)
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      // Last resort: try anon if service-role path failed (or vice versa).
      if (hasServiceRole()) {
        const pub = createPublicClient();
        const retry = await pub
          .from("site_settings")
          .select(PUBLIC_SETTINGS_SELECT)
          .eq("id", 1)
          .maybeSingle();
        if (!retry.data) return defaults;
        return normalizeSiteSettings(retry.data);
      }
      return defaults;
    }

    return normalizeSiteSettings(data);
  } catch {
    return defaults;
  }
}

function normalizeSiteSettings(data: Record<string, unknown>): SiteSettings {
  const row = data as Partial<SiteSettings>;
  return {
    ...defaults,
    ...row,
    primary_color: brandPrimary(row.primary_color),
    secondary_color: brandSecondary(row.secondary_color),
    accent_color: brandAccent(row.accent_color),
    glass_look_enabled: Boolean(row.glass_look_enabled),
    payment_currency: row.payment_currency || defaults.payment_currency,
    hesabpay_enabled: Boolean(row.hesabpay_enabled),
    offline_payment_enabled: row.offline_payment_enabled !== false,
    logo_url: typeof row.logo_url === "string" && row.logo_url.trim() ? row.logo_url.trim() : null,
    updated_at: typeof row.updated_at === "string" && row.updated_at.trim() ? row.updated_at.trim() : null,
    notification_email: null,
  };
}

const getCachedSiteSettings = unstable_cache(fetchSiteSettings, ["cms-site-settings"], {
  revalidate: CMS_CACHE_SECONDS,
  tags: [CACHE_TAGS.siteSettings, CACHE_TAGS.all],
});

/** Cross-request Data Cache + per-request React.cache dedupe. Cookie-free. */
export const getSiteSettings = cache(() => getCachedSiteSettings());

/** Internal notification inbox — service role only. */
export async function getNotificationEmail(): Promise<string | null> {
  if (!hasServiceRole()) return null;
  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from("site_settings")
      .select("notification_email")
      .eq("id", 1)
      .maybeSingle();
    return data?.notification_email?.trim() || null;
  } catch {
    return null;
  }
}

/** Admin panel: public settings plus internal notification inbox. */
export async function getAdminSiteSettings(): Promise<SiteSettings> {
  // Always prefer a fresh service-role read in admin so logo/settings match DB
  // even if the public Data Cache is briefly stale after Save logo.
  if (hasServiceRole()) {
    try {
      const admin = createServiceClient();
      const { data } = await admin
        .from("site_settings")
        .select(PUBLIC_SETTINGS_SELECT)
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        return {
          ...normalizeSiteSettings(data as Record<string, unknown>),
          notification_email: await getNotificationEmail(),
        };
      }
    } catch {
      // fall through
    }
  }
  const settings = await getSiteSettings();
  return { ...settings, notification_email: await getNotificationEmail() };
}

/**
 * CSS variables applied site-wide. Defaults = current Peace Hope brand palette.
 */
export function siteSettingsCssVars(settings: SiteSettings) {
  const primary = brandPrimary(settings.primary_color);
  const secondary = brandSecondary(settings.secondary_color);
  const accent = brandAccent(settings.accent_color);

  return {
    "--primary": primary,
    "--primary-custom": primary,
    "--secondary": secondary,
    "--secondary-custom": secondary,
    "--accent": accent,
    "--accent-custom": accent,
    "--muted": accent,
  } as Record<string, string>;
}

export function paymentInstructionsForLocale(settings: SiteSettings, locale: string) {
  if (locale === "dari" && settings.payment_instructions_dari) return settings.payment_instructions_dari;
  if (locale === "ps" && settings.payment_instructions_pashto) return settings.payment_instructions_pashto;
  return settings.payment_instructions_en ?? defaults.payment_instructions_en ?? "";
}
