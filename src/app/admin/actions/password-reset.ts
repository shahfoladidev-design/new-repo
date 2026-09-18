"use server";

import { createHash, randomInt } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/seo";
import { getResendFromAddress } from "@/lib/resend";
import { env } from "@/lib/env";
import { isRateLimited } from "@/lib/request-rate-limit";

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function generateOtp() {
  return String(randomInt(100000, 999999));
}

async function sendResetEmail(to: string[], code: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { ok: false as const, error: "Email service is not configured (RESEND_API_KEY)." };
  }

  const text = [
    "Shah Foladi admin password reset",
    "",
    `Your one-time code is: ${code}`,
    "",
    "This code expires in 15 minutes.",
    "If you did not request a password reset, ignore this email.",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromAddress(),
      to,
      subject: "Admin password reset code — Shah Foladi",
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false as const, error: `Failed to send email: ${body || res.statusText}` };
  }

  return { ok: true as const };
}

async function callResetEdgeFunction(body: Record<string, unknown>) {
  const secret = process.env.ADMIN_EDGE_SECRET?.trim();
  if (!secret) {
    return { ok: false, error: "Edge reset unavailable." } as const;
  }

  const res = await fetch(`${env.supabaseUrl}/functions/v1/admin-password-reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.supabaseAnonKey}`,
      "x-admin-edge-secret": secret,
    },
    body: JSON.stringify(body),
  });
  return (await res.json()) as {
    ok: boolean;
    mode?: "otp" | "link";
    message?: string;
    error?: string;
  };
}

/**
 * Step 1: request a 6-digit OTP emailed to the admin login address.
 */
export async function requestAdminPasswordReset(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { ok: false as const, error: "Email is required." };

  if (isRateLimited(`pwreset:${email}`, 5, 15 * 60 * 1000)) {
    return {
      ok: true as const,
      message: "If this email is registered as an admin, a reset code has been sent to the company inbox.",
    };
  }

  async function sendOtpViaVercel() {
    if (!hasServiceRole() || !process.env.RESEND_API_KEY) {
      return null;
    }

    const admin = createServiceClient();
    const { data: adminRow } = await admin
      .from("admin_users")
      .select("user_id, email")
      .ilike("email", email)
      .maybeSingle();

    if (!adminRow) {
      return {
        ok: true as const,
        message: "If this email is registered as an admin, a reset code has been sent to the company inbox.",
      };
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await admin
      .from("admin_password_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("email", adminRow.email)
      .is("consumed_at", null);

    const { error: insertError } = await admin.from("admin_password_otps").insert({
      email: adminRow.email,
      user_id: adminRow.user_id,
      code_hash: hashOtp(code),
      expires_at: expiresAt,
    });

    if (insertError) return { ok: false as const, error: insertError.message };

    // Prefer notification inbox when set; always include the admin login email.
    // Query site_settings directly (avoid Next.js Data Cache stale notification_email).
    const { data: settings } = await admin
      .from("site_settings")
      .select("notification_email")
      .eq("id", 1)
      .maybeSingle();

    const recipients = new Set<string>();
    recipients.add(adminRow.email.trim().toLowerCase());
    if (settings?.notification_email) {
      recipients.add(settings.notification_email.trim().toLowerCase());
    }

    const sent = await sendResetEmail([...recipients], code);
    if (!sent.ok) return sent;

    return {
      ok: true as const,
      mode: "otp" as const,
      message: "A 6-digit code was sent to your admin / notification email. Enter it below with your new password.",
    };
  }

  // Prefer Vercel env (RESEND_API_KEY + SUPABASE_SERVICE_ROLE_KEY) when both are set
  const local = await sendOtpViaVercel();
  if (local) return local;

  // Next: Supabase Edge Function (requires ADMIN_EDGE_SECRET + RESEND_API_KEY in Edge secrets)
  try {
    const edge = await callResetEdgeFunction({ action: "request", email });
    if (edge.ok) {
      return {
        ok: true as const,
        mode: (edge.mode ?? "otp") as "otp" | "link",
        message:
          edge.message ??
          "A 6-digit code was sent to your admin email. Enter it below with your new password.",
      };
    }
  } catch {
    // fall through to Supabase Auth link
  }

  const supabase = await createClient();
  const siteUrl = getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/admin/reset-password`,
  });
  if (!error) {
    return {
      ok: true as const,
      mode: "link" as const,
      message: "A password reset link has been sent to your email. Open it to set a new password.",
    };
  }

  return {
    ok: false as const,
    error:
      "Email service is not configured. Add RESEND_API_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel (Production), redeploy, and also add RESEND_API_KEY under Supabase → Edge Functions → Secrets.",
  };
}

/**
 * Step 2: verify OTP and set a new password.
 */
export async function confirmAdminPasswordReset(input: {
  email: string;
  code: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim();
  const password = input.password;

  if (!email || !code || !password) {
    return { ok: false as const, error: "Email, code, and new password are required." };
  }
  if (password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }

  try {
    const edge = await callResetEdgeFunction({ action: "confirm", email, code, password });
    if (edge.ok) {
      return {
        ok: true as const,
        message: edge.message ?? "Password updated. You can sign in with your new password.",
      };
    }
    if (!hasServiceRole()) {
      return { ok: false as const, error: edge.error ?? "Could not verify reset code." };
    }
  } catch {
    if (!hasServiceRole()) {
      return {
        ok: false as const,
        error: "OTP reset is unavailable. Use the email reset link instead.",
      };
    }
  }

  const admin = createServiceClient();
  const { data: rows } = await admin
    .from("admin_password_otps")
    .select("*")
    .ilike("email", email)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const row = rows?.[0];
  if (!row) return { ok: false as const, error: "No active reset code. Request a new one." };

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin.from("admin_password_otps").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
    return { ok: false as const, error: "This code has expired. Request a new one." };
  }

  if (row.attempts >= 5) {
    await admin.from("admin_password_otps").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
    return { ok: false as const, error: "Too many attempts. Request a new code." };
  }

  if (row.code_hash !== hashOtp(code)) {
    await admin
      .from("admin_password_otps")
      .update({ attempts: (row.attempts ?? 0) + 1 })
      .eq("id", row.id);
    return { ok: false as const, error: "Invalid code." };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(row.user_id, { password });
  if (updateError) return { ok: false as const, error: updateError.message };

  await admin.from("admin_password_otps").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);

  return { ok: true as const, message: "Password updated. You can sign in with your new password." };
}

/**
 * After clicking a Supabase recovery link, the user has a recovery session.
 */
export async function updatePasswordFromRecoverySession(password: string) {
  if (!password || password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Recovery session expired. Request a new reset." };

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "Not an admin account." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false as const, error: error.message };

  await supabase.auth.signOut();
  return { ok: true as const, message: "Password updated. Sign in with your new password." };
}
