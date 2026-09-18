"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateImageFile } from "@/lib/admin/image-upload-validation";
import { removeUnsavedUploadedFile } from "@/lib/admin/storage-cleanup";
import { isUsableImageUrl } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

const MAX_BYTES = 20 * 1024 * 1024;

type StorageBucket = "gallery" | "brand" | "journey";

export type ImageUploadFieldHandle = {
  /** Current public URL (from hidden input — safe to read at form submit). */
  getUrl: () => string;
  isUploading: () => boolean;
  isDirty: () => boolean;
  /** Call after a successful save so the field syncs with server props again. */
  markSaved: () => void;
};

/** After upload, try loading the public URL; keep local blob preview until it works. */
function preloadRemotePreview(
  publicUrl: string,
  onReady: () => void,
  onFailed: () => void,
) {
  const img = new Image();
  img.onload = () => onReady();
  img.onerror = () => onFailed();
  img.src = publicUrl;
}

/**
 * Upload image directly to Supabase Storage (avoids Vercel/Server Action body limits),
 * then expose the public URL to the parent form via a hidden input.
 */
export const ImageUploadField = forwardRef<
  ImageUploadFieldHandle,
  {
    label?: string;
    name?: string;
    /** Kept for form compatibility; file is uploaded on select and not re-posted. */
    fileName?: string;
    defaultUrl?: string;
    hint?: string;
    required?: boolean;
    bucket?: StorageBucket;
    previewFit?: "cover" | "contain";
    /** Fixed preview/placeholder box (e.g. logo 8.5rem × 9.5rem). Always shown. */
    previewFrameClassName?: string;
    /** Image classes inside the fixed frame (e.g. logo crop/scale). */
    previewImageClassName?: string;
    showDownload?: boolean;
    allowClear?: boolean;
    /** Show “click Save image” hint after a successful upload. */
    showSaveHint?: boolean;
    /** When true, uploads are center-cropped to the hero carousel frame (16:9). */
    heroCrop?: boolean;
    /** Optional callback when the public URL changes (e.g. attraction drafts). */
    onUrlChange?: (url: string) => void;
    /** Fires while a file upload is in progress (disable parent submit buttons). */
    onUploadingChange?: (uploading: boolean) => void;
  }
