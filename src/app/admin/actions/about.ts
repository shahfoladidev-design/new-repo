"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { revalidateCms, revalidatePublicPaths } from "@/lib/revalidate-cms";
import { cleanupReplacedCmsImage } from "@/lib/admin/storage-cleanup";

function textOrNull(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function textRequired(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Save the singleton About Us page. Busts about + homepage caches and public routes
 * so website and dashboard never diverge after an admin save.
 */
export async function updateAboutPage(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from("about_page")
    .select("hero_image_url")
    .eq("id", 1)
    .maybeSingle();

  const heroImageUrl = textOrNull(formData, "hero_image_url");
  const previousUrl = (existing?.hero_image_url as string | null | undefined) ?? null;

  const payload = {
    hero_image_url: heroImageUrl,
    title_en: textRequired(formData, "title_en"),
    title_dari: textOrNull(formData, "title_dari"),
    title_pashto: textOrNull(formData, "title_pashto"),
    intro_en: textRequired(formData, "intro_en"),
    intro_dari: textOrNull(formData, "intro_dari"),
    intro_pashto: textOrNull(formData, "intro_pashto"),
    who_we_are_en: textRequired(formData, "who_we_are_en"),
    who_we_are_dari: textOrNull(formData, "who_we_are_dari"),
    who_we_are_pashto: textOrNull(formData, "who_we_are_pashto"),
    approach_en: textRequired(formData, "approach_en"),
    approach_dari: textOrNull(formData, "approach_dari"),
    approach_pashto: textOrNull(formData, "approach_pashto"),
    purpose_en: textRequired(formData, "purpose_en"),
    purpose_dari: textOrNull(formData, "purpose_dari"),
    purpose_pashto: textOrNull(formData, "purpose_pashto"),
    where_we_operate_en: textRequired(formData, "where_we_operate_en"),
    where_we_operate_dari: textOrNull(formData, "where_we_operate_dari"),
    where_we_operate_pashto: textOrNull(formData, "where_we_operate_pashto"),
    working_with_us_en: textRequired(formData, "working_with_us_en"),
    working_with_us_dari: textOrNull(formData, "working_with_us_dari"),
    working_with_us_pashto: textOrNull(formData, "working_with_us_pashto"),
    meta_title_en: textOrNull(formData, "meta_title_en"),
    meta_title_dari: textOrNull(formData, "meta_title_dari"),
    meta_title_pashto: textOrNull(formData, "meta_title_pashto"),
    meta_description_en: textOrNull(formData, "meta_description_en"),
    meta_description_dari: textOrNull(formData, "meta_description_dari"),
    meta_description_pashto: textOrNull(formData, "meta_description_pashto"),
    is_published: formData.get("is_published") === "on",
    updated_at: new Date().toISOString(),
  };

  if (!payload.title_en) return actionFail("English title is required.");
  if (!payload.intro_en) return actionFail("English intro is required.");

  const { error } = await supabase.from("about_page").upsert({ id: 1, ...payload }, { onConflict: "id" });
  if (error) return actionFail(error.message);

  await cleanupReplacedCmsImage(supabase, previousUrl, heroImageUrl);

  revalidatePath("/admin/about");
  revalidateCms([CACHE_TAGS.about, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/about", "/");
  return actionOk("About page saved");
}
