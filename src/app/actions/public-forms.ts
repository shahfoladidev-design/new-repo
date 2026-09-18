"use server";

import { isPublicFormRateLimited } from "@/lib/admin/form-rate-limit";
import { notifyAdminNewContact } from "@/lib/admin/notify";
import { validateContactFields, validateReviewFields } from "@/lib/public-form-validation";
import { getNotificationEmail } from "@/lib/site-settings";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";

export type PublicFormResult = { ok: true } | { ok: false; error: string };

function readHoneypot(formData: FormData) {
  return String(formData.get("company_website") ?? "").trim();
}

export async function submitContactForm(formData: FormData): Promise<PublicFormResult> {
  if (readHoneypot(formData)) {
    return { ok: true };
  }

  const validated = validateContactFields({
    fullName: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    phone: String(formData.get("phone") ?? "").trim() || null,
    subject: String(formData.get("subject") ?? "").trim() || null,
  });

  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const { fullName, email, phone, subject, message } = validated.value;

  if (await isPublicFormRateLimited("contact_submissions", "email", email)) {
    return { ok: false, error: "rate_limited" };
  }

  if (!hasServiceRole()) {
    return { ok: false, error: "submit_failed" };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("contact_submissions").insert({
    full_name: fullName,
    email,
    phone,
    subject,
    message,
    admin_seen: false,
  });

  if (error) {
    console.error("[submitContactForm]", error.message);
    return { ok: false, error: "submit_failed" };
  }

  const settings = await getNotificationEmail();
  await notifyAdminNewContact({
    fullName,
    email,
    phone,
    subject,
    message,
    notificationEmail: settings,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? null,
    telegramChatId: process.env.TELEGRAM_CHAT_ID ?? null,
  });

  return { ok: true };
}

export async function submitVisitorReview(formData: FormData): Promise<PublicFormResult> {
  if (readHoneypot(formData)) {
    return { ok: true };
  }

  const ratingRaw = Number(formData.get("rating"));
  const validated = validateReviewFields({
    fullName: String(formData.get("full_name") ?? ""),
    country: String(formData.get("country") ?? "").trim() || null,
    reviewText: String(formData.get("review_text") ?? ""),
    rating: ratingRaw,
  });

  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const { fullName, country, reviewText, rating } = validated.value;

  if (await isPublicFormRateLimited("visitor_reviews", "full_name", fullName)) {
    return { ok: false, error: "rate_limited" };
  }

  if (!hasServiceRole()) {
    return { ok: false, error: "submit_failed" };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("visitor_reviews").insert({
    full_name: fullName,
    country,
    rating,
    review_text: reviewText,
    is_published: false,
    admin_seen: false,
  });

  if (error) return { ok: false, error: "submit_failed" };
  return { ok: true };
}
