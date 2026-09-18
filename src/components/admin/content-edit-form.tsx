"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition, type ReactNode } from "react";
import type { ContentTable } from "@/app/admin/actions/content";
import { updateContentImage } from "@/app/admin/actions/content";
import { AFGHAN_PROVINCES } from "@/lib/provinces";
import { ImageUploadField, type ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { SERVICE_ICON_OPTIONS } from "@/lib/service-icons";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import type { ActionResult } from "@/lib/admin/action-result";
import { withEnglishDefault } from "@/lib/admin/translation-defaults";
import { ensureUploadFieldInFormData, requireUsableUploadUrl } from "@/lib/admin/form-upload-url";
import { DEFAULT_PACKAGE_TYPE, PACKAGE_TYPES, normalizePackageType, type PackageType } from "@/lib/package-types";

const TRANSLATION_HINT =
  "Optional. Pre-filled from English when empty — replace with a real Dari/Pashto translation when ready. If left blank, the public site shows English.";

type Props = {
  table: ContentTable;
  adminPath: string;
  item: Record<string, unknown> | null;
  nameField?: boolean;
  extraFields?: string[];
  /** Which type a brand-new package starts as, set by the admin section you came from. */
  defaultPackageType?: PackageType;
  upsertAction: (table: ContentTable, fd: FormData, id?: string) => Promise<ActionResult | void>;
  deleteAction: (table: ContentTable, id: string) => Promise<ActionResult | void>;
  children?: ReactNode;
};

export function ContentEditForm({
  table,
  adminPath,
  item,
  nameField,
  extraFields = [],
  defaultPackageType = DEFAULT_PACKAGE_TYPE,
  upsertAction,
  deleteAction,
  children,
}: Props) {
  const router = useRouter();
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const coverImageRef = useRef<ImageUploadFieldHandle>(null);
  const newItemImageRef = useRef<ImageUploadFieldHandle>(null);
  const t = useTranslations("admin.content");
  const tc = useTranslations("admin.common");
  const id = item?.id as string | undefined;
  const travelStyle =
    item?.travel_style && typeof item.travel_style === "object"
      ? (item.travel_style as Record<string, string>)
      : {};

  const en = (key: string) => String(item?.[key] ?? "");
  const tr = (translatedKey: string, englishKey: string) =>
    withEnglishDefault(String(item?.[translatedKey] ?? ""), String(item?.[englishKey] ?? ""));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{id ? tc("edit") : tc("new")}</h1>
        <Link href={adminPath} className="text-sm underline">
          {tc("back")}
        </Link>
      </div>

      <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        {TRANSLATION_HINT}
      </p>

      {id && table !== "faqs" ? (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <div>
            <h2 className="font-medium">Cover image</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-foreground">Save image</span> only updates the photo.{" "}
              <span className="text-foreground">Save text</span> below never changes it.
            </p>
          </div>
          <AdminSubmitForm
            action={updateContentImage.bind(null, table, id)}
            successMessage="Image saved"
            encType="multipart/form-data"
            className="grid gap-4"
            imageRef={coverImageRef}
            onSuccess={() => router.refresh()}
          >
            <ImageUploadField
              ref={coverImageRef}
              key={id}
              label={t("image")}
              defaultUrl={String(item?.image_url ?? "")}
              hint="Upload JPEG, PNG, WebP, or GIF under 20 MB, wait for “ready to save”, then click Save image."
              showSaveHint
            />
            <button type="submit" className="w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
              Save image
            </button>
          </AdminSubmitForm>
        </section>
      ) : null}

      <form
        action={(fd) => {
          if (!id && table !== "faqs" && newItemImageRef.current?.isUploading()) {
            feedback.error("Still uploading", "Wait for the cover image upload to finish, then save.");
            return;
          }
          startTransition(async () => {
            if (!id && table !== "faqs") {
              const imageUrl = ensureUploadFieldInFormData(fd, newItemImageRef.current);
              const check = requireUsableUploadUrl(imageUrl, "cover image");
              if (!check.ok) {
                feedback.error("Cover image required", check.error);
                return;
              }
            }
            const ok = await feedback.run(() => upsertAction(table, fd, id), {
              successMessage: id ? "Text saved" : "Created successfully",
            });
            if (!ok) return;
            if (!id && table !== "faqs") newItemImageRef.current?.markSaved();
            router.push(adminPath);
            router.refresh();
          });
        }}
        encType="multipart/form-data"
        className="space-y-6"
        aria-busy={pending || uploadingNewImage}
      >

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6">
        {nameField ? (
          table === "team_members" ? (
            <>
              <Field label="Name" name="name" defaultValue={String(item?.name ?? "")} required />
              <Field label="Role (EN)" name="role_en" defaultValue={en("role_en")} />
              <Field label="Role (Dari)" name="role_dari" defaultValue={tr("role_dari", "role_en")} hint={TRANSLATION_HINT} placeholder={en("role_en")} />
              <Field label="Role (Pashto)" name="role_pashto" defaultValue={tr("role_pashto", "role_en")} hint={TRANSLATION_HINT} placeholder={en("role_en")} />
              <TextArea label={t("bioEn")} name="bio_en" defaultValue={en("bio_en")} />
              <TextArea label="Bio (Dari)" name="bio_dari" defaultValue={tr("bio_dari", "bio_en")} hint={TRANSLATION_HINT} placeholder={en("bio_en")} />
              <TextArea label="Bio (Pashto)" name="bio_pashto" defaultValue={tr("bio_pashto", "bio_en")} hint={TRANSLATION_HINT} placeholder={en("bio_en")} />
              <Field label="Sort order" name="sort_order" type="number" defaultValue={String(item?.sort_order ?? 0)} />
            </>
          ) : (
            <>
              <Field label={t("nameEn")} name="name_en" defaultValue={en("name_en")} required />
              <Field label={t("nameDari")} name="name_dari" defaultValue={tr("name_dari", "name_en")} hint={TRANSLATION_HINT} placeholder={en("name_en")} />
              <Field label={t("namePashto")} name="name_pashto" defaultValue={tr("name_pashto", "name_en")} hint={TRANSLATION_HINT} placeholder={en("name_en")} />
              <TextArea label={t("bioEn")} name="bio_en" defaultValue={en("bio_en")} />
              <Field label={t("languages")} name="languages" defaultValue={String(item?.languages ?? "")} />
            </>
          )
        ) : extraFields.includes("faq") ? (
          <>
            <Field label="Category" name="category" defaultValue={String(item?.category ?? "general")} />
            <TextArea label="Question (EN)" name="question_en" defaultValue={en("question_en")} required />
            <TextArea label="Answer (EN)" name="answer_en" defaultValue={en("answer_en")} required />
            <TextArea label="Question (Dari)" name="question_dari" defaultValue={tr("question_dari", "question_en")} hint={TRANSLATION_HINT} placeholder={en("question_en")} />
            <TextArea label="Answer (Dari)" name="answer_dari" defaultValue={tr("answer_dari", "answer_en")} hint={TRANSLATION_HINT} placeholder={en("answer_en")} />
            <TextArea label="Question (Pashto)" name="question_pashto" defaultValue={tr("question_pashto", "question_en")} hint={TRANSLATION_HINT} placeholder={en("question_en")} />
            <TextArea label="Answer (Pashto)" name="answer_pashto" defaultValue={tr("answer_pashto", "answer_en")} hint={TRANSLATION_HINT} placeholder={en("answer_en")} />
            <Field label="Sort order" name="sort_order" type="number" defaultValue={String(item?.sort_order ?? 0)} />
          </>
        ) : (
          <>
            {table !== "faqs" && (
              <Field label={t("slug")} name="slug" defaultValue={String(item?.slug ?? "")} />
            )}
            <Field label={t("titleEn")} name="title_en" defaultValue={en("title_en")} required />
            <Field label={t("titleDari")} name="title_dari" defaultValue={tr("title_dari", "title_en")} hint={TRANSLATION_HINT} placeholder={en("title_en")} />
            <Field label={t("titlePashto")} name="title_pashto" defaultValue={tr("title_pashto", "title_en")} hint={TRANSLATION_HINT} placeholder={en("title_en")} />
            <TextArea label={t("summaryEn")} name="summary_en" defaultValue={en("summary_en")} />
            <TextArea label={t("summaryDari")} name="summary_dari" defaultValue={tr("summary_dari", "summary_en")} hint={TRANSLATION_HINT} placeholder={en("summary_en")} />
            <TextArea label={t("summaryPashto")} name="summary_pashto" defaultValue={tr("summary_pashto", "summary_en")} hint={TRANSLATION_HINT} placeholder={en("summary_en")} />
            <TextArea label={t("descriptionEn")} name="description_en" defaultValue={en("description_en")} />
            <TextArea label={t("descriptionDari")} name="description_dari" defaultValue={tr("description_dari", "description_en")} hint={TRANSLATION_HINT} placeholder={en("description_en")} />
            <TextArea label={t("descriptionPashto")} name="description_pashto" defaultValue={tr("description_pashto", "description_en")} hint={TRANSLATION_HINT} placeholder={en("description_en")} />
          </>
        )}

        {extraFields.includes("price") && (
          <>
            <Field
              label={table === "packages" ? "Standard price (USD)" : t("catalogPrice")}
              name="price_from"
              type="number"
              defaultValue={String(item?.price_from ?? "")}
            />
            <input type="hidden" name="price_currency" value="USD" />
            {table === "packages" ? (
              <Field
                label="VIP price (USD, optional)"
                name="vip_price"
                type="number"
                defaultValue={String(item?.vip_price ?? "")}
              />
            ) : null}
            {extraFields.includes("durationDays") || table === "packages" ? (
              <Field label={t("durationDays")} name="duration_days" type="number" defaultValue={String(item?.duration_days ?? "")} />
            ) : null}
          </>
        )}

        {extraFields.includes("packageExtra") && (
          <>
            <label className="grid gap-1 text-sm">
              <span>{t("packageType")}</span>
              <select
                name="package_type"
                defaultValue={item ? normalizePackageType(item.package_type) : defaultPackageType}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                {PACKAGE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(`packageTypeOption.${value}`)}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">{t("packageTypeHint")}</span>
            </label>
            <Field label="Route label" name="route_label" defaultValue={String(item?.route_label ?? "")} />
            <TextArea label="Audience (EN)" name="audience_en" defaultValue={en("audience_en")} />
            <TextArea label="Audience (Dari)" name="audience_dari" defaultValue={tr("audience_dari", "audience_en")} hint={TRANSLATION_HINT} placeholder={en("audience_en")} />
            <TextArea label="Audience (Pashto)" name="audience_pashto" defaultValue={tr("audience_pashto", "audience_en")} hint={TRANSLATION_HINT} placeholder={en("audience_en")} />
            <TextArea label="Important notes (EN)" name="important_notes_en" defaultValue={en("important_notes_en")} />
            <TextArea label="Important notes (Dari)" name="important_notes_dari" defaultValue={tr("important_notes_dari", "important_notes_en")} hint={TRANSLATION_HINT} placeholder={en("important_notes_en")} />
            <TextArea label="Important notes (Pashto)" name="important_notes_pashto" defaultValue={tr("important_notes_pashto", "important_notes_en")} hint={TRANSLATION_HINT} placeholder={en("important_notes_en")} />
            <TextArea
              label="Standard includes (one per line)"
              name="standard_includes_text"
              defaultValue={
                Array.isArray(item?.standard_includes)
                  ? (item?.standard_includes as string[]).join("\n")
                  : Array.isArray(item?.includes)
                    ? (item?.includes as string[]).join("\n")
                    : ""
              }
            />
            <TextArea
              label="VIP includes (one per line)"
              name="vip_includes_text"
              defaultValue={Array.isArray(item?.vip_includes) ? (item?.vip_includes as string[]).join("\n") : ""}
            />
            <TextArea
              label="Excludes (one per line)"
              name="excludes_text"
              defaultValue={Array.isArray(item?.excludes) ? (item?.excludes as string[]).join("\n") : ""}
            />
            <div className="grid gap-3 rounded-xl border border-border p-4">
              <p className="text-sm font-medium">Travel style</p>
              <Field label="Type" name="travel_style_type" defaultValue={String(travelStyle.type ?? "")} />
              <Field label="Pace" name="travel_style_pace" defaultValue={String(travelStyle.pace ?? "")} />
              <Field label="Accommodation" name="travel_style_accommodation" defaultValue={String(travelStyle.accommodation ?? "")} />
              <Field label="Transport" name="travel_style_transport" defaultValue={String(travelStyle.transport ?? "")} />
            </div>
          </>
        )}

        {extraFields.includes("departure") && (
          <>
            <Field label="Start date" name="start_date" type="date" defaultValue={String(item?.start_date ?? "")} />
            <Field label="End date" name="end_date" type="date" defaultValue={String(item?.end_date ?? "")} />
            <Field label="Nights" name="nights" type="number" defaultValue={String(item?.nights ?? "")} />
            <Field label="Days" name="days" type="number" defaultValue={String(item?.days ?? "")} />
            <Field label="Badge" name="badge" defaultValue={String(item?.badge ?? "")} />
            <Field
              label="Reference ID (e.g. UPC-001)"
              name="reference_code"
              defaultValue={String(item?.reference_code ?? "")}
            />
            <Field label="Sort order" name="sort_order" type="number" defaultValue={String(item?.sort_order ?? 0)} />
          </>
        )}

        {extraFields.includes("province") && (
          <label className="grid gap-1 text-sm">
            <span>{t("province")}</span>
            <select
              name="province_slug"
              defaultValue={String(item?.province_slug ?? "")}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <option value="">—</option>
              {AFGHAN_PROVINCES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {extraFields.includes("location") && (
          <>
            <Field label={t("locationEn")} name="location_en" defaultValue={String(item?.location_en ?? "")} />
            <Field label={t("latitude")} name="latitude" type="number" defaultValue={String(item?.latitude ?? "")} />
            <Field label={t("longitude")} name="longitude" type="number" defaultValue={String(item?.longitude ?? "")} />
          </>
        )}

        {extraFields.includes("excerpt") && (
          <>
            <TextArea label={t("excerptEn")} name="excerpt_en" defaultValue={en("excerpt_en")} />
            <TextArea label="Excerpt (Dari)" name="excerpt_dari" defaultValue={tr("excerpt_dari", "excerpt_en")} hint={TRANSLATION_HINT} placeholder={en("excerpt_en")} />
            <TextArea label="Excerpt (Pashto)" name="excerpt_pashto" defaultValue={tr("excerpt_pashto", "excerpt_en")} hint={TRANSLATION_HINT} placeholder={en("excerpt_en")} />
          </>
        )}
        {extraFields.includes("content") && (
          <>
            <TextArea label={t("contentEn")} name="content_en" defaultValue={en("content_en")} rows={8} />
            <TextArea label="Content (Dari)" name="content_dari" defaultValue={tr("content_dari", "content_en")} rows={8} hint={TRANSLATION_HINT} placeholder={en("content_en")} />
            <TextArea label="Content (Pashto)" name="content_pashto" defaultValue={tr("content_pashto", "content_en")} rows={8} hint={TRANSLATION_HINT} placeholder={en("content_en")} />
          </>
        )}

        {table === "services" && (
          <>
            <Field label="Reference ID (e.g. SVC-001)" name="reference_code" defaultValue={String(item?.reference_code ?? "")} />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Service icon</span>
              <select
                name="icon_key"
                defaultValue={String(item?.icon_key ?? "compass")}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                {SERVICE_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Sort order" name="sort_order" type="number" defaultValue={String(item?.sort_order ?? 0)} />
          </>
        )}

        {table === "packages" && (
          <Field
            label="Reference ID (e.g. PKG-001)"
            name="reference_code"
            defaultValue={String(item?.reference_code ?? "")}
          />
        )}

        {!id && table !== "faqs" && (
          <ImageUploadField
            ref={newItemImageRef}
            label={t("image")}
            defaultUrl={String(item?.image_url ?? "")}
            hint="Upload an image from your computer (JPEG, PNG, WebP, or GIF), wait for “ready to save”, then save the new item."
            showSaveHint={false}
            required
            onUploadingChange={setUploadingNewImage}
          />
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={Boolean(item?.is_published ?? true)} />
          {tc("published")}
        </label>
      </div>

      {children}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || uploadingNewImage}
          className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          {uploadingNewImage ? "Uploading image…" : pending ? "Saving…" : id ? "Save text" : tc("save")}
        </button>
        {id && (
          <AdminDeleteButton
            label={tc("delete")}
            confirmTitle="Delete this item?"
            confirmMessage={tc("confirmDelete")}
            confirmLabel={tc("delete")}
            successMessage="Deleted"
            redirectTo={adminPath}
            action={() => deleteAction(table, id)}
          />
        )}
      </div>
    </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      {hint ? <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span> : null}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder || undefined}
        className="rounded-lg border border-border bg-background px-3 py-2"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      {hint ? <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span> : null}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder || undefined}
        className="rounded-lg border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
