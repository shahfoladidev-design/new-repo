import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { StarRating } from "@/components/star-rating";
import { markReviewSeen } from "@/app/admin/actions/reviews";
import { ReviewRowActions } from "@/components/admin/review-row-actions";

export default async function AdminReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: review } = await supabase.from("visitor_reviews").select("*").eq("id", id).maybeSingle();
  if (!review) notFound();
  if (!review.admin_seen) await markReviewSeen(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/reviews" className="text-sm text-primary hover:underline">
          ← Back to reviews
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{review.full_name}</h1>
        <p className="text-sm text-muted-foreground">{review.country || "—"}</p>
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <StarRating rating={Number(review.rating)} />
        <p className="leading-relaxed text-muted-foreground">{review.review_text}</p>
        <p className="text-xs text-muted-foreground">
          Submitted {new Date(review.created_at).toLocaleString()} ·{" "}
          {review.is_published ? "Published" : "Pending approval"}
        </p>
      </div>
      <ReviewRowActions
        id={id}
        isPublished={Boolean(review.is_published)}
        publishLabel="Publish on website"
        unpublishLabel="Unpublish"
        deleteLabel="Delete"
        redirectToAfterDelete="/admin/reviews"
      />
    </div>
  );
}
