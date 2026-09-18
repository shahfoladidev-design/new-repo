import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabasePublicEnv, publicSupabaseEnv } from "@/lib/env";

export async function createClient() {
  assertSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(publicSupabaseEnv.supabaseUrl, publicSupabaseEnv.supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    },
  );
}
