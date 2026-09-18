"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify } from "@/lib/admin/notify";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { revalidateCms, revalidateContentTable, revalidatePublicPaths } from "@/lib/revalidate-cms";
import { normalizeStoredImageUrl } from "@/lib/cms-media";
import { normalizeCtaHref } from "@/lib/site-cta-routes";
import { normalizePackageType } from "@/lib/package-types";
import {
  cleanupOrphanedCmsImages,
  cleanupReplacedCmsImage,
  removeStoredCmsImageIfOrphaned,
} from "@/lib/admin/storage-cleanup";

export type ContentTable =
  | "packages"
  | "destinations"
  | "blog_posts"
  | "services"
  | "team_members"
  | "faqs"
  | "tour_departures";

const adminPathFor: Record<ContentTable, string> = {
  packages: "/admin/packages",
  destinations: "/admin/destinations",
  blog_posts: "/admin/blog",
  services: "/admin/services",
  team_members: "/admin/team",
  faqs: "/admin/faqs",
  tour_departures: "/admin/upcoming-tours",
};

/**
 * Private and group packages are two admin sections over one table, so a save in
 * either has to refresh both lists — including when a package switches type.
 */
const extraAdminPathsFor: Partial<Record<ContentTable, string[]>> = {
  packages: ["/admin/group-packages"],
};

function revalidateAdminPaths(table: ContentTable, id?: string) {
  for (const base of [adminPathFor[table], ...(extraAdminPathsFor[table] ?? [])]) {
    revalidatePath(base);
    if (id) revalidatePath(`${base}/${id}`);
  }
}

function pick(obj: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}

async function resolveImageUrl(formData: FormData, existingUrl?: string | null) {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const { uploadAdminFile } = await import("@/lib/admin/upload");
    const uploaded = await uploadAdminFile(file, "gallery");
    if (uploaded.ok) return uploaded.url;
  }
  // Keep existing uploaded URL when editing without a new file
  const hidden = normalizeStoredImageUrl(String(formData.get("image_url") ?? "") || null);
  return hidden || existingUrl || null;
}

type AttractionInput = {
  id?: string;
  title_en: string;
  title_dari?: string;
  title_pashto?: string;
  summary_en?: string;
  summary_dari?: string;
  summary_pashto?: string;
  image_url?: string;
  sort_order?: number;
};

/**
 * Sync destination highlights without wiping images on text-only saves.
 * Updates by id, inserts new rows, deletes removed ones, and keeps existing
 * image_url when the draft submits an empty URL for a known row.
 */
async function syncDestinationAttractions(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  destinationId: string,
  attractions: AttractionInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: existingError } = await supabase
    .from("destination_attractions")
    .select("id, image_url")
    .eq("destination_id", destinationId);

  if (existingError) return { ok: false, error: existingError.message };

  const existingById = new Map(
    (existing ?? []).map((row) => [String(row.id), (row.image_url as string | null) ?? null]),
  );
  const keepIds = new Set<string>();
  const orphanUrls: string[] = [];

  const drafts = attractions.filter((a) => a.title_en?.trim());
  for (let i = 0; i < drafts.length; i++) {
    const a = drafts[i]!;
    const existingId = a.id && existingById.has(a.id) ? a.id : null;
    let imageUrl = normalizeStoredImageUrl(a.image_url ?? "") || null;
    if (!imageUrl && existingId) {
      imageUrl = existingById.get(existingId) ?? null;
    }

    if (existingId) {
      const previousUrl = existingById.get(existingId);
      if (previousUrl && previousUrl !== imageUrl) orphanUrls.push(previousUrl);
    }

    const row = {
      destination_id: destinationId,
      title_en: a.title_en.trim(),
      title_dari: a.title_dari || null,
      title_pashto: a.title_pashto || null,
      summary_en: a.summary_en || null,
      summary_dari: a.summary_dari || null,
      summary_pashto: a.summary_pashto || null,
      image_url: imageUrl,
      sort_order: a.sort_order ?? i,
    };

    if (existingId) {
      const { error } = await supabase.from("destination_attractions").update(row).eq("id", existingId);
      if (error) return { ok: false, error: error.message };
      keepIds.add(existingId);
    } else {
      const { data: inserted, error } = await supabase
        .from("destination_attractions")
        .insert(row)
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      if (inserted?.id) keepIds.add(String(inserted.id));
    }
  }

  const toDelete = [...existingById.keys()].filter((id) => !keepIds.has(id));
  for (const id of toDelete) {
    const previousUrl = existingById.get(id);
    if (previousUrl) orphanUrls.push(previousUrl);
  }
  if (toDelete.length) {
    const { error } = await supabase.from("destination_attractions").delete().in("id", toDelete);
    if (error) return { ok: false, error: error.message };
  }

  await cleanupOrphanedCmsImages(supabase, orphanUrls);
  return { ok: true };
}

