"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordFromRecoverySession } from "@/app/admin/actions/password-reset";

/**
 * Handles Supabase recovery links (?code= or hash tokens) and sets a new password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function bootstrap() {
      const url = new URL(window.location.href);

      // PKCE code from email link (?code=...)
      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && !cancelled) {
          setError(exchangeError.message);
          setReady(true);
          return;
        }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + url.search);
      }

      // Implicit / hash recovery tokens (#access_token=...&type=recovery)
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError && !cancelled) {
            setError(sessionError.message);
            setReady(true);
            return;
          }
          window.history.replaceState({}, "", url.pathname);
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) {
        if (!user) {
          setError("Open the reset link from your email, or use Forgot password to get a code.");
        }
        setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const passwordsMismatch = Boolean(confirm) && password !== confirm;
  const canSubmit = password.length >= 8 && confirm.length >= 8 && !passwordsMismatch && ready;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match. Fix them before continuing.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const result = await updatePasswordFromRecoverySession(password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
    setTimeout(() => router.push("/admin/login"), 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for your admin account.
          </p>
        </div>

        {!ready ? (
          <p className="text-sm text-muted-foreground">Preparing secure session…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="grid gap-2 text-sm">
              <span>New password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-border px-3 py-2"
                autoComplete="new-password"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span>Confirm password</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (error.startsWith("Passwords do not match")) setError("");
                }}
                className={`rounded-xl border px-3 py-2 ${
                  passwordsMismatch ? "border-red-500" : "border-border"
                }`}
                autoComplete="new-password"
              />
            </label>
            {passwordsMismatch && (
              <p className="text-sm text-red-600">Passwords do not match. Fix them before continuing.</p>
            )}
            {error && !passwordsMismatch && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/admin/forgot-password" className="underline">
            Request a code instead
          </Link>
          {" · "}
          <Link href="/admin/login" className="underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
