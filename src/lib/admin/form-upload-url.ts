import type { ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { isUsableImageUrl } from "@/lib/cms-media";

/** Pick the best available upload URL from ref + FormData. */
export function resolveUploadUrl(
  formData: FormData,
  imageRef: ImageUploadFieldHandle | null | undefined,
  fieldName = "image_url",
): string {
  const fromRef = imageRef?.getUrl()?.trim() ?? "";
  const fromForm = String(formData.get(fieldName) ?? "").trim();
  return fromRef || fromForm;
}

/**
 * Merge the live upload field value into FormData before a server action runs.
 * React form actions can omit hidden fields; the ref always has the latest URL.
 */
export function ensureUploadFieldInFormData(
  formData: FormData,
  imageRef: ImageUploadFieldHandle | null | undefined,
  fieldName = "image_url",
): string {
  const url = resolveUploadUrl(formData, imageRef, fieldName);
  if (url) formData.set(fieldName, url);
  return url;
}

export function requireUsableUploadUrl(
  url: string,
  label = "image",
): { ok: true; url: string } | { ok: false; error: string } {
  if (!isUsableImageUrl(url)) {
    return {
      ok: false,
      error: `Please upload a ${label} and wait until the upload finishes before saving.`,
    };
  }
  return { ok: true, url };
}
