"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("admin.login");
  const [error, setError] = useState(() => {
    const code = searchParams.get("error");
    if (code === "unauthorized") return t("unauthorized");
    if (code === "session_expired") return t("sessionExpired");
    return "";
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(t("unauthorized"));
      return;
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <form action={onSubmit} className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <label className="grid gap-2 text-sm">
          <span>{t("email")}</span>
          <input name="email" type="email" required className="rounded-xl border border-border px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm">
          <span>{t("password")}</span>
          <input name="password" type="password" required className="rounded-xl border border-border px-3 py-2" />
        </label>
        <div className="text-end">
          <Link href="/admin/forgot-password" className="text-sm text-primary underline-offset-2 hover:underline">
            {t("forgotPassword")}
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
}
