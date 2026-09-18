"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { BOOKING_STATUSES } from "@/lib/booking-offers";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import type { ActionResult } from "@/lib/admin/action-result";

export function BookingStatusForm({
  bookingId,
  currentStatus,
  action,
}: {
  bookingId: string;
  currentStatus: string;
  action: (id: string, status: string) => Promise<ActionResult | void>;
}) {
  const t = useTranslations("admin.bookings");
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm font-medium">{t("status")}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t("statusHint")}</p>
      <form
        action={(fd) => {
          startTransition(async () => {
            const status = fd.get("status") as string;
            await feedback.run(() => action(bookingId, status), {
              successMessage: "Status updated",
            });
          });
        }}
        className="mt-3 flex flex-wrap items-center gap-3"
        aria-busy={pending}
      >
        <select
          name="status"
          defaultValue={currentStatus}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`statuses.${s}`)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : t("updateStatus")}
        </button>
      </form>
    </div>
  );
}
