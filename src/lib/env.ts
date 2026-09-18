/**
 * Public Supabase env — must use static process.env.NEXT_PUBLIC_* access so Next.js
 * inlines values into client bundles. Dynamic process.env[name] is NOT replaced.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const publicSupabaseEnv = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
} as const;

/** @deprecated Prefer publicSupabaseEnv — kept for existing imports */
export const env = publicSupabaseEnv;

export function assertSupabasePublicEnv(): void {
  if (!publicSupabaseEnv.supabaseUrl || !publicSupabaseEnv.supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and set your Supabase project credentials.",
    );
  }
}
