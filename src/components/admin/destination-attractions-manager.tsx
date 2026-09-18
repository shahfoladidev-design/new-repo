"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateAttractionImage } from "@/app/admin/actions/content";
import { ImageUploadField, type ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import { ensureUploadFieldInFormData, requireUsableUploadUrl } from "@/lib/admin/form-upload-url";

export type AttractionDraft = {
  id?: string;
  title_en: string;
  title_dari: string;
  title_pashto: string;
  summary_en: string;
  summary_dari: string;
  summary_pashto: string;
  image_url: string;
  sort_order: number;
};

function emptyAttraction(sort: number): AttractionDraft {
  return {
    title_en: "",
    title_dari: "",
    title_pashto: "",
    summary_en: "",
    summary_dari: "",
    summary_pashto: "",
    image_url: "",
    sort_order: sort,
  };
}

function AttractionImageForm({
  attractionId,
  imageUrl,
  onUrlChange,
  onSaved,
}: {
  attractionId: string;
  imageUrl: string;
  onUrlChange: (url: string) => void;
  onSaved: () => void;
}) {
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<ImageUploadFieldHandle>(null);

  const saveImage = () => {
    if (imageRef.current?.isUploading()) {
      feedback.error("Still uploading", "Wait for the image upload to finish, then click Save image.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      const url = ensureUploadFieldInFormData(fd, imageRef.current);
      // Empty URL is allowed — clears the highlight image and deletes the old storage file.
      if (url) {
        const check = requireUsableUploadUrl(url, "highlight image");
        if (!check.ok) {
          feedback.error("Image required", check.error);
          return;
        }
      } else {
        fd.set("image_url", "");
      }
      const ok = await feedback.run(() => updateAttractionImage(attractionId, fd), {
        successMessage: url ? "Highlight image saved" : "Highlight image removed",
      });
      if (ok) {
        imageRef.current?.markSaved();
        onUrlChange(url);
        onSaved();
      }
    });
  };

  return (
    <div className="space-y-2" aria-busy={pending || uploading}>
      <ImageUploadField
        ref={imageRef}
        key={attractionId}
        label="Highlight image"
        defaultUrl={imageUrl}
        hint="Upload, wait for “ready to save”, then Save image. Clear + Save image removes the photo."
        allowClear
        showSaveHint
        onUploadingChange={setUploading}
        onUrlChange={onUrlChange}
      />
      <button
        type="button"
        disabled={uploading || pending}
        onClick={saveImage}
        className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Save image"}
      </button>
    </div>
  );
}

export function DestinationAttractionsManager({
  initialAttractions = [],
}: {
  initialAttractions?: AttractionDraft[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<AttractionDraft[]>(initialAttractions);

  const update = (index: number, patch: Partial<AttractionDraft>) => {
    setItems((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Highlights / attractions</h3>
          <p className="text-xs text-muted-foreground">
            Existing highlights: use <span className="text-foreground">Save image</span> for photos, and the
            destination <span className="text-foreground">Save text</span> for titles. New highlights need a
            title first — save the destination, then upload the image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyAttraction(prev.length)])}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add highlight
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No highlights yet.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id ?? `new-${index}`}
            className="space-y-3 rounded-2xl border border-border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Highlight {index + 1}</p>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) =>
                    prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, sort_order: i })),
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
            <input
              value={item.title_en}
              onChange={(e) => update(index, { title_en: e.target.value })}
              placeholder="Title (EN)"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <input
                value={item.title_dari}
                onChange={(e) => update(index, { title_dari: e.target.value })}
                placeholder="Title (Dari)"
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                value={item.title_pashto}
                onChange={(e) => update(index, { title_pashto: e.target.value })}
                placeholder="Title (Pashto)"
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <textarea
              value={item.summary_en}
              onChange={(e) => update(index, { summary_en: e.target.value })}
              placeholder="Summary (EN)"
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />

            {item.id ? (
              <AttractionImageForm
                attractionId={item.id}
                imageUrl={item.image_url}
                onUrlChange={(url) => update(index, { image_url: url })}
                onSaved={() => router.refresh()}
              />
            ) : (
              <ImageUploadField
                label="Highlight image (optional)"
                name={`attraction_image_url_new_${index}`}
                defaultUrl={item.image_url}
                hint="Optional for new highlights. Stored when you click Save text on the destination."
                allowClear
                showSaveHint={false}
                onUrlChange={(url) => update(index, { image_url: url })}
              />
            )}
          </div>
        ))}
      </div>

      <input type="hidden" name="destination_attractions_json" value={JSON.stringify(items)} />
    </div>
  );
}
