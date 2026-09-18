"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { actionFail, actionOk } from "@/lib/admin/action-result";
import { fetchCatalogPriceForBooking } from "@/lib/payments/catalog-price";
import { normalizeAllowedCheckoutHosts } from "@/lib/payments/hesabpay/config";
import { majorToMinor, isPaymentCurrency } from "@/lib/payments/money";
import { createServiceClient } from "@/lib/supabase/admin";

export async function updateHesabPaySettings(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const environment = String(formData.get("environment") ?? "sandbox");
  if (environment !== "sandbox" && environment !== "production") {
    return actionFail("Invalid environment");
  }

  const apiKey = String(formData.get("api_key") ?? "").trim();
  const merchantId = String(formData.get("merchant_id") ?? "").trim();
  const merchantPin = String(formData.get("merchant_pin") ?? "").trim();
  const webhookSecret = String(formData.get("webhook_secret") ?? "").trim();

  const confirmation = String(formData.get("credential_confirmation") ?? "").trim();
  const currentPassword = String(formData.get("current_password") ?? "");
  const requestedAllowedHosts = String(formData.get("allowed_checkout_hosts") ?? "").trim();
  const allowedCheckoutHosts = normalizeAllowedCheckoutHosts(requestedAllowedHosts);

  if (!allowedCheckoutHosts.length) {
    return actionFail("Enter at least one valid checkout host.");
  }

  const { data: current, error: readError } = await supabase
    .from("hesabpay_settings")
    .select("api_key, merchant_id, merchant_pin, webhook_secret")
    .eq("id", 1)
    .maybeSingle();
  if (readError) return actionFail(readError.message);

  const changedCredentials = [
    apiKey && apiKey !== current?.api_key ? "api_key" : null,
    merchantId !== (current?.merchant_id ?? "") ? "merchant_id" : null,
    merchantPin && merchantPin !== current?.merchant_pin ? "merchant_pin" : null,
    webhookSecret && webhookSecret !== current?.webhook_secret ? "webhook_secret" : null,
  ].filter((field): field is string => Boolean(field));

  if (changedCredentials.length) {
    if (confirmation !== "SAVE PAYMENT CREDENTIALS") {
      return actionFail('Type "SAVE PAYMENT CREDENTIALS" to confirm credential changes.');
    }
    if (!currentPassword || !user.email) {
      return actionFail("Your current password is required to save payment credentials.");
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (authError) return actionFail("Current password is incorrect.");
  }

  const payload: Record<string, unknown> = {
    environment,
    sandbox_api_base_url:
      String(formData.get("sandbox_api_base_url") ?? "https://sandbox-api.hesab.com").trim() ||
      "https://sandbox-api.hesab.com",
    production_api_base_url:
      String(formData.get("production_api_base_url") ?? "https://api.hesab.com").trim() ||
      "https://api.hesab.com",
    merchant_id: merchantId || null,
    allowed_checkout_hosts: allowedCheckoutHosts.join(","),
    updated_at: new Date().toISOString(),
  };

  if (apiKey) payload.api_key = apiKey;
  if (merchantId !== (current?.merchant_id ?? "")) payload.merchant_id = merchantId || null;
  if (merchantPin) payload.merchant_pin = merchantPin;
  if (webhookSecret) payload.webhook_secret = webhookSecret;

  const { error } = await supabase.from("hesabpay_settings").update(payload).eq("id", 1);
  if (error) return actionFail(error.message);

  if (changedCredentials.length) {
    const merchantIdForHash = merchantId || current?.merchant_id || "";
    const merchantIdHash = merchantIdForHash
      ? createHash("sha256").update(merchantIdForHash).digest("hex")
      : null;
    const { error: auditError } = await supabase.from("hesabpay_credential_audit_log").insert({
      actor_user_id: user.id,
      changed_fields: changedCredentials,
      merchant_id_hash: merchantIdHash,
    });
    if (auditError) return actionFail(`Credentials were saved, but the audit entry failed: ${auditError.message}`);
  }

  revalidatePath("/admin/settings");
  return actionOk(changedCredentials.length ? "HesabPay credentials saved and audited" : "HesabPay settings saved");
}

export async function updateBookingQuote(
  bookingId: string,
  formData: FormData,
): Promise<import("@/lib/admin/action-result").ActionResult> {
  await requireAdmin();
  const supabase = createServiceClient();

  const amountRaw = String(formData.get("quoted_amount") ?? "").trim();
  const currency = String(formData.get("quoted_currency") ?? "").trim().toUpperCase();

  if (!amountRaw) {
    const { error } = await supabase
      .from("booking_requests")
      .update({ quoted_amount_minor: null, quoted_currency: null, updated_at: new Date().toISOString() })
      .eq("id", bookingId);
    if (error) return actionFail(error.message);
    revalidatePath(`/admin/bookings/${bookingId}`);
    return actionOk("Quote cleared");
  }

  if (!isPaymentCurrency(currency)) {
    return actionFail("Currency must be USD");
  }

  let amountMinor: bigint;
  try {
    amountMinor = majorToMinor(amountRaw, currency);
  } catch {
    return actionFail("Invalid amount");
  }

  const { error } = await supabase
    .from("booking_requests")
    .update({
      quoted_amount_minor: Number(amountMinor),
      quoted_currency: currency,
      status: "quoted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) return actionFail(error.message);

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
  return actionOk("Quote saved");
}

export async function syncBookingFromCatalog(bookingId: string): Promise<import("@/lib/admin/action-result").ActionResult> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: booking } = await supabase
    .from("booking_requests")
    .select("reference_type, reference_slug, amount_paid_minor, package_tier")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking?.reference_slug) {
    return actionFail("No package or tour linked to this booking");
  }

  const catalog = await fetchCatalogPriceForBooking(
    supabase,
    booking.reference_type ?? "",
    booking.reference_slug,
    booking.package_tier === "vip" || booking.package_tier === "standard" ? booking.package_tier : null,
  );
  if (!catalog) {
    return actionFail("No catalog price set for this package or tour. Edit it under Packages or Upcoming Tours.");
  }

  const { error } = await supabase
    .from("booking_requests")
    .update({
      reference_price_minor: catalog.price_minor,
      reference_price_currency: catalog.currency,
      quoted_amount_minor: catalog.price_minor,
      quoted_currency: catalog.currency,
      status: "quoted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) return actionFail(error.message);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
  return actionOk("Synced from catalog price");
}
