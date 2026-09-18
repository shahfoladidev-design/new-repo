import { createBrowserClient } from "@supabase/ssr";
import { assertSupabasePublicEnv, publicSupabaseEnv } from "@/lib/env";

export function createClient() {
  assertSupabasePublicEnv();
  return createBrowserClient(publicSupabaseEnv.supabaseUrl, publicSupabaseEnv.supabaseAnonKey);
}
