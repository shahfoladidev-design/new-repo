import { requireAdmin } from "@/lib/admin/auth";
import { friendlyImageProcessError, validateImageFileAsync } from "@/lib/admin/image-upload-validation";
import { processHeroUpload, processSanitizedUpload } from "@/lib/admin/image-process";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type StorageBucket = "gallery" | "brand" | "journey";

const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Prefer service-role for Storage writes after the caller has verified admin auth.
 * Falls back to the user-scoped client when the service key is not configured (local).
 */
export function storageWriteClient(userClient: SupabaseClient): SupabaseClient {
  return hasServiceRole() ? createServiceClient() : userClient;
}

export async function uploadToBucket(
  supabase: SupabaseClient,
  file: File,
  bucket: StorageBucket,
) {
  if (!file || file.size === 0) {
    return { ok: false as const, error: "No file selected" };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "File must be under 20 MB" };
  }

  const validated = await validateImageFileAsync(file, bucket);
  if (!validated.ok) return { ok: false as const, error: validated.error };

  try {
    const { buffer, contentType, ext } = await processSanitizedUpload(file, bucket);
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const body = new Uint8Array(buffer);
    const { error } = await supabase.storage.from(bucket).upload(path, body, {
      contentType,
      upsert: false,
    });

    if (error) return { ok: false as const, error: error.message };

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { ok: true as const, url: data.publicUrl };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Image processing failed";
    return { ok: false as const, error: friendlyImageProcessError(raw) };
  }
}

export async function uploadAdminFile(file: File, bucket: StorageBucket) {
  const { supabase } = await requireAdmin();
  return uploadToBucket(storageWriteClient(supabase), file, bucket);
}

/** Upload a hero slide image — center-cropped to 16:9 (see src/lib/hero-media.ts). */
export async function uploadHeroImage(file: File) {
  const { supabase: userClient } = await requireAdmin();
  const supabase = storageWriteClient(userClient);

  if (!file || file.size === 0) {
    return { ok: false as const, error: "No file selected" };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "File must be under 20 MB" };
  }

  const validated = await validateImageFileAsync(file, "gallery");
  if (!validated.ok) return { ok: false as const, error: validated.error };

  try {
    const { buffer, contentType, ext } = await processHeroUpload(file);
    if (!buffer?.length || buffer.length < 128) {
      return { ok: false as const, error: "Processed image was empty. Please try a different JPEG or PNG file." };
    }

    const path = `hero/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const body = new Uint8Array(buffer);
    const { error } = await supabase.storage.from("gallery").upload(path, body, {
      contentType,
      upsert: false,
    });

    if (error) return { ok: false as const, error: error.message };

    const { data } = supabase.storage.from("gallery").getPublicUrl(path);
    return { ok: true as const, url: data.publicUrl };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Hero image processing failed";
    return {
      ok: false as const,
      error: friendlyImageProcessError(raw),
    };
  }
}
