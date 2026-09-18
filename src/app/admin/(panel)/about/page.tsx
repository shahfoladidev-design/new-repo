import { requireAdmin } from "@/lib/admin/auth";
import { getTranslations } from "next-intl/server";
import { AboutEditForm } from "@/components/admin/about-edit-form";
import type { AboutPage } from "@/lib/about-page";

const emptyAbout: AboutPage = {
  id: 1,
  hero_image_url: null,
  title_en: "",
  title_dari: null,
  title_pashto: null,
  intro_en: "",
  intro_dari: null,
  intro_pashto: null,
  who_we_are_en: "",
  who_we_are_dari: null,
  who_we_are_pashto: null,
  approach_en: "",
  approach_dari: null,
  approach_pashto: null,
  purpose_en: "",
  purpose_dari: null,
  purpose_pashto: null,
  where_we_operate_en: "",
  where_we_operate_dari: null,
  where_we_operate_pashto: null,
  working_with_us_en: "",
  working_with_us_dari: null,
  working_with_us_pashto: null,
  meta_title_en: null,
  meta_title_dari: null,
  meta_title_pashto: null,
  meta_description_en: null,
  meta_description_dari: null,
  meta_description_pashto: null,
  is_published: true,
  updated_at: null,
};

export default async function AdminAboutPage() {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.about");
  const tc = await getTranslations("admin.common");
  const { data } = await supabase.from("about_page").select("*").eq("id", 1).maybeSingle();
  const row = (data as AboutPage | null) ?? emptyAbout;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional translations are pre-filled from English when empty — replace with a real translation when ready.
          Blank fields show English on the public site.
        </p>
      </div>

      <AboutEditForm
        row={row}
        saveLabel={tc("save")}
        labels={{
          published: t("published"),
          publishedHint: t("publishedHint"),
          heroImage: t("heroImage"),
          heroImageHint: t("heroImageHint"),
          pageContent: t("pageContent"),
          titleEn: t("titleEn"),
          titleDari: t("titleDari"),
          titlePashto: t("titlePashto"),
          introEn: t("introEn"),
          introDari: t("introDari"),
          introPashto: t("introPashto"),
          introHint: t("introHint"),
          storySections: t("storySections"),
          whoWeAreEn: t("whoWeAreEn"),
          whoWeAreDari: t("whoWeAreDari"),
          whoWeArePashto: t("whoWeArePashto"),
          approachEn: t("approachEn"),
          approachDari: t("approachDari"),
          approachPashto: t("approachPashto"),
          purposeEn: t("purposeEn"),
          purposeDari: t("purposeDari"),
          purposePashto: t("purposePashto"),
          whereEn: t("whereEn"),
          whereDari: t("whereDari"),
          wherePashto: t("wherePashto"),
          workingEn: t("workingEn"),
          workingDari: t("workingDari"),
          workingPashto: t("workingPashto"),
          seo: t("seo"),
          seoHint: t("seoHint"),
          metaTitleEn: t("metaTitleEn"),
          metaTitleDari: t("metaTitleDari"),
          metaTitlePashto: t("metaTitlePashto"),
          metaDescEn: t("metaDescEn"),
          metaDescDari: t("metaDescDari"),
          metaDescPashto: t("metaDescPashto"),
        }}
      />
    </div>
  );
}
