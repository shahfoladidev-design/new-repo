"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode, type RefObject } from "react";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import type { ActionResult } from "@/lib/admin/action-result";
import { ensureUploadFieldInFormData, requireUsableUploadUrl } from "@/lib/admin/form-upload-url";
import type { ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { cn } from "@/lib/utils";

/**
 * Form wrapper that shows success/error toasts for admin saves.
 * Pass `imageRef` when the form includes an ImageUploadField so the uploaded URL
 * is reliably included in FormData (React can omit hidden fields on submit).
 */
export function AdminSubmitForm({
  action,
  successMessage = "Changes saved",
  className,
  encType,
  children,
  onSuccess,
  imageRef,
  imageFieldName = "image_url",
  requireImage = false,
  imageLabel = "image",
}: {
  action: (formData: FormData) => Promise<ActionResult | void>;
  successMessage?: string;
  className?: string;
  encType?: string;
  children: ReactNode;
  onSuccess?: () => void;
  imageRef?: RefObject<ImageUploadFieldHandle | null>;
  /** Hidden input name for the upload field (default `image_url`; logo uses `logo_url`). */
  imageFieldName?: string;
  requireImage?: boolean;
  imageLabel?: string;
}) {
  const feedback = useAdminFeedback();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={cn(className, pending && "pointer-events-none opacity-70")}
      encType={encType}
      aria-busy={pending}
      action={(fd) => {
        if (imageRef?.current?.isUploading()) {
          feedback.error("Still uploading", "Wait for the upload to finish, then save again.");
          return;
        }

        const url = ensureUploadFieldInFormData(fd, imageRef?.current ?? null, imageFieldName);

        if (requireImage) {
          const check = requireUsableUploadUrl(url, imageLabel);
          if (!check.ok) {
            feedback.error("Upload required", check.error);
            return;
          }
        }

        startTransition(async () => {
          const ok = await feedback.run(() => action(fd), { successMessage });
          if (ok) {
            imageRef?.current?.markSaved();
            router.refresh();
            onSuccess?.();
          }
        });
      }}
    >
      {children}
    </form>
  );
}
