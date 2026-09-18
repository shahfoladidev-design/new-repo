import { createClient } from "@supabase/supabase-js";
import { assertSupabasePublicEnv, publicSupabaseEnv } from "@/lib/env";

/**
 * Cookie-free anon client for published CMS reads.
 * Safe to use inside `unstable_cache` / static data paths — does not call `cookies()`.
 */
export function createPublicClient() {
  assertSupabasePublicEnv();
  return createClient(publicSupabaseEnv.supabaseUrl, publicSupabaseEnv.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