export async function upsertContent(
  table: ContentTable,
  formData: FormData,
  id?: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const title = String(
    formData.get("title_en") ?? formData.get("name_en") ?? formData.get("question_en") ?? formData.get("name") ?? "",
  );
  // Always slugify: hand-typed slugs with spaces/commas produce URLs that 404.
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);

  // Two-button model: only resolve/set image_url on create. Edits use updateContentImage.
  const imageUrl =
    id || table === "faqs" ? null : await resolveImageUrl(formData, null);

  if (!id && table !== "faqs" && !imageUrl) {
    return actionFail("Please upload a cover image and wait for the upload to finish before saving.");
  }

  const travelStyle = {
    type: String(formData.get("travel_style_type") ?? "").trim(),
    pace: String(formData.get("travel_style_pace") ?? "").trim(),
    accommodation: String(formData.get("travel_style_accommodation") ?? "").trim(),
    transport: String(formData.get("travel_style_transport") ?? "").trim(),
  };
  const hasTravelStyle = Object.values(travelStyle).some(Boolean);

  const raw: Record<string, unknown> = {
    slug,
    title_en: formData.get("title_en") ? String(formData.get("title_en")) : undefined,
    name: formData.get("name") ? String(formData.get("name")) : undefined,
    name_en: formData.get("name_en") ? String(formData.get("name_en")) : undefined,
    title_dari: String(formData.get("title_dari") ?? "") || null,
    title_pashto: String(formData.get("title_pashto") ?? "") || null,
    summary_en: String(formData.get("summary_en") ?? "") || null,
    summary_dari: String(formData.get("summary_dari") ?? "") || null,
    summary_pashto: String(formData.get("summary_pashto") ?? "") || null,
    description_en: String(formData.get("description_en") ?? "") || null,
    description_dari: String(formData.get("description_dari") ?? "") || null,
    description_pashto: String(formData.get("description_pashto") ?? "") || null,
    bio_en: String(formData.get("bio_en") ?? "") || null,
    bio_dari: String(formData.get("bio_dari") ?? "") || null,
    bio_pashto: String(formData.get("bio_pashto") ?? "") || null,
    role_en: String(formData.get("role_en") ?? "") || null,
    role_dari: String(formData.get("role_dari") ?? "") || null,
    role_pashto: String(formData.get("role_pashto") ?? "") || null,
    excerpt_en: String(formData.get("excerpt_en") ?? "") || null,
    excerpt_dari: String(formData.get("excerpt_dari") ?? "") || null,
    excerpt_pashto: String(formData.get("excerpt_pashto") ?? "") || null,
    content_en: String(formData.get("content_en") ?? "") || null,
    content_dari: String(formData.get("content_dari") ?? "") || null,
    content_pashto: String(formData.get("content_pashto") ?? "") || null,
    location_en: String(formData.get("location_en") ?? "") || null,
    languages: String(formData.get("languages") ?? "") || null,
    icon_key: String(formData.get("icon_key") ?? "") || null,
    category: String(formData.get("category") ?? "general"),
    question_en: String(formData.get("question_en") ?? "") || null,
    question_dari: String(formData.get("question_dari") ?? "") || null,
    question_pashto: String(formData.get("question_pashto") ?? "") || null,
    answer_en: String(formData.get("answer_en") ?? "") || null,
    answer_dari: String(formData.get("answer_dari") ?? "") || null,
    answer_pashto: String(formData.get("answer_pashto") ?? "") || null,
    badge: String(formData.get("badge") ?? "") || null,
    route_label: String(formData.get("route_label") ?? "") || null,
    reference_code: String(formData.get("reference_code") ?? "") || null,
    audience_en: String(formData.get("audience_en") ?? "") || null,
    audience_dari: String(formData.get("audience_dari") ?? "") || null,
    audience_pashto: String(formData.get("audience_pashto") ?? "") || null,
    important_notes_en: String(formData.get("important_notes_en") ?? "") || null,
    important_notes_dari: String(formData.get("important_notes_dari") ?? "") || null,
    important_notes_pashto: String(formData.get("important_notes_pashto") ?? "") || null,
    travel_style: hasTravelStyle ? travelStyle : null,
    price_from: formData.get("price_from") ? Number(formData.get("price_from")) : null,
    price_currency: "USD",
    duration_days: formData.get("duration_days") ? Number(formData.get("duration_days")) : null,
    nights: formData.get("nights") ? Number(formData.get("nights")) : null,
    days: formData.get("days") ? Number(formData.get("days")) : null,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    province_slug: String(formData.get("province_slug") ?? "") || null,
    package_type: normalizePackageType(formData.get("package_type")),
    start_date: String(formData.get("start_date") ?? "") || null,
    end_date: String(formData.get("end_date") ?? "") || null,
    is_published: formData.get("is_published") === "on",
    updated_at: new Date().toISOString(),
  };

  if (!id && imageUrl) {
    raw.image_url = imageUrl;
  }

  const standardIncludesRaw = String(formData.get("standard_includes_text") ?? "");
  raw.standard_includes = standardIncludesRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const vipIncludesRaw = String(formData.get("vip_includes_text") ?? "");
  raw.vip_includes = vipIncludesRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  raw.includes = raw.standard_includes;
  const excludesRaw = String(formData.get("excludes_text") ?? "");
  raw.excludes = excludesRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  raw.vip_price = formData.get("vip_price") ? Number(formData.get("vip_price")) : null;

  const fieldMap: Record<ContentTable, string[]> = {
    packages: [
      "slug", "title_en", "title_dari", "title_pashto", "summary_en", "summary_dari", "summary_pashto",
      "description_en", "description_dari", "description_pashto", "image_url", "price_from", "price_currency", "duration_days",
      "province_slug", "route_label", "audience_en", "audience_dari", "audience_pashto",
      "important_notes_en", "important_notes_dari", "important_notes_pashto", "includes", "standard_includes", "vip_includes",
      "excludes", "vip_price", "package_type",
      "travel_style", "reference_code", "is_published", "updated_at",
    ],
    destinations: [
      "slug", "title_en", "title_dari", "title_pashto", "summary_en", "summary_dari", "summary_pashto",
      "description_en", "description_dari", "description_pashto", "image_url", "latitude", "longitude",
      "is_published", "updated_at",
    ],
    blog_posts: [
      "slug", "title_en", "title_dari", "title_pashto", "excerpt_en", "excerpt_dari", "excerpt_pashto",
      "content_en", "content_dari", "content_pashto", "image_url", "is_published", "updated_at",
    ],
    services: [
      "slug", "title_en", "title_dari", "title_pashto", "summary_en", "summary_dari", "summary_pashto",
      "description_en", "description_dari", "description_pashto", "icon_key", "image_url", "sort_order",
      "reference_code", "is_published", "updated_at",
    ],
    team_members: [
      "name", "role_en", "role_dari", "role_pashto", "bio_en", "bio_dari", "bio_pashto", "image_url",
      "sort_order", "is_published", "updated_at",
    ],
    faqs: [
      "category", "question_en", "question_dari", "question_pashto", "answer_en", "answer_dari",
      "answer_pashto", "sort_order", "is_published",
    ],
    tour_departures: [
      "slug", "title_en", "title_dari", "title_pashto", "summary_en", "summary_dari", "summary_pashto",
      "start_date", "end_date", "nights", "days", "badge", "reference_code", "price_from", "price_currency",
      "image_url", "sort_order", "is_published", "updated_at",
    ],
  };

  const base = pick(raw, fieldMap[table]);

  let packageId = id ?? null;
  if (id) {
    // Defensive: text save must never touch image_url (use updateContentImage).
    delete base.image_url;
    const { error } = await supabase.from(table).update(base).eq("id", id);
    if (error) return actionFail(error.message);
  } else {
    const { data: inserted, error } = await supabase.from(table).insert(base).select("id").single();
    if (error) {
      if (imageUrl) await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
      return actionFail(error.message);
    }
    packageId = (inserted as { id?: string } | null)?.id ?? null;
  }

  if (table === "packages") {
    const resolvedPackageId =
      packageId ??
      ((await supabase.from("packages").select("id").eq("slug", slug).single()).data?.id as string | undefined);

    if (resolvedPackageId) {
      const destJson = formData.get("package_destinations_json");
      if (destJson != null) {
        try {
          const entries = JSON.parse(String(destJson)) as Array<{
            destination_id: string;
            days: number | null;
            sort_order: number;
            image_url?: string | null;
          }>;
          const { setPackageDestinations } = await import("./package-destinations");
          await setPackageDestinations(resolvedPackageId, entries);
        } catch {
          // ignore parse errors
        }
      }

      const daysJson = formData.get("package_days_json");
      if (daysJson != null) {
        try {
          const days = JSON.parse(String(daysJson)) as Array<{
            day_number: number;
            title_en: string;
            title_dari?: string;
            title_pashto?: string;
            body_en?: string;
            body_dari?: string;
            body_pashto?: string;
            overnight_location?: string;
            sort_order?: number;
          }>;
          await supabase.from("package_days").delete().eq("package_id", resolvedPackageId);
          if (days.length) {
            await supabase.from("package_days").insert(
              days.map((day, i) => ({
                package_id: resolvedPackageId,
                day_number: day.day_number || i + 1,
                title_en: day.title_en || `Day ${i + 1}`,
                title_dari: day.title_dari || null,
                title_pashto: day.title_pashto || null,
                body_en: day.body_en || null,
                body_dari: day.body_dari || null,
                body_pashto: day.body_pashto || null,
                overnight_location: day.overnight_location || null,
                sort_order: day.sort_order ?? i + 1,
              })),
            );
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  if (table === "destinations") {
    const destinationId =
      packageId ??
      ((await supabase.from("destinations").select("id").eq("slug", slug).single()).data?.id as string | undefined);
    const attractionsJson = formData.get("destination_attractions_json");
    if (destinationId && attractionsJson != null) {
      try {
        const attractions = JSON.parse(String(attractionsJson)) as Array<{
          id?: string;
          title_en: string;
          title_dari?: string;
          title_pashto?: string;
          summary_en?: string;
          summary_dari?: string;
          summary_pashto?: string;
          image_url?: string;
          sort_order?: number;
        }>;
        const synced = await syncDestinationAttractions(supabase, destinationId, attractions);
        if (!synced.ok) return actionFail(synced.error);
      } catch {
        // ignore parse errors
      }
    }
  }

  revalidateAdminPaths(table);
  revalidateContentTable(table);
  return actionOk(id ? "Text saved" : "Created successfully");
}

export async function deleteContent(table: ContentTable, id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!id) return actionFail("Missing id.");

  const orphanUrls: string[] = [];

  if (table !== "faqs") {
    const { data: existing } = await supabase.from(table).select("image_url").eq("id", id).maybeSingle();
    const cover = (existing as { image_url?: string | null } | null)?.image_url;
    if (cover) orphanUrls.push(cover);
  }

  if (table === "destinations") {
    const { data: attractions } = await supabase
      .from("destination_attractions")
      .select("image_url")
      .eq("destination_id", id);
    for (const row of attractions ?? []) {
      if (row.image_url) orphanUrls.push(String(row.image_url));
    }
  }

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return actionFail(error.message);

  await cleanupOrphanedCmsImages(supabase, orphanUrls);

  revalidateAdminPaths(table);
  revalidateContentTable(table);
  return actionOk("Deleted");
}

/** Save / clear only the cover image for an existing CMS row (separate from text form). */
export async function updateContentImage(
  table: ContentTable,
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  if (table === "faqs") return actionFail("FAQs do not have images.");
  if (!id) return actionFail("Save the item first, then upload an image.");

  const { supabase } = await requireAdmin();
  const rawUrl = String(formData.get("image_url") ?? "").trim();
  const imageUrl = rawUrl ? normalizeStoredImageUrl(rawUrl) : null;
  if (rawUrl && !imageUrl) {
    return actionFail("Invalid image URL. Please upload again and click Save image.");
  }

  const { data: previous } = await supabase.from(table).select("image_url").eq("id", id).maybeSingle();
  const previousUrl = (previous as { image_url?: string | null } | null)?.image_url ?? null;

  const { data: updated, error } = await supabase
    .from(table)
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, image_url");

  if (error) return actionFail(error.message);
  if (!updated?.length) return actionFail("Update failed — item not found or permission denied.");

  const saved = (updated[0] as { image_url?: string | null }).image_url ?? null;
  if (imageUrl && saved !== imageUrl) {
    return actionFail("Image URL was not saved correctly. Please try again.");
  }
  if (!imageUrl && saved) {
    return actionFail("Image was not removed correctly. Please try again.");
  }

  await cleanupReplacedCmsImage(supabase, previousUrl, saved);

  revalidateAdminPaths(table, id);
  revalidateContentTable(table);
  return actionOk(imageUrl ? "Image saved" : "Image removed");
}

/** Save or clear a destination highlight image — never touches titles/summaries. */
export async function updateAttractionImage(attractionId: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!attractionId) return actionFail("Missing highlight id.");

  const rawUrl = String(formData.get("image_url") ?? "").trim();
  const imageUrl = rawUrl ? normalizeStoredImageUrl(rawUrl) : null;
  if (rawUrl && !imageUrl) {
    return actionFail("Invalid image URL. Please upload again and click Save image.");
  }

  const { data: previous } = await supabase
    .from("destination_attractions")
    .select("image_url")
    .eq("id", attractionId)
    .maybeSingle();
  const previousUrl = (previous as { image_url?: string | null } | null)?.image_url ?? null;

  const { data: updated, error } = await supabase
    .from("destination_attractions")
    .update({ image_url: imageUrl })
    .eq("id", attractionId)
    .select("id, image_url");

  if (error) return actionFail(error.message);
  if (!updated?.length) return actionFail("Update failed — highlight not found or permission denied.");

  const saved = (updated[0] as { image_url?: string | null }).image_url ?? null;
  if (imageUrl && saved !== imageUrl) {
    return actionFail("Image URL was not saved correctly. Please try again.");
  }
  if (!imageUrl && saved) {
    return actionFail("Image was not removed correctly. Please try again.");
  }

  await cleanupReplacedCmsImage(supabase, previousUrl, saved);

  revalidatePath("/admin/destinations");
  revalidateContentTable("destinations");
  return actionOk(imageUrl ? "Highlight image saved" : "Highlight image removed");
}

/** Replace only the gallery file for an existing row. */
export async function updateGalleryImageOnly(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!id) return actionFail("Missing image id.");

  const imageUrl = normalizeStoredImageUrl(String(formData.get("image_url") ?? "").trim());
  if (!imageUrl) {
    return actionFail("Please upload an image first, wait for the upload to finish, then click Save image.");
  }

  const { data: previous } = await supabase.from("gallery_images").select("image_url").eq("id", id).maybeSingle();
  const previousUrl = (previous as { image_url?: string | null } | null)?.image_url ?? null;

  const { data: updated, error } = await supabase
    .from("gallery_images")
    .update({ image_url: imageUrl })
    .eq("id", id)
    .select("id, image_url");

  if (error) return actionFail(error.message);
  if (!updated?.length) return actionFail("Update failed — image not found or permission denied.");

  const saved = updated[0]?.image_url as string | undefined;
  if (!saved || saved !== imageUrl) {
    return actionFail("Image URL was not saved correctly. Please try again.");
  }

  await cleanupReplacedCmsImage(supabase, previousUrl, saved);

  revalidatePath("/admin/gallery");
  revalidateCms([CACHE_TAGS.gallery, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/gallery", "/");
  return actionOk("Image saved");
}

/** Replace only the hero background for an existing slide. */
export async function updateHeroSlideImage(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!id) return actionFail("Missing slide id.");

  const imageUrl = normalizeStoredImageUrl(String(formData.get("image_url") ?? "").trim());
  if (!imageUrl) return actionFail("Please upload an image first, wait for the upload to finish, then click Save image.");

  const { data: previous } = await supabase.from("hero_slides").select("image_url").eq("id", id).maybeSingle();
  const previousUrl = (previous as { image_url?: string | null } | null)?.image_url ?? null;

  const { data: updated, error } = await supabase
    .from("hero_slides")
    .update({ image_url: imageUrl })
    .eq("id", id)
    .select("id, image_url");

  if (error) return actionFail(error.message);
  if (!updated?.length) return actionFail("Update failed — slide not found or permission denied.");

  const saved = updated[0]?.image_url as string | undefined;
  if (!saved || saved !== imageUrl) {
    return actionFail("Image URL was not saved correctly. Please try again.");
  }

  await cleanupReplacedCmsImage(supabase, previousUrl, saved);

  revalidatePath("/admin/hero");
  revalidateCms([CACHE_TAGS.hero, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/");
  return actionOk("Hero image saved");
}

/**
 * Gallery create (image + meta) or meta-only update.
 * When `id` is set this never touches image_url — use updateGalleryImageOnly for photos.
 */
export async function upsertGalleryImage(formData: FormData, id?: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const meta: Record<string, unknown> = {
    title_en: String(formData.get("title_en") ?? "") || null,
    location_tag: String(formData.get("location_tag") ?? "") || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
    is_published: formData.get("is_published") === "on",
  };

  if (id) {
    const { data: updated, error } = await supabase
      .from("gallery_images")
      .update(meta)
      .eq("id", id)
      .select("id");
    if (error) return actionFail(error.message);
    if (!updated?.length) return actionFail("Update failed — image not found or permission denied.");
    revalidatePath("/admin/gallery");
    revalidateCms([CACHE_TAGS.gallery, CACHE_TAGS.homepage]);
    revalidatePublicPaths("/gallery", "/");
    return actionOk("Text saved");
  }

  let imageUrl = normalizeStoredImageUrl(String(formData.get("image_url") ?? ""));
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const { uploadAdminFile } = await import("@/lib/admin/upload");
    const uploaded = await uploadAdminFile(file, "gallery");
    if (!uploaded.ok) return actionFail(uploaded.error);
    imageUrl = uploaded.url;
  }

  if (!imageUrl) {
    return actionFail("Please upload an image and wait for the upload to finish before adding.");
  }

  const payload = { ...meta, image_url: imageUrl };
  const { data: inserted, error } = await supabase.from("gallery_images").insert(payload).select("id, image_url");
  if (error) {
    await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
    return actionFail(error.message);
  }
  if (!inserted?.length) {
    await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
    return actionFail("Insert failed — permission denied.");
  }
  const savedUrl = (inserted[0] as { image_url?: string }).image_url;
  if (!savedUrl || savedUrl !== imageUrl) {
    await supabase.from("gallery_images").delete().eq("id", (inserted[0] as { id: string }).id);
    await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
    return actionFail("Gallery image was added but the image URL was not saved. Please edit and save the image again.");
  }

  revalidatePath("/admin/gallery");
  revalidateCms([CACHE_TAGS.gallery, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/gallery", "/");
  return actionOk("Gallery image added");
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  if (!id) return actionFail("Missing image id.");

  const { data: existing, error: fetchError } = await supabase
    .from("gallery_images")
    .select("id, image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return actionFail(fetchError.message);
  if (!existing) return actionFail("Image not found or you do not have permission to delete it.");

  // Delete without RETURNING — RETURNING can fail silently under some RLS setups
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return actionFail(error.message);

  const { data: stillThere, error: verifyError } = await supabase
    .from("gallery_images")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (verifyError) return actionFail(verifyError.message);
  if (stillThere) {
    return actionFail("Delete failed — row still present. Check admin permissions / RLS.");
  }

  await removeStoredCmsImageIfOrphaned(supabase, existing.image_url as string | null);

  revalidatePath("/admin/gallery");
  revalidateCms([CACHE_TAGS.gallery, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/gallery", "/");
  return actionOk("Image deleted");
}

function parseHeroSlideText(
  formData: FormData,
): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const title_en = String(formData.get("title_en") ?? "").trim();
  if (!title_en) return { ok: false, error: "Title is required" };

  return {
    ok: true,
    data: {
      title_en,
      title_dari: String(formData.get("title_dari") ?? "") || null,
      title_pashto: String(formData.get("title_pashto") ?? "") || null,
      subtitle_en: String(formData.get("subtitle_en") ?? "") || null,
      subtitle_dari: String(formData.get("subtitle_dari") ?? "") || null,
      subtitle_pashto: String(formData.get("subtitle_pashto") ?? "") || null,
      cta_primary_label_en: String(formData.get("cta_primary_label_en") ?? "") || null,
      cta_primary_href: normalizeCtaHref(String(formData.get("cta_primary_href") ?? ""), "/packages"),
      cta_secondary_label_en: String(formData.get("cta_secondary_label_en") ?? "") || null,
      cta_secondary_href: normalizeCtaHref(String(formData.get("cta_secondary_href") ?? ""), "/book"),
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_published: formData.get("is_published") === "on",
    },
  };
}

/** Create a new hero slide (image + text together — first-time only). */
export async function createHeroSlide(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  let imageUrl = normalizeStoredImageUrl(String(formData.get("image_url") ?? ""));
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const { uploadHeroImage } = await import("@/lib/admin/upload");
    const uploaded = await uploadHeroImage(file);
    if (!uploaded.ok) return actionFail(uploaded.error);
    imageUrl = uploaded.url;
  }
  if (!imageUrl) {
    return actionFail("Please upload an image and wait for the upload to finish before adding the slide.");
  }

  const text = parseHeroSlideText(formData);
  if (!text.ok) return actionFail(text.error);

  const payload = { ...text.data, image_url: imageUrl };
  const { data: inserted, error } = await supabase.from("hero_slides").insert(payload).select("id, image_url");
  if (error) {
    await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
    return actionFail(error.message);
  }
  if (!inserted?.length) {
    await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
    return actionFail("Insert failed — permission denied.");
  }
  const savedUrl = (inserted[0] as { image_url?: string }).image_url;
  if (!savedUrl || savedUrl !== imageUrl) {
    await supabase.from("hero_slides").delete().eq("id", (inserted[0] as { id: string }).id);
    await removeStoredCmsImageIfOrphaned(supabase, imageUrl);
    return actionFail(
      "Slide was created but the image URL was not saved. Please edit the slide and save the image again.",
    );
  }

  revalidatePath("/admin/hero");
  revalidateCms([CACHE_TAGS.hero, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/");
  return actionOk("Hero slide added");
}

/**
 * Update hero text/settings only — never reads or writes image_url.
 * Matches the separate “Save slide text” button on the admin UI.
 */
export async function updateHeroSlideText(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const slideId = id || String(formData.get("id") ?? "") || "";
  if (!slideId) return actionFail("Missing slide id.");

  const text = parseHeroSlideText(formData);
  if (!text.ok) return actionFail(text.error);

  const { data: updated, error } = await supabase
    .from("hero_slides")
    .update(text.data)
    .eq("id", slideId)
    .select("id");
  if (error) return actionFail(error.message);
  if (!updated?.length) return actionFail("Update failed — slide not found or permission denied.");

  revalidatePath("/admin/hero");
  revalidateCms([CACHE_TAGS.hero, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/");
  return actionOk("Hero slide saved");
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!id) return actionFail("Missing slide id.");

  const { data: existing, error: fetchError } = await supabase
    .from("hero_slides")
    .select("id, image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return actionFail(fetchError.message);
  if (!existing) return actionFail("Slide not found or you do not have permission to delete it.");

  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) return actionFail(error.message);

  await removeStoredCmsImageIfOrphaned(supabase, existing.image_url as string | null);

  revalidatePath("/admin/hero");
  revalidateCms([CACHE_TAGS.hero, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/");
  return actionOk("Hero slide deleted");
}
