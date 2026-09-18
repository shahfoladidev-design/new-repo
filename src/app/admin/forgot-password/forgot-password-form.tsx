"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestAdminPasswordReset, confirmAdminPasswordReset } from "@/app/admin/actions/password-reset";

type Step = "request" | "verify";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"otp" | "link" | null>(null);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const result = await requestAdminPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
    if (result.mode === "link") {
      setMode("link");
      return;
    }
    setMode("otp");
    setStep("verify");
  }

  const passwordsMismatch = Boolean(confirm) && password !== confirm;
  const canSubmitVerify =
    code.length === 6 && password.length >= 8 && confirm.length >= 8 && !passwordsMismatch;

  async function onVerify(e: React.FormEvent) {
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
    const result = await confirmAdminPasswordReset({ email, code, password });
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
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "request"
              ? "Enter your admin email. A one-time code will be sent to that address."
              : "Enter the 6-digit code from the email and choose a new password."}
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={onRequest} className="space-y-4">
            <label className="grid gap-2 text-sm">
              <span>Admin email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border px-3 py-2"
                autoComplete="email"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <label className="grid gap-2 text-sm">
              <span>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span>6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="rounded-xl border border-border px-3 py-2 tracking-[0.3em]"
                autoComplete="one-time-code"
              />
            </label>
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
                  if (error === "Passwords do not match. Fix them before continuing.") setError("");
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
              disabled={loading || !canSubmitVerify}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
            <button
              type="button"
              className="w-full text-sm text-muted-foreground underline"
              onClick={() => {
                setStep("request");
                setMode(null);
                setCode("");
                setError("");
                setMessage("");
              }}
            >
              Request a new code
            </button>
          </form>
        )}

        {mode === "link" && (
          <p className="text-xs text-muted-foreground">
            Check your inbox for the reset link, then continue on the reset page.
          </p>
        )}

        <p className="text-center text-sm">
          <Link href="/admin/login" className="underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
