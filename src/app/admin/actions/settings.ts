"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { brandAccent, brandPrimary, brandSecondary } from "@/lib/colors";
import { BRAND_COLORS } from "@/lib/brand";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { revalidateCms, revalidatePublicPaths } from "@/lib/revalidate-cms";
import { cleanupReplacedCmsImage } from "@/lib/admin/storage-cleanup";

function parseJsonLines(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseWhyUs(raw: string) {
  return parseJsonLines(raw)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), body: rest.join("|").trim() };
    })
    .filter((row) => row.title);
}

function parseTestimonials(raw: string) {
  return parseJsonLines(raw)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      return {
        quote: parts[0] ?? "",
        name: parts[1] ?? "",
        country: parts[2] || undefined,
      };
    })
    .filter((row) => row.quote && row.name);
}

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const payload = {
    whatsapp: String(formData.get("whatsapp") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    telegram_url: String(formData.get("telegram_url") ?? "") || null,
    notification_email: String(formData.get("notification_email") ?? "") || null,
    primary_color: brandPrimary(String(formData.get("primary_color") ?? BRAND_COLORS.primary)),
    secondary_color: brandSecondary(String(formData.get("secondary_color") ?? BRAND_COLORS.secondary)),
    accent_color: brandAccent(String(formData.get("accent_color") ?? BRAND_COLORS.accent)),
    social_tiktok: String(formData.get("social_tiktok") ?? "") || null,
    social_instagram: String(formData.get("social_instagram") ?? "") || null,
    social_facebook: String(formData.get("social_facebook") ?? "") || null,
    social_x: String(formData.get("social_x") ?? "") || null,
    social_youtube: String(formData.get("social_youtube") ?? "") || null,
    social_linkedin: String(formData.get("social_linkedin") ?? "") || null,
    tripadvisor_url: String(formData.get("tripadvisor_url") ?? "") || null,
    google_reviews_url: String(formData.get("google_reviews_url") ?? "") || null,
    address_en: String(formData.get("address_en") ?? ""),
    address_dari: String(formData.get("address_dari") ?? "") || null,
    address_pashto: String(formData.get("address_pashto") ?? "") || null,
    why_us: parseWhyUs(String(formData.get("why_us_text") ?? "")),
    testimonials: parseTestimonials(String(formData.get("testimonials_text") ?? "")),
    payment_bank_name: String(formData.get("payment_bank_name") ?? "") || null,
    payment_account_name: String(formData.get("payment_account_name") ?? "") || null,
    payment_account_number: String(formData.get("payment_account_number") ?? "") || null,
    payment_iban: String(formData.get("payment_iban") ?? "") || null,
    payment_swift: String(formData.get("payment_swift") ?? "") || null,
    payment_currency: String(formData.get("payment_currency") ?? "USD") || "USD",
    payment_instructions_en: String(formData.get("payment_instructions_en") ?? "") || null,
    payment_instructions_dari: String(formData.get("payment_instructions_dari") ?? "") || null,
    payment_instructions_pashto: String(formData.get("payment_instructions_pashto") ?? "") || null,
    payment_whatsapp_note_en: String(formData.get("payment_whatsapp_note_en") ?? "") || null,
    hesabpay_enabled: formData.get("hesabpay_enabled") === "on",
    offline_payment_enabled: formData.get("offline_payment_enabled") === "on",
    glass_look_enabled: formData.get("glass_look_enabled") === "on",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
  if (error) return actionFail(error.message);

  // logo_url is intentionally omitted — use updateSiteLogo / clearSiteLogo only.

  revalidatePath("/admin/settings");
  revalidateCms([CACHE_TAGS.siteSettings]);
  return actionOk("Settings saved");
}

/** Save or clear the site logo independently from other settings. */
export async function updateSiteLogo(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  const { data: previous } = await supabase.from("site_settings").select("logo_url").eq("id", 1).maybeSingle();
  const previousUrl = (previous as { logo_url?: string | null } | null)?.logo_url ?? null;

  const { data: updated, error } = await supabase
    .from("site_settings")
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("id, logo_url");

  if (error) return actionFail(error.message);
  if (!updated?.length) return actionFail("Update failed — settings not found.");

  const saved = updated[0]?.logo_url as string | null | undefined;
  if (logoUrl && saved !== logoUrl) {
    return actionFail("Logo URL was not saved correctly. Please try again.");
  }

  await cleanupReplacedCmsImage(supabase, previousUrl, saved ?? null);

  revalidatePath("/admin/settings");
  // Bust layout + all locales — logo lives in the shared locale layout header.
  revalidateCms([CACHE_TAGS.siteSettings, CACHE_TAGS.all]);
  revalidatePublicPaths("/");
  return actionOk(logoUrl ? "Logo saved" : "Logo removed");
}

export async function clearSiteLogo(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: previous } = await supabase.from("site_settings").select("logo_url").eq("id", 1).maybeSingle();
  const previousUrl = (previous as { logo_url?: string | null } | null)?.logo_url ?? null;

  const { error } = await supabase
    .from("site_settings")
    .update({ logo_url: null, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return actionFail(error.message);

  await cleanupReplacedCmsImage(supabase, previousUrl, null);

  revalidatePath("/admin/settings");
  revalidateCms([CACHE_TAGS.siteSettings]);
  revalidatePublicPaths("/");
  return actionOk("Logo removed");
}

export async function updateLegalDocument(docType: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("legal_documents")
    .update({
      title_en: String(formData.get("title_en")),
      title_dari: String(formData.get("title_dari") ?? "") || null,
      title_pashto: String(formData.get("title_pashto") ?? "") || null,
      content_en: String(formData.get("content_en")),
      content_dari: String(formData.get("content_dari") ?? "") || null,
      content_pashto: String(formData.get("content_pashto") ?? "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("doc_type", docType);

  if (error) return actionFail(error.message);

  revalidatePath("/admin/agreements");
  revalidateCms([CACHE_TAGS.agreements]);
  revalidatePublicPaths("/agreements");
  return actionOk("Agreement saved");
}

/** Instantly restore Peace Hope brand palette and revalidate the public site. */
export async function resetBrandColors(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("site_settings")
    .update({
      primary_color: BRAND_COLORS.primary,
      secondary_color: BRAND_COLORS.secondary,
      accent_color: BRAND_COLORS.accent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return actionFail(error.message);

  revalidatePath("/admin/settings");
  revalidateCms([CACHE_TAGS.siteSettings]);
  return actionOk("Default colors restored");
}
