"use client";

import { useRef } from "react";
import { updateSiteLogo, clearSiteLogo } from "@/app/admin/actions/settings";
import { ImageUploadField, type ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { LOGO_FRAME } from "@/lib/brand";

export function SiteLogoUploadForm({
  defaultUrl,
  uploadLabel,
  hint,
}: {
  defaultUrl: string;
  uploadLabel: string;
  hint: string;
}) {
  const imageRef = useRef<ImageUploadFieldHandle>(null);

  return (
    <AdminSubmitForm
      action={updateSiteLogo}
      successMessage="Logo saved"
      encType="multipart/form-data"
      className="grid gap-4"
      imageRef={imageRef}
      imageFieldName="logo_url"
    >
      <ImageUploadField
        key={defaultUrl || "no-logo"}
        ref={imageRef}
        label={uploadLabel}
        name="logo_url"
        defaultUrl={defaultUrl}
        bucket="brand"
        previewFit="contain"
        previewFrameClassName={LOGO_FRAME.className}
        previewImageClassName={LOGO_FRAME.imageClassName}
        hint={hint}
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
          Save logo
        </button>
        {defaultUrl ? (
          <AdminDeleteButton
            label="Remove logo"
            confirmTitle="Remove logo?"
            confirmMessage="Remove the site logo from the header? The header will show empty until you upload a new logo."
            confirmLabel="Remove logo"
            successMessage="Logo removed"
            action={clearSiteLogo}
          />
        ) : null}
      </div>
    </AdminSubmitForm>
  );
}
