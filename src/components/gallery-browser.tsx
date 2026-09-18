"use client";

import { useMemo, useState } from "react";
import { GalleryMosaic, type GalleryMosaicItem } from "@/components/gallery-mosaic";
import { cn } from "@/lib/utils";

export function GalleryBrowser({
  items,
  allLabel,
}: {
  items: GalleryMosaicItem[];
  allLabel: string;
}) {
  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.location_tag?.trim()) set.add(item.location_tag.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const [active, setActive] = useState<string>("all");

  const filtered =
    active === "all" ? items : items.filter((item) => (item.location_tag ?? "").trim() === active);

  return (
    <div className="space-y-6">
      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={active === "all"} onClick={() => setActive("all")} label={allLabel} />
          {locations.map((loc) => (
            <FilterChip key={loc} active={active === loc} onClick={() => setActive(loc)} label={loc} />
          ))}
        </div>
      )}
      <GalleryMosaic items={filtered} />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images for this location yet.</p>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
