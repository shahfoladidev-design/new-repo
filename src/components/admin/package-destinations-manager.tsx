"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type DestOption = {
  id: string;
  slug: string;
  title_en: string;
};

type Entry = {
  destination_id: string;
  dest_title: string;
  dest_slug: string;
  days: number | null;
  sort_order: number;
  /** Package-specific photo for this province — falls back to the destination's own image. */
  image_url?: string | null;
};

export function PackageDestinationsManager({
  initialEntries,
  allDestinations,
}: {
  initialEntries: Entry[];
  allDestinations: DestOption[];
}) {
  const t = useTranslations("admin.content");
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [selectedDest, setSelectedDest] = useState("");

  const addedIds = new Set(entries.map((e) => e.destination_id));
  const available = allDestinations.filter((d) => !addedIds.has(d.id));

  const addEntry = () => {
    if (!selectedDest) return;
    const dest = allDestinations.find((d) => d.id === selectedDest);
    if (!dest) return;
    setEntries((prev) => [
      ...prev,
      {
        destination_id: dest.id,
        dest_title: dest.title_en,
        dest_slug: dest.slug,
        days: null,
        sort_order: prev.length,
        image_url: "",
      },
    ]);
    setSelectedDest("");
  };

  const updateImage = (destId: string, url: string) => {
    setEntries((prev) => prev.map((e) => (e.destination_id === destId ? { ...e, image_url: url } : e)));
  };

  const removeEntry = (destId: string) => {
    setEntries((prev) => prev.filter((e) => e.destination_id !== destId));
  };

  const updateEntry = (destId: string, field: "days" | "sort_order", value: number | null) => {
    setEntries((prev) =>
      prev.map((e) => (e.destination_id === destId ? { ...e, [field]: value } : e)),
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{t("packageDestinations")}</h3>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.destination_id}
              className="space-y-3 rounded-lg border border-border bg-background p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex-1 text-sm font-medium">
                  {entry.dest_title}
                  <span className="ms-2 text-xs text-muted-foreground">/{entry.dest_slug}</span>
                </span>
                <label className="flex items-center gap-1 text-xs">
                  {t("days")}
                  <input
                    type="number"
                    min={0}
                    value={entry.days ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.destination_id, "days", e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                </label>
                <label className="flex items-center gap-1 text-xs">
                  #
                  <input
                    type="number"
                    min={0}
                    value={entry.sort_order}
                    onChange={(e) => updateEntry(entry.destination_id, "sort_order", Number(e.target.value))}
                    className="w-14 rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.destination_id)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ImageUploadField
                key={`img-${entry.destination_id}`}
                name={`package_destination_image_${entry.destination_id}`}
                label={t("provinceImage")}
                hint={t("provinceImageHint")}
                defaultUrl={entry.image_url ?? ""}
                showSaveHint={false}
                onUrlChange={(url) => updateImage(entry.destination_id, url)}
              />
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noPackageDestinations")}</p>
      )}

      {available.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedDest}
            onChange={(e) => setSelectedDest(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title_en}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addEntry}
            disabled={!selectedDest}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {t("addDestination")}
          </button>
        </div>
      )}

      <input type="hidden" name="package_destinations_json" value={JSON.stringify(entries)} />
    </div>
  );
}
