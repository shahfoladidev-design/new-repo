"use client";

import { useRef } from "react";
import { updateAboutPage } from "@/app/admin/actions/about";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { ImageUploadField, type ImageUploadFieldHandle } from "@/components/admin/image-upload-field";
import { withEnglishDefault } from "@/lib/admin/translation-defaults";
import type { AboutPage } from "@/lib/about-page";

const TRANSLATION_HINT =
  "Optional. Pre-filled from English when empty — replace with a real translation when ready. Blank fields show English on the public site.";

export function AboutEditForm({
  row,
  labels,
  saveLabel,
}: {
  row: AboutPage;
  labels: Record<string, string>;
  saveLabel: string;
}) {
  const imageRef = useRef<ImageUploadFieldHandle>(null);

  return (
    <AdminSubmitForm
      action={updateAboutPage}
      successMessage="About page saved"
      className="grid gap-4 rounded-2xl border border-border bg-card p-6"
      imageRef={imageRef}
      imageFieldName="hero_image_url"
    >
      <label className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={row.is_published} className="mt-1" />
        <span>
          <span className="block font-medium">{labels.published}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{labels.publishedHint}</span>
        </span>
      </label>

      <ImageUploadField
        ref={imageRef}
        label={labels.heroImage}
        name="hero_image_url"
        defaultUrl={row.hero_image_url ?? ""}
        bucket="gallery"
        hint={labels.heroImageHint}
        allowClear
        showSaveHint
      />

      <h2 className="pt-2 font-medium">{labels.pageContent}</h2>
      <TriField
        labelEn={labels.titleEn}
        labelDari={labels.titleDari}
        labelPashto={labels.titlePashto}
        name="title"
        en={row.title_en}
        dari={row.title_dari}
        pashto={row.title_pashto}
      />
      <TriArea
        labelEn={labels.introEn}
        labelDari={labels.introDari}
        labelPashto={labels.introPashto}
        name="intro"
        en={row.intro_en}
        dari={row.intro_dari}
        pashto={row.intro_pashto}
        hint={labels.introHint}
        rows={4}
      />

      <h2 className="pt-2 font-medium">{labels.storySections}</h2>
      <TriArea
        labelEn={labels.whoWeAreEn}
        labelDari={labels.whoWeAreDari}
        labelPashto={labels.whoWeArePashto}
        name="who_we_are"
        en={row.who_we_are_en}
        dari={row.who_we_are_dari}
        pashto={row.who_we_are_pashto}
      />
      <TriArea
        labelEn={labels.approachEn}
        labelDari={labels.approachDari}
        labelPashto={labels.approachPashto}
        name="approach"
        en={row.approach_en}
        dari={row.approach_dari}
        pashto={row.approach_pashto}
      />
      <TriArea
        labelEn={labels.purposeEn}
        labelDari={labels.purposeDari}
        labelPashto={labels.purposePashto}
        name="purpose"
        en={row.purpose_en}
        dari={row.purpose_dari}
        pashto={row.purpose_pashto}
      />
      <TriArea
        labelEn={labels.whereEn}
        labelDari={labels.whereDari}
        labelPashto={labels.wherePashto}
        name="where_we_operate"
        en={row.where_we_operate_en}
        dari={row.where_we_operate_dari}
        pashto={row.where_we_operate_pashto}
      />
      <TriArea
        labelEn={labels.workingEn}
        labelDari={labels.workingDari}
        labelPashto={labels.workingPashto}
        name="working_with_us"
        en={row.working_with_us_en}
        dari={row.working_with_us_dari}
        pashto={row.working_with_us_pashto}
      />

      <h2 className="pt-2 font-medium">{labels.seo}</h2>
      <p className="text-xs text-muted-foreground">{labels.seoHint}</p>
      <TriField
        labelEn={labels.metaTitleEn}
        labelDari={labels.metaTitleDari}
        labelPashto={labels.metaTitlePashto}
        name="meta_title"
        en={row.meta_title_en ?? ""}
        dari={row.meta_title_dari}
        pashto={row.meta_title_pashto}
      />
      <TriArea
        labelEn={labels.metaDescEn}
        labelDari={labels.metaDescDari}
        labelPashto={labels.metaDescPashto}
        name="meta_description"
        en={row.meta_description_en ?? ""}
        dari={row.meta_description_dari}
        pashto={row.meta_description_pashto}
        rows={3}
      />

      <button type="submit" className="mt-2 w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
        {saveLabel}
      </button>
    </AdminSubmitForm>
  );
}

function TriField({
  labelEn,
  labelDari,
  labelPashto,
  name,
  en,
  dari,
  pashto,
}: {
  labelEn: string;
  labelDari: string;
  labelPashto: string;
  name: string;
  en: string;
  dari: string | null;
  pashto: string | null;
}) {
  return (
    <div className="grid gap-3">
      <Field label={labelEn} name={`${name}_en`} defaultValue={en} />
      <Field
        label={labelDari}
        name={`${name}_dari`}
        defaultValue={withEnglishDefault(dari, en)}
        placeholder={en}
        hint={TRANSLATION_HINT}
      />
      <Field
        label={labelPashto}
        name={`${name}_pashto`}
        defaultValue={withEnglishDefault(pashto, en)}
        placeholder={en}
        hint={TRANSLATION_HINT}
      />
    </div>
  );
}

function TriArea({
  labelEn,
  labelDari,
  labelPashto,
  name,
  en,
  dari,
  pashto,
  hint,
  rows = 5,
}: {
  labelEn: string;
  labelDari: string;
  labelPashto: string;
  name: string;
  en: string;
  dari: string | null;
  pashto: string | null;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/70 bg-background/40 p-4">
      <Area label={labelEn} name={`${name}_en`} defaultValue={en} hint={hint} rows={rows} />
      <Area
        label={labelDari}
        name={`${name}_dari`}
        defaultValue={withEnglishDefault(dari, en)}
        placeholder={en}
        hint={TRANSLATION_HINT}
        rows={rows}
      />
      <Area
        label={labelPashto}
        name={`${name}_pashto`}
        defaultValue={withEnglishDefault(pashto, en)}
        placeholder={en}
        hint={TRANSLATION_HINT}
        rows={rows}
      />
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      {hint ? <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span> : null}
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2"
      />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
  rows = 5,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      {hint ? <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span> : null}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