>(function ImageUploadField(
  {
    label = "Image",
    name = "image_url",
    fileName: _fileName = "image_file",
    defaultUrl = "",
    hint = "Upload an image file (JPEG, PNG, WebP, or GIF) under 20 MB.",
    required = false,
    bucket = "gallery",
    previewFit = "cover",
    previewFrameClassName,
    previewImageClassName,
    showDownload = true,
    allowClear = true,
    showSaveHint = true,
    heroCrop = false,
    onUrlChange,
    onUploadingChange,
  },
  ref,
) {
  const [preview, setPreview] = useState(defaultUrl);
  const [url, setUrl] = useState(defaultUrl);
  const [error, setError] = useState<string | null>(null);
  const [previewNote, setPreviewNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);
  /** Authoritative URL for form submit — hidden inputs can be empty while React state has the URL. */
  const urlRef = useRef(defaultUrl);
  const savedUrlRef = useRef(defaultUrl);
  const blobRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const uploadingRef = useRef(false);
  const justUploadedRef = useRef(false);

  const readStoredUrl = () => {
    const fromRef = urlRef.current.trim();
    if (fromRef) return fromRef;
    return hiddenRef.current?.value?.trim() ?? "";
  };

  const writeStoredUrl = (next: string) => {
    urlRef.current = next;
    if (hiddenRef.current) hiddenRef.current.value = next;
  };

  /** Drop a Storage file that was uploaded but never saved to the DB. Never touches the saved URL. */
  const discardUnsavedUpload = async (candidate: string) => {
    const target = candidate.trim();
    const saved = savedUrlRef.current.trim();
    if (!target || target === saved) return;
    try {
      const supabase = createClient();
      await removeUnsavedUploadedFile(supabase, target, saved);
    } catch {
      // Best-effort — orphan sweep can catch leftovers later.
    }
  };

  useImperativeHandle(ref, () => ({
    getUrl: () => readStoredUrl(),
    isUploading: () => uploadingRef.current,
    isDirty: () => dirtyRef.current,
    markSaved: () => {
      const current = readStoredUrl();
      savedUrlRef.current = current;
      setDirty(false);
      dirtyRef.current = false;
      justUploadedRef.current = false;
    },
  }));

  useEffect(() => {
    uploadingRef.current = uploading;
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  // Sync from server when props catch up — never clobber an in-progress upload or a
  // just-saved URL while parent props are still stale (common after Save logo/image).
  useEffect(() => {
    if (dirtyRef.current || uploadingRef.current) return;

    const serverUrl = (defaultUrl ?? "").trim();
    const localUrl = urlRef.current.trim();
    const savedUrl = savedUrlRef.current.trim();

    if (localUrl && localUrl === savedUrl && serverUrl !== localUrl) {
      return;
    }

    if (serverUrl === savedUrl && serverUrl === localUrl) return;

    urlRef.current = serverUrl;
    savedUrlRef.current = serverUrl;
    setUrl(serverUrl);
    setPreview(serverUrl);
    setDirty(false);
    dirtyRef.current = false;
    justUploadedRef.current = false;
    setError(null);
    setPreviewNote(null);
    writeStoredUrl(serverUrl);
  }, [defaultUrl]);

  useEffect(() => {
    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, []);

  const setBlobPreview = (file: File) => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    const blobUrl = URL.createObjectURL(file);
    blobRef.current = blobUrl;
    setPreview(blobUrl);
  };

  const commitPublicUrl = (next: string, markDirty: boolean) => {
    setUrl(next);
    writeStoredUrl(next);
    setDirty(markDirty);
    dirtyRef.current = markDirty;
    onUrlChange?.(next);
    setError(null);
    setPreviewNote(null);
    justUploadedRef.current = markDirty;

    preloadRemotePreview(
      next,
      () => {
        if (blobRef.current) {
          URL.revokeObjectURL(blobRef.current);
          blobRef.current = null;
        }
        setPreview(next);
        setPreviewNote(null);
      },
      () => {
        setPreviewNote(
          "Upload complete — preview is from your file. Click Save image; it will appear on the site after saving.",
        );
      },
    );
  };

  const applyUrl = (next: string, markDirty: boolean) => {
    if (!next) {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      setUrl("");
      setPreview("");
      setDirty(markDirty);
      dirtyRef.current = markDirty;
      writeStoredUrl("");
      onUrlChange?.("");
      return;
    }

    if (markDirty && blobRef.current) {
      commitPublicUrl(next, markDirty);
      return;
    }

    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    setUrl(next);
    setPreview(next);
    setDirty(markDirty);
    dirtyRef.current = markDirty;
    writeStoredUrl(next);
    onUrlChange?.(next);
  };

  const clearImage = () => {
    const current = readStoredUrl();
    void discardUnsavedUpload(current);
    justUploadedRef.current = false;
    applyUrl("", true);
    setError(null);
    setPreviewNote(null);
  };

  const handlePreviewError = () => {
    if (preview.startsWith("blob:")) return;

    if (justUploadedRef.current && url) {
      setPreviewNote(
        "Upload complete — preview is from your file. Click Save image; it will appear on the site after saving.",
      );
      return;
    }

    if (dirtyRef.current && url) {
      setPreviewNote("Saved URL preview unavailable here — click Save image if you just uploaded, or re-upload.");
      return;
    }

    setPreviewNote("Could not load the saved image preview. You can still upload a replacement.");
  };

  const frameClass = previewFrameClassName
    ? cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30",
        previewFrameClassName,
      )
    : null;

  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <p className="text-xs text-muted-foreground">{hint}</p>

      {frameClass ? (
        <div className={frameClass}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className={previewImageClassName ?? "h-full w-full object-contain"}
              onError={handlePreviewError}
            />
          ) : (
            <span className="px-2 text-center text-[11px] text-muted-foreground">No image yet</span>
          )}
        </div>
      ) : preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className={
            previewFit === "contain"
              ? "h-36 w-full rounded-xl border border-border bg-muted/30 object-contain p-2"
              : "h-36 w-full rounded-xl border border-border object-cover"
          }
          onError={handlePreviewError}
        />
      ) : null}

      {/* Uncontrolled hidden input — React controlled hidden fields can be omitted from FormData. */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultUrl} />

      <label className="grid gap-1">
        <span className="text-xs text-muted-foreground">
          {url ? "Replace image" : "Upload image"}
          {required && !url ? " *" : ""}
          {uploading ? " — uploading…" : dirty && url ? " — ready to save" : ""}
        </span>
        <input
          type="file"
          accept={
            bucket === "brand"
              ? "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              : "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          }
          required={required && !isUsableImageUrl(url)}
          disabled={uploading}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground disabled:opacity-60"
          onChange={async (e) => {
            const input = e.target;
            const file = input.files?.[0];
            if (!file) {
              setError(null);
              setPreviewNote(null);
              setPreview(url);
              return;
            }
            if (file.size > MAX_BYTES) {
              setError("Image must be under 20 MB. Please compress or resize it, then try again.");
              setPreview(url);
              input.value = "";
              return;
            }

            const validated = validateImageFile(file, bucket);
            if (!validated.ok) {
              setError(validated.error);
              setPreview(url);
              input.value = "";
              return;
            }

            setUploading(true);
            uploadingRef.current = true;
            setError(null);
            setPreviewNote(null);
            setBlobPreview(file);

            const previousUrl = readStoredUrl() || url;

            const commitNewUpload = async (nextUrl: string) => {
              // Drop the previous unsaved upload (A→B without Save) — never the last saved DB URL.
              if (previousUrl && previousUrl !== nextUrl) {
                await discardUnsavedUpload(previousUrl);
              }
              commitPublicUrl(nextUrl, true);
            };

            try {
              // Prefer same-origin server upload for every dashboard image.
              // Browser → Supabase Storage often fails under Edge Tracking Prevention
              // ("blocked access to storage") even when the admin session is valid.
              const endpoint = heroCrop ? "/api/admin/upload/hero" : "/api/admin/upload";
              const body = new FormData();
              body.set("file", file);
              if (!heroCrop) body.set("bucket", bucket);

              const res = await fetch(endpoint, {
                method: "POST",
                body,
                credentials: "same-origin",
              });
              const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
              if (res.ok && payload.url) {
                await commitNewUpload(payload.url);
                return;
              }

              // Fallback: direct Storage upload — development only (skips Sharp; production must use API).
              if (!heroCrop && process.env.NODE_ENV === "development") {
                const supabase = createClient();
                const {
                  data: { user },
                  error: userError,
                } = await supabase.auth.getUser();

                if (userError || !user) {
                  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
                  if (refreshError || !refreshed.session) {
                    setError(
                      payload.error ||
                        "Your admin session expired. Please sign in again, then retry the upload.",
                    );
                    setPreview(previousUrl);
                    writeStoredUrl(previousUrl);
                    input.value = "";
                    return;
                  }
                }

                const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
                const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
                const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
                  contentType: validated.contentType,
                  upsert: false,
                });

                if (!uploadError) {
                  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                  await commitNewUpload(data.publicUrl);
                  return;
                }

                setError(
                  payload.error ||
                    uploadError.message ||
                    "Upload failed. Please try again (JPEG/PNG under 20 MB).",
                );
              } else {
                setError(
                  payload.error ||
                    "Upload failed. On production, ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel and retry.",
                );
              }

              justUploadedRef.current = false;
              setPreview(previousUrl);
              writeStoredUrl(previousUrl);
              input.value = "";
            } catch (err) {
              justUploadedRef.current = false;
              setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
              setPreview(previousUrl);
              writeStoredUrl(previousUrl);
              input.value = "";
            } finally {
              setUploading(false);
              uploadingRef.current = false;
              input.value = "";
            }
          }}
        />
      </label>

      {(url || showDownload || allowClear) && (
        <div className="flex flex-wrap gap-2">
          {url && showDownload ? (
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Download
            </a>
          ) : null}
          {url && allowClear ? (
            <button
              type="button"
              onClick={clearImage}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Remove image
            </button>
          ) : null}
        </div>
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && previewNote ? <p className="text-xs text-amber-700">{previewNote}</p> : null}
      {!error && !previewNote && showSaveHint && dirty && url ? (
        <p className="text-xs text-amber-700">Image uploaded — click Save image to apply it on the site.</p>
      ) : null}
    </div>
  );
});
