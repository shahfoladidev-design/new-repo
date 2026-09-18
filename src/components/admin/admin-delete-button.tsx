"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import type { ActionResult } from "@/lib/admin/action-result";

export function AdminDeleteButton({
  label = "Delete",
  confirmTitle = "Delete item?",
  confirmMessage = "Delete this item permanently? This cannot be undone.",
  confirmLabel = "Delete",
  successMessage = "Deleted",
  redirectTo,
  action,
}: {
  label?: string;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmLabel?: string;
  successMessage?: string;
  redirectTo?: string;
  action: () => Promise<ActionResult | void>;
}) {
  const router = useRouter();
  const feedback = useAdminFeedback();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (pending) return;

        const confirmed = await feedback.confirm({
          title: confirmTitle,
          message: confirmMessage,
          confirmLabel,
          cancelLabel: "Cancel",
          danger: true,
        });
        if (!confirmed) return;

        setPending(true);
        try {
          const ok = await feedback.run(action, {
            successMessage,
            errorMessage: "Could not delete",
          });
          if (!ok) return;
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        } finally {
          setPending(false);
        }
      }}
      className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Working…" : label}
    </button>
  );
}
