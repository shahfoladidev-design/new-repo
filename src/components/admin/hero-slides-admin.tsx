"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  createHeroSlide,
  updateHeroSlideText,
  deleteHeroSlide,
  updateHeroSlideImage,
} from "@/app/admin/actions/content";
import { ImageUploadField, type ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import { ensureUploadFieldInFormData, requireUsableUploadUrl } from "@/lib/admin/form-upload-url";
import { HERO_PREVIEW_FRAME_CLASS, HERO_UPLOAD_HINT } from "@/lib/hero-media";
import { isKnownCtaHref, normalizeCtaHref, SITE_CTA_ROUTES } from "@/lib/site-cta-routes";

export type HeroSlideAdminRow = {
  id: string;
  image_url: string;
  title_en: string;
  title_dari: string | null;
  title_pashto: string | null;
  subtitle_en: string | null;
  subtitle_dari: string | null;
  subtitle_pashto: string | null;
  cta_primary_label_en: string | null;
  cta_primary_href: string | null;
  cta_secondary_label_en: string | null;
  cta_secondary_href: string | null;
  sort_order: number;
  is_published: boolean;
};

const fieldClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
const labelClass = "grid gap-1 text-xs font-medium text-muted-foreground";

function CtaHrefSelect({
  name,
  defaultValue,
  fallback,
}: {
  name: string;
  defaultValue?: string | null;
  fallback: string;
}) {
  const current = normalizeCtaHref(defaultValue, fallback);
  const includeCurrent = !isKnownCtaHref(current);

  return (
    <select name={name} defaultValue={current} className={fieldClass}>
      {includeCurrent ? (
        <option value={current}>
          {current} (current)
        </option>
      ) : null}
      {SITE_CTA_ROUTES.map((route) => (
        <option key={route.href} value={route.href}>
          {route.label} ({route.href === "/" ? "/" : route.href})
        </option>
      ))}
    </select>
  );
}

function HeroSlideImageForm({
  slideId,
  imageUrl,
  onSaved,
}: {
  slideId: string;
  imageUrl: string;
  onSaved: () => void;
}) {
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<ImageUploadFieldHandle>(null);

  return (
    <form
      action={(fd) => {
        if (imageRef.current?.isUploading()) {
          feedback.error("Still uploading", "Wait for the image upload to finish, then click Save image.");
          return;
        }
        startTransition(async () => {
          const url = ensureUploadFieldInFormData(fd, imageRef.current);
          const check = requireUsableUploadUrl(url, "background image");
          if (!check.ok) {
            feedback.error("Image required", check.error);
            return;
          }
          const ok = await feedback.run(() => updateHeroSlideImage(slideId, fd), {
            successMessage: "Hero image saved",
          });
          if (ok) {
            imageRef.current?.markSaved();
            onSaved();
          }
        });
      }}
      encType="multipart/form-data"
      className="space-y-3"
      aria-busy={pending || uploading}
    >
      <ImageUploadField
        ref={imageRef}
        key={slideId}
        label="Background image"
        defaultUrl={imageUrl}
        hint={`${HERO_UPLOAD_HINT} Upload, wait for “ready to save”, then click Save image.`}
        allowClear={false}
        showSaveHint
        heroCrop
        onUploadingChange={setUploading}
        previewFrameClassName={HERO_PREVIEW_FRAME_CLASS}
        previewImageClassName="h-full w-full object-cover object-center"
      />
      <button
        type="submit"
        disabled={uploading}
        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Save image"}
      </button>
    </form>
  );
}

function HeroTextFields({
  item,
  sortDefault,
}: {
  item?: HeroSlideAdminRow;
  sortDefault: number;
}) {
  return (
    <>
      <label className={`${labelClass} sm:col-span-2`}>
        Title (EN)
        <input
          name="title_en"
          required
          defaultValue={item?.title_en}
          placeholder="e.g. Discover Bamyan"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Title (Dari)
        <input name="title_dari" defaultValue={item?.title_dari ?? ""} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Title (Pashto)
        <input name="title_pashto" defaultValue={item?.title_pashto ?? ""} className={fieldClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Subtitle (EN)
        <textarea
          name="subtitle_en"
          rows={2}
          defaultValue={item?.subtitle_en ?? ""}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Subtitle (Dari)
        <textarea name="subtitle_dari" rows={2} defaultValue={item?.subtitle_dari ?? ""} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Subtitle (Pashto)
        <textarea name="subtitle_pashto" rows={2} defaultValue={item?.subtitle_pashto ?? ""} className={fieldClass} />
      </label>

      <div className="grid gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 sm:col-span-2 sm:grid-cols-2">
        <p className="text-xs font-medium text-foreground sm:col-span-2">Buttons on the image</p>
        <label className={labelClass}>
          Primary label
          <input
            name="cta_primary_label_en"
            defaultValue={item?.cta_primary_label_en ?? "Start your adventure"}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Primary link
          <CtaHrefSelect
            name="cta_primary_href"
            defaultValue={item?.cta_primary_href}
            fallback="/packages"
          />
        </label>
        <label className={labelClass}>
          Secondary label
          <input
            name="cta_secondary_label_en"
            defaultValue={item?.cta_secondary_label_en ?? "Request a booking"}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Secondary link
          <CtaHrefSelect
            name="cta_secondary_href"
            defaultValue={item?.cta_secondary_href}
            fallback="/book"
          />
        </label>
      </div>

      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          type="number"
          defaultValue={item?.sort_order ?? sortDefault}
          className={fieldClass}
        />
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={item?.is_published ?? true} />
        Published
      </label>
    </>
  );
}

export function HeroSlidesAdminClient({ items }: { items: HeroSlideAdminRow[] }) {
  const router = useRouter();
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [uploadingNew, setUploadingNew] = useState(false);
  const newSlideImageRef = useRef<ImageUploadFieldHandle>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Each slide is one carousel frame. Upload image and text separately after the slide exists —{" "}
        <span className="text-foreground">Save image</span> never changes text, and{" "}
        <span className="text-foreground">Save text</span> never changes the image.
      </p>

      <form
        action={(fd) => {
          if (newSlideImageRef.current?.isUploading()) {
            feedback.error("Still uploading", "Wait for the image upload to finish, then click Add slide.");
            return;
          }
          startTransition(async () => {
            const imageUrl = ensureUploadFieldInFormData(fd, newSlideImageRef.current);
            const check = requireUsableUploadUrl(imageUrl, "background image");
            if (!check.ok) {
              feedback.error("Image required", check.error);
              return;
            }
            const ok = await feedback.run(() => createHeroSlide(fd), {
              successMessage: "Hero slide added",
            });
            if (ok) {
              newSlideImageRef.current?.markSaved();
              router.refresh();
            }
          });
        }}
        encType="multipart/form-data"
        className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"
        aria-busy={pending || uploadingNew}
      >
        <h2 className="text-base font-medium sm:col-span-2">Add slide</h2>
        <div className="sm:col-span-2">
          <ImageUploadField
            ref={newSlideImageRef}
            label="Background image"
            hint={HERO_UPLOAD_HINT}
            required
            showSaveHint={false}
            heroCrop
            onUploadingChange={setUploadingNew}
            previewFrameClassName={HERO_PREVIEW_FRAME_CLASS}
            previewImageClassName="h-full w-full object-cover object-center"
          />
        </div>
        <HeroTextFields sortDefault={items.length} />
        <button
          type="submit"
          disabled={uploadingNew}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {uploadingNew ? "Uploading…" : "Add slide"}
        </button>
      </form>

      <div className="space-y-5">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No slides yet. Add one above.
          </p>
        ) : (
          items.map((item) => (
            <section key={item.id} className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-medium">
                  #{item.sort_order} · {item.title_en}
                </h2>
                {!item.is_published ? (
                  <span className="text-xs text-amber-700">Draft (not on homepage)</span>
                ) : null}
              </div>

              <HeroSlideImageForm
                slideId={item.id}
                imageUrl={item.image_url}
                onSaved={() => router.refresh()}
              />

              <form
                action={(fd) => {
                  startTransition(async () => {
                    const ok = await feedback.run(() => updateHeroSlideText(item.id, fd), {
                      successMessage: "Hero text saved",
                    });
                    if (ok) router.refresh();
                  });
                }}
                className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2"
                aria-busy={pending}
              >
                <input type="hidden" name="id" value={item.id} />
                <HeroTextFields item={item} sortDefault={item.sort_order} />
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Save text
                  </button>
                  <AdminDeleteButton
                    label="Delete"
                    confirmTitle="Delete hero slide?"
                    confirmMessage="Delete this hero slide permanently? This cannot be undone."
                    successMessage="Hero slide deleted"
                    action={deleteHeroSlide.bind(null, item.id)}
                  />
                </div>
              </form>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
