"use client";

import { useState } from "react";
import { normalizeHexColor } from "@/lib/colors";
import { BRAND_COLORS } from "@/lib/brand";

/** Color picker + hex text so admin brand colors save/load reliably. */
export function ColorField({
  label,
  name,
  defaultValue,
  fallback = BRAND_COLORS.primary,
}: {
  label: string;
  name: string;
  defaultValue: string;
  fallback?: string;
}) {
  const initial = normalizeHexColor(defaultValue, fallback);
  const [value, setValue] = useState(initial);

  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizeHexColor(value, fallback)}
          onChange={(e) => setValue(normalizeHexColor(e.target.value, fallback))}
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
          aria-label={`${label} picker`}
        />
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (/^#[0-9a-fA-F]{0,6}$/.test(next)) setValue(next.toLowerCase());
          }}
          onBlur={() => setValue(normalizeHexColor(value, fallback))}
          pattern="^#[0-9a-fA-F]{6}$"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          spellCheck={false}
        />
        <span
          className="h-11 w-11 shrink-0 rounded-lg border border-border"
          style={{ backgroundColor: normalizeHexColor(value, fallback) }}
          aria-hidden
        />
      </div>
    </label>
  );
}
