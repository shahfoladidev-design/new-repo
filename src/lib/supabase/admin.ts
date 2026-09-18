import { createClient } from "@supabase/supabase-js";
import { assertSupabasePublicEnv, publicSupabaseEnv } from "@/lib/env";

/** Service-role client for privileged admin ops (password reset). Never expose to the browser. */
export function createServiceClient() {
  assertSupabasePublicEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(publicSupabaseEnv.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
