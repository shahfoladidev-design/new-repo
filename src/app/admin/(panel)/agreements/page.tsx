import { requireAdmin } from "@/lib/admin/auth";
import { updateLegalDocument } from "@/app/admin/actions/settings";
import { getTranslations } from "next-intl/server";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { withEnglishDefault } from "@/lib/admin/translation-defaults";

const TRANSLATION_HINT =
  "Optional. Pre-filled from English when empty — replace with a real translation when ready. Blank fields show English on the public site.";

export default async function AdminAgreementsPage() {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.agreements");
  const tc = await getTranslations("admin.common");
  const { data } = await supabase.from("legal_documents").select("*").order("doc_type");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{TRANSLATION_HINT}</p>
      </div>
      {(data ?? []).map((doc) => (
        <AdminSubmitForm
          key={doc.id}
          action={updateLegalDocument.bind(null, doc.doc_type)}
          successMessage="Agreement saved"
          className="grid gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="font-medium capitalize">{doc.doc_type.replace("_", " ")}</h2>
          <Field label={t("titleEn")} name="title_en" defaultValue={doc.title_en} />
          <Field
            label={t("titleDari")}
            name="title_dari"
            defaultValue={withEnglishDefault(doc.title_dari, doc.title_en)}
            placeholder={doc.title_en}
            hint={TRANSLATION_HINT}
          />
          <Field
            label={t("titlePashto")}
            name="title_pashto"
            defaultValue={withEnglishDefault(doc.title_pashto, doc.title_en)}
            placeholder={doc.title_en}
            hint={TRANSLATION_HINT}
          />
          <Area label={t("contentEn")} name="content_en" defaultValue={doc.content_en} />
          <Area
            label={t("contentDari")}
            name="content_dari"
            defaultValue={withEnglishDefault(doc.content_dari, doc.content_en)}
            placeholder={doc.content_en}
            hint={TRANSLATION_HINT}
          />
          <Area
            label={t("contentPashto")}
            name="content_pashto"
            defaultValue={withEnglishDefault(doc.content_pashto, doc.content_en)}
            placeholder={doc.content_en}
            hint={TRANSLATION_HINT}
          />
          <button type="submit" className="w-fit rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
            {tc("save")}
          </button>
        </AdminSubmitForm>
      ))}
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
        className="rounded-lg border border-border px-3 py-2"
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
      <textarea
        name={name}
        rows={6}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-lg border border-border px-3 py-2"
      />
    </label>
  );
}
