"use client";

import { useTransition } from "react";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import type { ActionResult } from "@/lib/admin/action-result";

export function BookingNotesForm({
  bookingId,
  defaultNotes,
  action,
}: {
  bookingId: string;
  defaultNotes: string;
  action: (id: string, notes: string) => Promise<ActionResult | void>;
}) {
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          await feedback.run(() => action(bookingId, String(fd.get("notes") ?? "")), {
            successMessage: "Notes saved",
          });
        });
      }}
      className="rounded-2xl border border-border bg-card p-6"
      aria-busy={pending}
    >
      <label className="grid gap-2 text-sm">
        <span className="font-medium">Internal admin notes</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={defaultNotes}
          className="rounded-xl border border-border bg-background px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save notes"}
      </button>
    </form>
  );
}
