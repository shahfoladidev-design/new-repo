import type { SupabaseClient } from "@supabase/supabase-js";

export async function isAdminUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
