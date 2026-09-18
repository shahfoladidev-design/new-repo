"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { revalidateCms, revalidatePublicPaths } from "@/lib/revalidate-cms";

export async function setReviewPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("visitor_reviews")
    .update({ is_published: isPublished, admin_seen: true })
    .eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/reviews");
  revalidateCms([CACHE_TAGS.reviews, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/reviews", "/");
  return actionOk(isPublished ? "Review published" : "Review unpublished");
}

export async function markReviewSeen(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("visitor_reviews").update({ admin_seen: true }).eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/reviews");
  return actionOk("Marked as seen");
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("visitor_reviews").delete().eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/reviews");
  revalidateCms([CACHE_TAGS.reviews, CACHE_TAGS.homepage]);
  revalidatePublicPaths("/reviews", "/");
  return actionOk("Review deleted");
}
