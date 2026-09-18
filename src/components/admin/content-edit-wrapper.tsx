import { upsertContent, deleteContent, type ContentTable } from "@/app/admin/actions/content";
import { ContentEditForm } from "@/components/admin/content-edit-form";
import { PackageDestinationsManager } from "@/components/admin/package-destinations-manager";
import { PackageDaysManager, type PackageDayDraft } from "@/components/admin/package-days-manager";
import {
  DestinationAttractionsManager,
  type AttractionDraft,
} from "@/components/admin/destination-attractions-manager";
import type { PackageType } from "@/lib/package-types";

export async function AdminContentEdit({
  table,
  adminPath,
  id,
  nameField,
  extraFields,
  defaultPackageType,
}: {
  table: ContentTable;
  adminPath: string;
  id?: string;
  nameField?: boolean;
  defaultPackageType?: PackageType;
  extraFields?: (
    | "price"
    | "location"
    | "languages"
    | "days"
    | "excerpt"
    | "content"
    | "province"
    | "faq"
    | "departure"
    | "packageExtra"
  )[];
}) {
  let item: Record<string, unknown> | null = null;
  let packageDestEntries: Array<{
    id: string;
    destination_id: string;
    dest_title: string;
    dest_slug: string;
    days: number | null;
    sort_order: number;
  }> = [];
  let allDestinations: Array<{ id: string; slug: string; title_en: string }> = [];
  let packageDays: PackageDayDraft[] = [];
  let attractions: AttractionDraft[] = [];

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  if (id) {
    const { data } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
    item = data;
  }

  if (table === "packages") {
    const { data: dests } = await supabase.from("destinations").select("id, slug, title_en").eq("is_published", true);
    allDestinations = (dests ?? []) as Array<{ id: string; slug: string; title_en: string }>;

    if (id) {
      const { getPackageDestinations } = await import("@/app/admin/actions/package-destinations");
      packageDestEntries = await getPackageDestinations(id);

      const { data: days } = await supabase
        .from("package_days")
        .select("*")
        .eq("package_id", id)
        .order("day_number", { ascending: true });
      packageDays = (days ?? []).map((d) => ({
        day_number: Number(d.day_number ?? 1),
        title_en: String(d.title_en ?? ""),
        title_dari: String(d.title_dari ?? ""),
        title_pashto: String(d.title_pashto ?? ""),
        body_en: String(d.body_en ?? ""),
        body_dari: String(d.body_dari ?? ""),
        body_pashto: String(d.body_pashto ?? ""),
        overnight_location: String(d.overnight_location ?? ""),
        sort_order: Number(d.sort_order ?? d.day_number ?? 0),
      }));
    }
  }

  if (table === "destinations" && id) {
    const { data: rows } = await supabase
      .from("destination_attractions")
      .select("*")
      .eq("destination_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    attractions = (rows ?? []).map((row, i) => ({
      id: String(row.id),
      title_en: String(row.title_en ?? ""),
      title_dari: String(row.title_dari ?? ""),
      title_pashto: String(row.title_pashto ?? ""),
      summary_en: String(row.summary_en ?? ""),
      summary_dari: String(row.summary_dari ?? ""),
      summary_pashto: String(row.summary_pashto ?? ""),
      image_url: String(row.image_url ?? ""),
      sort_order: Number(row.sort_order ?? i),
    }));
  }

  return (
    <ContentEditForm
      table={table}
      adminPath={adminPath}
      item={item}
      nameField={nameField}
      extraFields={extraFields}
      defaultPackageType={defaultPackageType}
      upsertAction={upsertContent}
      deleteAction={deleteContent}
    >
      {table === "packages" && (
        <>
          <div className="rounded-2xl border border-border bg-card p-6">
            <PackageDestinationsManager initialEntries={packageDestEntries} allDestinations={allDestinations} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <PackageDaysManager initialDays={packageDays} />
          </div>
        </>
      )}
      {table === "destinations" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <DestinationAttractionsManager initialAttractions={attractions} />
        </div>
      )}
    </ContentEditForm>
  );
}
