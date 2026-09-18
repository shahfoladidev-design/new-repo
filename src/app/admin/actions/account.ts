"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyCurrentPassword(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  email: string,
  currentPassword: string,
): Promise<ActionResult | null> {
  if (!currentPassword) return actionFail("Current password is required.");
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: currentPassword,
  });
  if (error) return actionFail("Current password is incorrect.");
  return null;
}

export async function changeAdminPassword(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!newPassword || !confirmPassword) {
    return actionFail("New password and confirmation are required.");
  }
  if (newPassword.length < 8) {
    return actionFail("Password must be at least 8 characters.");
  }
  if (newPassword !== confirmPassword) {
    return actionFail("New passwords do not match.");
  }
  if (newPassword === currentPassword) {
    return actionFail("New password must be different from your current password.");
  }

  const loginEmail = user.email ?? "";
  if (!loginEmail) return actionFail("Your account has no login email.");

  const verifyError = await verifyCurrentPassword(supabase, loginEmail, currentPassword);
  if (verifyError) return verifyError;

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return actionFail(error.message);

  return actionOk("Password updated successfully.");
}

export async function changeAdminEmail(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  const newEmail = String(formData.get("new_email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("current_password") ?? "");
  const currentEmail = (user.email ?? "").trim().toLowerCase();

  if (!newEmail) return actionFail("New email is required.");
  if (!isValidEmail(newEmail)) return actionFail("Enter a valid email address.");
  if (newEmail === currentEmail) {
    return actionFail("New email must be different from your current login email.");
  }

  if (!currentEmail) return actionFail("Your account has no login email.");

  const verifyError = await verifyCurrentPassword(supabase, currentEmail, currentPassword);
  if (verifyError) return verifyError;

  if (!hasServiceRole()) {
    return actionFail(
      "Email change requires SUPABASE_SERVICE_ROLE_KEY on the server. Add it in your environment and redeploy.",
    );
  }

  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("admin_users")
    .select("user_id")
    .ilike("email", newEmail)
    .neq("user_id", user.id)
    .maybeSingle();

  if (existing) return actionFail("This email is already registered as an admin login.");

  const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
    email: newEmail,
    email_confirm: true,
  });
  if (authError) return actionFail(authError.message);

  const { error: dbError } = await supabase
    .from("admin_users")
    .update({ email: newEmail })
    .eq("user_id", user.id);

  if (dbError) {
    return actionFail(`Login email updated in auth but admin record sync failed: ${dbError.message}`);
  }

  return actionOk("Login email updated. Use your new email the next time you sign in.");
}
