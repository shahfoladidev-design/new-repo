import "server-only";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

type RateLimitTable = "contact_submissions" | "visitor_reviews" | "booking_requests";

export async function isPublicFormRateLimited(
  table: RateLimitTable,
  field: "email" | "full_name",
  value: string,
): Promise<boolean> {
  if (!hasServiceRole() || !value.trim()) return false;

  const supabase = createServiceClient();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(field, value.trim())
    .gte("created_at", since);

  if (error) return false;
  return (count ?? 0) >= MAX_SUBMISSIONS;
}
