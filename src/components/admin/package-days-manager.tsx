"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type PackageDayDraft = {
  day_number: number;
  title_en: string;
  title_dari: string;
  title_pashto: string;
  body_en: string;
  body_dari: string;
  body_pashto: string;
  overnight_location: string;
  sort_order: number;
};

function emptyDay(n: number): PackageDayDraft {
  return {
    day_number: n,
    title_en: "",
    title_dari: "",
    title_pashto: "",
    body_en: "",
    body_dari: "",
    body_pashto: "",
    overnight_location: "",
    sort_order: n,
  };
}

export function PackageDaysManager({ initialDays = [] }: { initialDays?: PackageDayDraft[] }) {
  const [days, setDays] = useState<PackageDayDraft[]>(
    initialDays.length
      ? initialDays
      : [],
  );

  const update = (index: number, patch: Partial<PackageDayDraft>) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const addDay = () => {
    setDays((prev) => [...prev, emptyDay(prev.length + 1)]);
  };

  const removeDay = (index: number) => {
    setDays((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((d, i) => ({ ...d, day_number: i + 1, sort_order: i + 1 })),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Day-by-day itinerary</h3>
          <p className="text-xs text-muted-foreground">
            Add each day of the package. Dari/Pashto can start from the English text and be replaced with real translations later.
          </p>
        </div>
        <button
          type="button"
          onClick={addDay}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add day
        </button>
      </div>

      {days.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No days yet. Click “Add day” to build the itinerary.
        </p>
      )}

      <div className="space-y-4">
        {days.map((day, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Day {day.day_number}</p>
              <button
                type="button"
                onClick={() => removeDay(index)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
            <input
              value={day.title_en}
              onChange={(e) => update(index, { title_en: e.target.value })}
              placeholder="Title (EN)"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <input
                value={day.title_dari || day.title_en}
                onChange={(e) => update(index, { title_dari: e.target.value })}
                placeholder={day.title_en || "Title (Dari) — uses English if blank"}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                value={day.title_pashto || day.title_en}
                onChange={(e) => update(index, { title_pashto: e.target.value })}
                placeholder={day.title_en || "Title (Pashto) — uses English if blank"}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <textarea
              value={day.body_en}
              onChange={(e) => update(index, { body_en: e.target.value })}
              placeholder="Description (EN)"
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <textarea
                value={day.body_dari || day.body_en}
                onChange={(e) => update(index, { body_dari: e.target.value })}
                placeholder={day.body_en || "Description (Dari) — uses English if blank"}
                rows={2}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <textarea
                value={day.body_pashto || day.body_en}
                onChange={(e) => update(index, { body_pashto: e.target.value })}
                placeholder={day.body_en || "Description (Pashto) — uses English if blank"}
                rows={2}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <input
              value={day.overnight_location}
              onChange={(e) => update(index, { overnight_location: e.target.value })}
              placeholder="Overnight location"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <input type="hidden" name="package_days_json" value={JSON.stringify(days)} />
    </div>
  );
}
