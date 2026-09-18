import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { StarRating } from "@/components/star-rating";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import { getTranslations } from "next-intl/server";

export default async function AdminReviewsPage() {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.reviews");
  const { data: reviews } = await supabase
    .from("visitor_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <AdminDataTable
        headers={[t("guest"), t("rating"), t("review"), t("status"), t("actions")]}
        emptyMessage={t("empty")}
      >
        {(reviews ?? []).map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 align-top">
            <td className="px-4 py-3">
              <Link href={`/admin/reviews/${r.id}`} className="font-medium text-primary hover:underline">
                {r.full_name}
              </Link>
              {r.country ? <span className="mt-0.5 block text-xs text-muted-foreground">{r.country}</span> : null}
              {!r.admin_seen ? (
                <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  {t("newBadge")}
                </span>
              ) : null}
            </td>
            <td className="px-4 py-3">
              <StarRating rating={Number(r.rating)} size="sm" />
            </td>
            <td className="max-w-sm px-4 py-3 text-sm text-muted-foreground">
              <p className="line-clamp-3">{r.review_text}</p>
            </td>
            <td className="px-4 py-3">
              <span
                className={
                  r.is_published
                    ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                    : "inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                }
              >
                {r.is_published ? t("published") : t("pending")}
              </span>
            </td>
            <td className="px-4 py-3">
              <ReviewRowActions
                id={r.id}
                isPublished={Boolean(r.is_published)}
                publishLabel={t("publish")}
                unpublishLabel={t("unpublish")}
                deleteLabel={t("delete")}
              />
            </td>
          </tr>
        ))}
      </AdminDataTable>
    </div>
  );
}
