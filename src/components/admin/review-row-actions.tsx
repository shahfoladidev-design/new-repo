"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteReview, setReviewPublished } from "@/app/admin/actions/reviews";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { useAdminFeedback } from "@/components/admin/admin-feedback";

export function ReviewRowActions({
  id,
  isPublished,
  publishLabel,
  unpublishLabel,
  deleteLabel,
  redirectToAfterDelete,
}: {
  id: string;
  isPublished: boolean;
  publishLabel: string;
  unpublishLabel: string;
  deleteLabel: string;
  redirectToAfterDelete?: string;
}) {
  const router = useRouter();
  const feedback = useAdminFeedback();
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted disabled:opacity-60"
        onClick={async () => {
          setPending(true);
          try {
            const ok = await feedback.run(() => setReviewPublished(id, !isPublished), {
              successMessage: isPublished ? "Review unpublished" : "Review published",
            });
            if (ok) router.refresh();
          } finally {
            setPending(false);
          }
        }}
      >
        {isPublished ? unpublishLabel : publishLabel}
      </button>
      <AdminDeleteButton
        label={deleteLabel}
        confirmTitle="Delete review?"
        confirmMessage="Delete this review permanently? This cannot be undone."
        confirmLabel={deleteLabel}
        successMessage="Review deleted"
        redirectTo={redirectToAfterDelete}
        action={deleteReview.bind(null, id)}
      />
    </div>
  );
}
