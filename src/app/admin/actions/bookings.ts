"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { isPublicFormRateLimited } from "@/lib/admin/form-rate-limit";
import { notifyAdminNewBooking } from "@/lib/admin/notify";
import { parseOfferSelectValue } from "@/lib/booking-offers";
import { fetchCatalogPriceForBooking } from "@/lib/payments/catalog-price";
import type { PaymentCurrency } from "@/lib/payments/money";
import { validateBookingFields } from "@/lib/public-form-validation";
import { getNotificationEmail } from "@/lib/site-settings";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientIpFromHeaders, isRateLimited } from "@/lib/request-rate-limit";
import { actionFail, actionOk } from "@/lib/admin/action-result";

export async function submitBookingRequest(formData: FormData) {
  if (!hasServiceRole()) {
    return { ok: false as const, error: "Booking is temporarily unavailable. Please try again later." };
  }

  const headerStore = await headers();
  const ip = clientIpFromHeaders(headerStore);
  if (isRateLimited(`booking:ip:${ip}`, 10, 15 * 60 * 1000)) {
    return { ok: false as const, error: "Too many booking attempts. Please wait and try again." };
  }

  const validated = validateBookingFields({
    fullName: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? "").trim() || null,
    travelers: Number(formData.get("travelers") || 1),
  });

  if (!validated.ok) {
    return { ok: false as const, error: "Please check your details and try again." };
  }

  const { fullName, email, phone, message, travelers } = validated.value;

  if (await isPublicFormRateLimited("booking_requests", "email", email)) {
    return { ok: false as const, error: "Too many booking attempts. Please wait and try again." };
  }

  const catalogClient = await createClient();
  const admin = createServiceClient();
  const rawRef = String(formData.get("reference") || "").trim();

  let referenceType = "general";
  let referenceSlug: string | null = null;
  let referenceCode: string | null = null;
  let referenceTitle: string | null = null;

  let referencePriceMinor: number | null = null;
  let referencePriceCurrency: PaymentCurrency | null = null;

  const rawTier = String(formData.get("package_tier") ?? "").trim();
  let packageTier: "standard" | "vip" | null =
    rawTier === "vip" ? "vip" : rawTier === "standard" ? "standard" : null;

  if (rawRef && rawRef !== "custom") {
    const parsed = parseOfferSelectValue(rawRef);
    if (parsed) {
      referenceType = parsed.kind;
      referenceSlug = parsed.slug;
      if (parsed.kind === "package") {
        const { data } = await catalogClient
          .from("packages")
          .select("reference_code, title_en, vip_price")
          .eq("slug", parsed.slug)
          .maybeSingle();
        referenceCode = data?.reference_code ?? null;
        referenceTitle = data?.title_en ?? parsed.slug;
        if (!packageTier) packageTier = "standard";
        if (packageTier === "vip" && (data?.vip_price == null || Number(data.vip_price) <= 0)) {
          packageTier = "standard";
        }
      } else if (parsed.kind === "service") {
        packageTier = null;
        const { data } = await catalogClient
          .from("services")
          .select("reference_code, title_en")
          .eq("slug", parsed.slug)
          .maybeSingle();
        referenceCode = data?.reference_code ?? null;
        referenceTitle = data?.title_en ?? parsed.slug;
      } else {
        packageTier = null;
        const { data } = await catalogClient
          .from("tour_departures")
          .select("reference_code, title_en, start_date")
          .eq("slug", parsed.slug)
          .maybeSingle();
        referenceCode = data?.reference_code ?? null;
        referenceTitle = data
          ? `${data.title_en}${data.start_date ? ` (${data.start_date})` : ""}`
          : parsed.slug;
      }

      const catalog = await fetchCatalogPriceForBooking(
        catalogClient,
        referenceType,
        referenceSlug,
        referenceType === "package" ? packageTier : null,
      );
      if (catalog) {
        referencePriceMinor = catalog.price_minor;
        referencePriceCurrency = catalog.currency;
      }
    }
  } else if (rawRef === "custom") {
    referenceType = "custom";
    referenceTitle = "Custom / not sure yet";
    packageTier = null;
  }

  const travelDate = String(formData.get("travel_date") || "") || null;
  const bookingId = crypto.randomUUID();
  const paymentAccessToken = crypto.randomUUID();

  const { error } = await admin.from("booking_requests").insert({
    id: bookingId,
    full_name: fullName,
    email,
    phone,
    travel_date: travelDate,
    travelers,
    nationality: String(formData.get("nationality") || "") || null,
    preferred_language: String(formData.get("preferred_language") || "") || null,
    payment_notes: String(formData.get("payment_notes") || "") || null,
    reference_type: referenceType,
    reference_slug: referenceSlug,
    reference_code: referenceCode,
    reference_title: referenceTitle,
    package_tier: packageTier,
    message,
    status: "new",
    admin_seen: false,
    agreement_accepted_at: new Date().toISOString(),
    payment_access_token: paymentAccessToken,
    reference_price_minor: referencePriceMinor,
    reference_price_currency: referencePriceCurrency,
    quoted_amount_minor: referencePriceMinor,
    quoted_currency: referencePriceCurrency,
    payment_status: "unpaid",
  });

  if (error) return { ok: false as const, error: error.message };

  await notifyAdminNewBooking({
    fullName,
    email,
    phone,
    travelDate,
    referenceCode,
    referenceTitle,
    nationality: String(formData.get("nationality") || "") || null,
    preferredLanguage: String(formData.get("preferred_language") || "") || null,
    packageTier,
    notificationEmail: await getNotificationEmail(),
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? null,
    telegramChatId: process.env.TELEGRAM_CHAT_ID ?? null,
  });

  return {
    ok: true as const,
    referenceCode,
    referenceTitle,
    fullName,
    bookingId,
    paymentAccessToken,
    referencePriceMinor: referencePriceMinor ?? null,
    referencePriceCurrency: referencePriceCurrency ?? null,
    quotedAmountMinor: referencePriceMinor ?? null,
    quotedCurrency: referencePriceCurrency ?? null,
  };
}

export async function markBookingSeen(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("booking_requests").update({ admin_seen: true }).eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return actionOk("Marked as seen");
}

export async function updateBookingNotes(id: string, adminNotes: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("booking_requests").update({ admin_notes: adminNotes }).eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath(`/admin/bookings/${id}`);
  return actionOk("Notes saved");
}

export async function updateBookingStatus(id: string, status: string) {
  const { supabase } = await requireAdmin();
  const { BOOKING_STATUSES } = await import("@/lib/booking-offers");
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) {
    return actionFail("Invalid booking status");
  }
  const { error } = await supabase.from("booking_requests").update({ status }).eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return actionOk("Status updated");
}

export async function deleteBooking(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("booking_requests").delete().eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return actionOk("Booking deleted");
}

export async function deleteContact(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return actionOk("Contact deleted");
}
