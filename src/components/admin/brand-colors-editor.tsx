"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BRAND_COLORS } from "@/lib/brand";
import { normalizeHexColor } from "@/lib/colors";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import { resetBrandColors } from "@/app/admin/actions/settings";

function ColorRow({
  label,
  name,
  value,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  const hex = normalizeHexColor(value, BRAND_COLORS.primary);

  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(normalizeHexColor(e.target.value, hex))}
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
          aria-label={`${label} picker`}
        />
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (/^#[0-9a-fA-F]{0,6}$/.test(next)) onChange(next.toLowerCase());
          }}
          onBlur={() => onChange(normalizeHexColor(value, hex))}
          pattern="^#[0-9a-fA-F]{6}$"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          spellCheck={false}
        />
        <span
          className="h-11 w-11 shrink-0 rounded-lg border border-border"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
      </div>
    </label>
  );
}

export function BrandColorsEditor({
  primary,
  secondary,
  accent,
  labels,
}: {
  primary: string;
  secondary: string;
  accent: string;
  labels: {
    primary: string;
    secondary: string;
    accent: string;
    restore: string;
    restoreNow: string;
  };
}) {
  return (
    <BrandColorsEditorForm
      key={`${primary}|${secondary}|${accent}`}
      primary={primary}
      secondary={secondary}
      accent={accent}
      labels={labels}
    />
  );
}

function BrandColorsEditorForm({
  primary,
  secondary,
  accent,
  labels,
}: {
  primary: string;
  secondary: string;
  accent: string;
  labels: {
    primary: string;
    secondary: string;
    accent: string;
    restore: string;
    restoreNow: string;
  };
}) {
  const router = useRouter();
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [primaryValue, setPrimaryValue] = useState(normalizeHexColor(primary, BRAND_COLORS.primary));
  const [secondaryValue, setSecondaryValue] = useState(
    normalizeHexColor(secondary, BRAND_COLORS.secondary),
  );
  const [accentValue, setAccentValue] = useState(normalizeHexColor(accent, BRAND_COLORS.accent));

  const restoreFields = () => {
    setPrimaryValue(BRAND_COLORS.primary);
    setSecondaryValue(BRAND_COLORS.secondary);
    setAccentValue(BRAND_COLORS.accent);
    feedback.info("Default colors loaded", "Click Save settings to apply, or Restore & apply now.");
  };

  const restoreAndApply = () => {
    startTransition(async () => {
      const confirmed = await feedback.confirm({
        title: "Restore default colors?",
        message: `This resets primary, secondary, and accent to ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary}, and ${BRAND_COLORS.accent}, then saves immediately.`,
        confirmLabel: "Restore & apply",
        cancelLabel: "Cancel",
      });
      if (!confirmed) return;

      setPrimaryValue(BRAND_COLORS.primary);
      setSecondaryValue(BRAND_COLORS.secondary);
      setAccentValue(BRAND_COLORS.accent);

      const ok = await feedback.run(() => resetBrandColors(), {
        successMessage: "Default colors restored",
      });
      if (ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <ColorRow
        label={labels.primary}
        name="primary_color"
        value={primaryValue}
        onChange={setPrimaryValue}
        hint="Buttons, links, and main CTAs"
      />
      <ColorRow
        label={labels.secondary}
        name="secondary_color"
        value={secondaryValue}
        onChange={setSecondaryValue}
        hint="Prices, badges, icons, and supporting accents"
      />
      <ColorRow
        label={labels.accent}
        name="accent_color"
        value={accentValue}
        onChange={setAccentValue}
        hint="Header tint and soft muted surfaces"
      />

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span
          className="inline-flex rounded-full px-4 py-2 text-xs font-medium text-white"
          style={{ backgroundColor: primaryValue }}
        >
          Primary
        </span>
        <span
          className="inline-flex rounded-full px-4 py-2 text-xs font-medium text-white"
          style={{ backgroundColor: secondaryValue }}
        >
          Secondary
        </span>
        <span
          className="inline-flex rounded-full border border-black/10 px-4 py-2 text-xs font-medium"
          style={{ backgroundColor: accentValue, color: "#333" }}
        >
          Accent
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={restoreFields}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {labels.restore}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={restoreAndApply}
          className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 disabled:opacity-60"
        >
          {pending ? "Restoring…" : labels.restoreNow}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Defaults: primary {BRAND_COLORS.primary}, secondary {BRAND_COLORS.secondary}, accent{" "}
        {BRAND_COLORS.accent}.
      </p>
    </div>
  );
}
