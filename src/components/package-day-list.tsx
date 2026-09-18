"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type PackageDayEntry = {
  dayNumber: number;
  title: string;
  body: string;
  overnight?: string | null;
};

/**
 * Itinerary days, collapsed by default with the same +/- reveal used in the header nav.
 * The body stays in the DOM and is hidden with CSS rather than unmounted, so search
 * engines still index the full itinerary.
 */
export function PackageDayList({
  days,
  dayLabel,
  overnightLabel,
}: {
  days: PackageDayEntry[];
  dayLabel: string;
  overnightLabel: string;
}) {
  const t = useTranslations();
  const [openDays, setOpenDays] = useState<number[]>([]);

  const toggle = (dayNumber: number) =>
    setOpenDays((current) =>
      current.includes(dayNumber) ? current.filter((n) => n !== dayNumber) : [...current, dayNumber],
    );

  return (
    <div className="mt-6 space-y-4">
      {days.map((day) => {
        const open = openDays.includes(day.dayNumber);
        const panelId = `package-day-${day.dayNumber}`;

        return (
          <article
            key={day.dayNumber}
            className={cn("nav-package rounded-2xl border border-border bg-card p-5", open && "nav-package--open")}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">
                {dayLabel} {day.dayNumber}: {day.title}
              </h3>
              <button
                type="button"
                onClick={() => toggle(day.dayNumber)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={open ? t("packageDetail.hideDayDetails") : t("packageDetail.showDayDetails")}
                title={open ? t("packageDetail.hideDayDetails") : t("packageDetail.showDayDetails")}
                className="nav-package__toggle mt-0.5"
              >
                {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div id={panelId} hidden={!open}>
              {day.overnight ? (
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {overnightLabel}: {day.overnight}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{day.body}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
