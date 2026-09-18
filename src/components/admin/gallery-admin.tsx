"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import {
  upsertGalleryImage,
  deleteGalleryImage,
  updateGalleryImageOnly,
} from "@/app/admin/actions/content";
import { ImageUploadField, type ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import { ensureUploadFieldInFormData, requireUsableUploadUrl } from "@/lib/admin/form-upload-url";

type GalleryItem = {
  id: string;
  title_en: string | null;
  image_url: string;
  location_tag?: string | null;
  sort_order: number;
  is_published: boolean;
};

function GalleryImageSaveForm({
  itemId,
  imageUrl,
  onSaved,
}: {
  itemId: string;
  imageUrl: string;
  onSaved: () => void;
}) {
  const imageRef = useRef<ImageUploadFieldHandle>(null);

  return (
    <AdminSubmitForm
      action={updateGalleryImageOnly.bind(null, itemId)}
      successMessage="Image saved"
      encType="multipart/form-data"
      className="grid gap-2"
      imageRef={imageRef}
      requireImage
      onSuccess={onSaved}
    >
      <ImageUploadField
        ref={imageRef}
        key={itemId}
        label="Replace image"
        defaultUrl={imageUrl}
        hint="Upload a new file, wait until you see “ready to save”, then click Save image."
        allowClear={false}
        showSaveHint
      />
      <button type="submit" className="w-fit rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
        Save image
      </button>
    </AdminSubmitForm>
  );
}

export function GalleryAdminClient({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [uploadingNew, setUploadingNew] = useState(false);
  const newImageRef = useRef<ImageUploadFieldHandle>(null);
  const t = useTranslations("admin.gallery");
  const tc = useTranslations("admin.common");

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Photos and details are saved separately — <span className="text-foreground">Save image</span> never
        changes titles, and <span className="text-foreground">Save text</span> never changes the photo.
      </p>

      <form
        action={(fd) => {
          if (newImageRef.current?.isUploading()) {
            feedback.error("Still uploading", "Wait for the image upload to finish, then click Add image.");
            return;
          }
          startTransition(async () => {
            const imageUrl = ensureUploadFieldInFormData(fd, newImageRef.current);
            const check = requireUsableUploadUrl(imageUrl);
            if (!check.ok) {
              feedback.error("Image required", check.error);
              return;
            }
            const ok = await feedback.run(() => upsertGalleryImage(fd), {
              successMessage: "Gallery image added",
            });
            if (ok) {
              newImageRef.current?.markSaved();
              router.refresh();
            }
          });
        }}
        encType="multipart/form-data"
        className="grid gap-3 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
        aria-busy={pending || uploadingNew}
      >
        <input name="title_en" placeholder={t("titlePlaceholder")} className="rounded-lg border border-border px-3 py-2" />
        <input name="location_tag" placeholder="Location tag (e.g. Bamyan)" className="rounded-lg border border-border px-3 py-2" />
        <div className="sm:col-span-2">
          <ImageUploadField
            ref={newImageRef}
            label={t("uploadImage")}
            hint="Upload JPEG, PNG, WebP, or GIF under 20 MB, wait for “ready to save”, then add the image."
            required
            showSaveHint={false}
            onUploadingChange={setUploadingNew}
          />
        </div>
        <input name="sort_order" type="number" placeholder={t("sortOrder")} defaultValue={0} className="rounded-lg border border-border px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked /> {tc("published")}
        </label>
        <button
          type="submit"
          disabled={uploadingNew}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {uploadingNew ? "Uploading image…" : t("addImage")}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No gallery images yet. Upload one above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <GalleryImageSaveForm itemId={item.id} imageUrl={item.image_url} onSaved={() => router.refresh()} />

              <form
                action={(fd) => {
                  startTransition(async () => {
                    const ok = await feedback.run(() => upsertGalleryImage(fd, item.id), {
                      successMessage: "Text saved",
                    });
                    if (ok) router.refresh();
                  });
                }}
                className="grid gap-2 border-t border-border pt-3"
              >
                <input
                  name="title_en"
                  defaultValue={item.title_en ?? ""}
                  placeholder={t("titlePlaceholder")}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <input
                  name="location_tag"
                  defaultValue={item.location_tag ?? ""}
                  placeholder="Location tag"
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={item.sort_order}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_published" defaultChecked={item.is_published} />{" "}
                  {tc("published")}
                </label>
                <button
                  type="submit"
                  className="w-fit rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Save text
                </button>
              </form>

              <div className="border-t border-border pt-3">
                <AdminDeleteButton
                  label={tc("delete")}
                  confirmTitle="Delete image?"
                  confirmMessage={tc("confirmDeleteImage")}
                  confirmLabel={tc("delete")}
                  successMessage="Image deleted"
                  action={deleteGalleryImage.bind(null, item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
