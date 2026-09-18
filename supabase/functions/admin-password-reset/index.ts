// Deployed via Supabase MCP as `admin-password-reset`.
// Handles OTP request + confirm using the project service role.
// Requires secret: RESEND_API_KEY (Supabase Edge Function secrets).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-edge-secret",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const edgeSecret = Deno.env.get("ADMIN_EDGE_SECRET")?.trim();
  const providedSecret = req.headers.get("x-admin-edge-secret")?.trim();
  if (!edgeSecret || providedSecret !== edgeSecret) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    const payload = await req.json();
    const action = String(payload.action ?? "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    if (action === "request") {
      const email = String(payload.email ?? "").trim().toLowerCase();
      if (!email) return json({ ok: false, error: "Email is required." }, 400);

      if (isRateLimited(`pwreset:${email}`, 5, 15 * 60 * 1000)) {
        return json({
          ok: true,
          mode: "otp",
          message:
            "If this email is registered as an admin, a reset code has been sent to the company inbox.",
        });
      }

      const { data: adminRow } = await admin
        .from("admin_users")
        .select("user_id, email")
        .ilike("email", email)
        .maybeSingle();

      if (!adminRow) {
        return json({
          ok: true,
          mode: "otp",
          message:
            "If this email is registered as an admin, a reset code has been sent to the company inbox.",
        });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const codeHash = await sha256(code);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await admin
        .from("admin_password_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("email", adminRow.email)
        .is("consumed_at", null);

      const { error: insertError } = await admin.from("admin_password_otps").insert({
        email: adminRow.email,
        user_id: adminRow.user_id,
        code_hash: codeHash,
        expires_at: expiresAt,
      });
      if (insertError) return json({ ok: false, error: insertError.message }, 500);

      const { data: settings } = await admin
        .from("site_settings")
        .select("notification_email")
        .eq("id", 1)
        .maybeSingle();

      const recipients = new Set<string>();
      recipients.add(String(adminRow.email).trim().toLowerCase());
      if (settings?.notification_email) {
        recipients.add(String(settings.notification_email).trim().toLowerCase());
      }

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) {
        return json({ ok: false, error: "Email service is not configured (RESEND_API_KEY)." }, 500);
      }

      const fromAddress =
        Deno.env.get("RESEND_FROM_EMAIL")?.trim() ||
        "Shah Foladi <bookings@send.shahfoladi.com>";

      const text = [
        "Shah Foladi admin password reset",
        "",
        `Your one-time code is: ${code}`,
        "",
        "This code expires in 15 minutes.",
        "If you did not request a password reset, ignore this email.",
      ].join("\n");

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [...recipients],
          subject: "Admin password reset code — Shah Foladi",
          text,
        }),
      });

      if (!emailRes.ok) {
        const body = await emailRes.text();
        return json({ ok: false, error: `Failed to send email: ${body || emailRes.statusText}` }, 500);
      }

      return json({
        ok: true,
        mode: "otp",
        message:
          "A 6-digit code was sent to your admin / notification email. Enter it below with your new password.",
      });
    }

    if (action === "confirm") {
      const email = String(payload.email ?? "").trim().toLowerCase();
      const code = String(payload.code ?? "").trim();
      const password = String(payload.password ?? "");

      if (!email || !code || !password) {
        return json({ ok: false, error: "Email, code, and new password are required." }, 400);
      }
      if (password.length < 8) {
        return json({ ok: false, error: "Password must be at least 8 characters." }, 400);
      }

      const { data: rows } = await admin
        .from("admin_password_otps")
        .select("*")
        .ilike("email", email)
        .is("consumed_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      const row = rows?.[0];
      if (!row) return json({ ok: false, error: "No active reset code. Request a new one." }, 400);

      if (new Date(row.expires_at).getTime() < Date.now()) {
        await admin
          .from("admin_password_otps")
          .update({ consumed_at: new Date().toISOString() })
          .eq("id", row.id);
        return json({ ok: false, error: "This code has expired. Request a new one." }, 400);
      }

      if ((row.attempts ?? 0) >= 5) {
        await admin
          .from("admin_password_otps")
          .update({ consumed_at: new Date().toISOString() })
          .eq("id", row.id);
        return json({ ok: false, error: "Too many attempts. Request a new code." }, 400);
      }

      const codeHash = await sha256(code);
      if (row.code_hash !== codeHash) {
        await admin
          .from("admin_password_otps")
          .update({ attempts: (row.attempts ?? 0) + 1 })
          .eq("id", row.id);
        return json({ ok: false, error: "Invalid code." }, 400);
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(row.user_id, {
        password,
      });
      if (updateError) return json({ ok: false, error: updateError.message }, 500);

      await admin
        .from("admin_password_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", row.id);

      return json({
        ok: true,
        message: "Password updated. You can sign in with your new password.",
      });
    }

    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
