import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import type { ContentTable } from "@/app/admin/actions/content";
import { getTranslations } from "next-intl/server";
import { normalizePackageType, type PackageType } from "@/lib/package-types";

const titleKeys: Partial<Record<ContentTable, string>> = {
  packages: "packages",
  destinations: "destinations",
  blog_posts: "blog",
  services: "services",
  team_members: "team",
  faqs: "faqs",
  tour_departures: "upcomingTours",
};

type Props = {
  table: ContentTable;
  adminPath: string;
  nameField?: boolean;
  /** Narrows the `packages` table to one type so private and group get their own list. */
  packageType?: PackageType;
  /** Overrides the heading key under `admin.nav`. */
  titleKeyOverride?: string;
};

export async function AdminContentList({
  table,
  adminPath,
  nameField,
  packageType,
  titleKeyOverride,
}: Props) {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin");

  const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false });

  // Filtered in memory rather than SQL: the list is already unbounded, and this keeps
  // the page working before the package_type migration has been applied (untyped rows
  // normalize to private).
  const rows = packageType
    ? (data ?? []).filter((item) => normalizePackageType(item.package_type) === packageType)
    : (data ?? []);

  const titleKey = titleKeyOverride ?? titleKeys[table] ?? "packages";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t(`nav.${titleKey}`)}</h1>
          <p className="text-sm text-muted-foreground">{t("common.createEditPublish")}</p>
        </div>
        <Link href={`${adminPath}/new`} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
          {t("common.addNew")}
        </Link>
      </div>
      <div className="grid gap-3">
        {rows.map((item) => (
          <Link
            key={item.id}
            href={`${adminPath}/${item.id}`}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {nameField
                  ? item.name_en ?? item.name
                  : item.title_en ?? item.question_en ?? item.name}
              </p>
              <p className="text-xs text-muted-foreground">{item.slug ?? item.category}</p>
            </div>
            <span className="text-xs">{item.is_published ? t("common.published") : t("common.draft")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
