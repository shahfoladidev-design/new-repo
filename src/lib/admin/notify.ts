import { getResendFromAddress } from "@/lib/resend";
import { getGuideLanguageLabel } from "@/lib/guide-languages";
import { toUrlSlug } from "@/lib/slug";

/** Admin-side slug cleaner — shares its rules with the public URL builder. */
export function slugify(text: string) {
  return toUrlSlug(text);
}

export async function notifyAdminNewContact(payload: {
  fullName: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  notificationEmail?: string | null;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
}) {
  const subjectLine = payload.subject?.trim() || "General inquiry";
  const phoneLine = payload.phone?.trim() ? `\nPhone: ${payload.phone.trim()}` : "";
  const text = [
    "New Contact Us inquiry (from website contact form)",
    "",
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}${phoneLine}`,
    `Subject: ${subjectLine}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  if (payload.telegramBotToken && payload.telegramChatId) {
    await fetch(`https://api.telegram.org/bot${payload.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: payload.telegramChatId, text }),
    }).catch(() => undefined);
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && payload.notificationEmail) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFromAddress(),
        to: [payload.notificationEmail],
        subject: `Contact Us inquiry — ${payload.fullName}`,
        text,
      }),
    }).catch(() => undefined);
  }
}

export async function notifyAdminNewBooking(payload: {
  fullName: string;
  email: string;
  phone: string;
  travelDate?: string | null;
  referenceCode?: string | null;
  referenceTitle?: string | null;
  nationality?: string | null;
  preferredLanguage?: string | null;
  packageTier?: string | null;
  notificationEmail?: string | null;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
}) {
  const refLine =
    payload.referenceCode || payload.referenceTitle
      ? `\nPackage/Service: ${[payload.referenceCode, payload.referenceTitle].filter(Boolean).join(" — ")}`
      : "\nPackage/Service: Custom / not specified";
  const tierLine =
    payload.packageTier === "vip"
      ? "\nPackage tier: VIP"
      : payload.packageTier === "standard"
        ? "\nPackage tier: Standard"
        : "";
  const tierSubject =
    payload.packageTier === "vip"
      ? " (VIP)"
      : payload.packageTier === "standard"
        ? " (Standard)"
        : "";
  const extras = [
    payload.nationality ? `Nationality: ${payload.nationality}` : null,
    payload.preferredLanguage ? `Language: ${getGuideLanguageLabel(payload.preferredLanguage)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const message = `New Shah Foladi booking (status: new)\nName: ${payload.fullName}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nTravel: ${payload.travelDate ?? "TBD"}${refLine}${tierLine}${extras ? `\n${extras}` : ""}`;

  if (payload.telegramBotToken && payload.telegramChatId) {
    await fetch(`https://api.telegram.org/bot${payload.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: payload.telegramChatId, text: message }),
    }).catch(() => undefined);
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && payload.notificationEmail) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFromAddress(),
        to: [payload.notificationEmail],
        subject: `New booking request${tierSubject} — Shah Foladi`,
        text: message,
      }),
    }).catch(() => undefined);
  }
}
