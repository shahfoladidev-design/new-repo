import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  extractAmountCurrency,
  extractEventId,
  extractOrderReference,
  extractTransactionId,
  extractWebhookSignature,
  getResolvedHesabPayConfig,
  hashPayload,
} from "@/lib/payments/hesabpay/settings-server";
import { verifyWebhookSignature } from "@/lib/payments/hesabpay/client";
import { mapProviderStatus } from "@/lib/payments/hesabpay/types";
import {
  hasExpectedPaymentAmountAndCurrency,
  hasVerifiedHesabPayWebhookSignature,
} from "@/lib/payments/hesabpay/verification";

export async function processHesabPayWebhook(rawBody: string, headers: Headers): Promise<{ ok: boolean; status: number }> {
  const config = await getResolvedHesabPayConfig();
  if (!config?.apiKey) {
    return { ok: false, status: 503 };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return { ok: false, status: 400 };
  }

  const payloadHash = hashPayload(rawBody);
  const signature = extractWebhookSignature(headers);
  const supabase = createServiceClient();

  const eventId = extractEventId(payload, payloadHash);

  // A shared secret comparison alone is not a payment-provider signature
  // verification. Require HesabPay's verification endpoint to accept a
  // signature for this exact payload before creating an idempotency record.
  if (!signature) {
    return { ok: false, status: 401 };
  }

  let verifyResult: Awaited<ReturnType<typeof verifyWebhookSignature>> | null = null;

  try {
    verifyResult = await verifyWebhookSignature(config, { payload, signature });
  } catch {
    return { ok: false, status: 401 };
  }

  if (!hasVerifiedHesabPayWebhookSignature(signature, verifyResult)) {
    return { ok: false, status: 401 };
  }

  const { error: dupError } = await supabase.from("payment_events").insert({
    provider: "hesabpay",
    provider_event_id: eventId,
    event_type: typeof payload.eventType === "string" ? payload.eventType : typeof payload.type === "string" ? payload.type : null,
    payload_hash: payloadHash,
    processing_status: "received",
  });

  if (dupError?.code === "23505") {
    return { ok: true, status: 200 };
  }
  if (dupError) {
    return { ok: false, status: 503 };
  }

  const orderRef = extractOrderReference(payload) ?? extractOrderReference(verifyResult ?? {});
  const txId = extractTransactionId(payload) ?? verifyResult?.transactionId ?? null;
  const providerStatusRaw =
    (typeof payload.status === "string" ? payload.status : null) ??
    verifyResult?.status ??
    null;
  const normalized = mapProviderStatus(providerStatusRaw);

  if (!orderRef) {
    await supabase
      .from("payment_events")
      .update({ processing_status: "failed", error_message: "Missing order reference", processed_at: new Date().toISOString() })
      .eq("provider", "hesabpay")
      .eq("provider_event_id", eventId);
    return { ok: false, status: 422 };
  }

  const { data: attempt } = await supabase
    .from("payment_attempts")
    .select("*")
    .eq("public_reference", orderRef)
    .maybeSingle();

  if (!attempt) {
    await supabase
      .from("payment_events")
      .update({ processing_status: "failed", error_message: "Unknown payment attempt", processed_at: new Date().toISOString() })
      .eq("provider", "hesabpay")
      .eq("provider_event_id", eventId);
    return { ok: false, status: 404 };
  }

  const { amountMinor: payloadAmount, currency: payloadCurrency } = extractAmountCurrency({
    ...payload,
    amount: payload.amount ?? verifyResult?.amount,
    currency: payload.currency ?? verifyResult?.currency,
  });

  if (
    !hasExpectedPaymentAmountAndCurrency(
      payloadAmount,
      payloadCurrency,
      BigInt(attempt.amount_minor),
      attempt.currency,
    )
  ) {
    await supabase
      .from("payment_attempts")
      .update({ status: "manual_review", provider_status: providerStatusRaw, updated_at: new Date().toISOString() })
      .eq("id", attempt.id);
    await supabase
      .from("payment_events")
      .update({
        processing_status: "failed",
        error_message: "Amount or currency mismatch",
        processed_at: new Date().toISOString(),
        payment_attempt_id: attempt.id,
      })
      .eq("provider", "hesabpay")
      .eq("provider_event_id", eventId);
    return { ok: false, status: 422 };
  }

  if (normalized === "succeeded" && txId) {
    const { data: applied } = await supabase.rpc("apply_payment_success", {
      p_attempt_id: attempt.id,
      p_expected_amount_minor: attempt.amount_minor,
      p_expected_currency: attempt.currency,
      p_provider_transaction_id: txId,
      p_provider_status: providerStatusRaw,
    });

    await supabase
      .from("payment_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
        payment_attempt_id: attempt.id,
        provider_transaction_id: txId,
      })
      .eq("provider", "hesabpay")
      .eq("provider_event_id", eventId);

    if (applied) {
      // First successful transition — notifications could be added here
    }

    return { ok: true, status: 200 };
  }

  if (normalized !== "succeeded" && attempt.status !== "succeeded") {
    await supabase
      .from("payment_attempts")
      .update({
        status: normalized,
        provider_status: providerStatusRaw,
        provider_transaction_id: txId ?? attempt.provider_transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", attempt.id);
  }

  await supabase
    .from("payment_events")
    .update({
      processing_status: "processed",
      processed_at: new Date().toISOString(),
      payment_attempt_id: attempt.id,
      provider_transaction_id: txId,
    })
    .eq("provider", "hesabpay")
    .eq("provider_event_id", eventId);

  return { ok: true, status: 200 };
}

export async function reconcilePendingPayment(attemptId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data: attempt } = await supabase
    .from("payment_attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || !["pending", "processing", "created"].includes(attempt.status)) {
    return false;
  }

  if (!attempt.provider_transaction_id) {
    return false;
  }

  const config = await getResolvedHesabPayConfig();
  if (!config) return false;

  try {
    const verifyResult = await verifyWebhookSignature(config, {
      payload: {
        transactionId: attempt.provider_transaction_id,
        orderReferenceNumber: attempt.public_reference,
        amount: Number(attempt.amount_minor) / 100,
        currency: attempt.currency,
      },
    });

    const normalized = mapProviderStatus(verifyResult.status);
    if (normalized !== "succeeded") return false;

    const { data: applied } = await supabase.rpc("apply_payment_success", {
      p_attempt_id: attempt.id,
      p_expected_amount_minor: attempt.amount_minor,
      p_expected_currency: attempt.currency,
      p_provider_transaction_id: attempt.provider_transaction_id,
      p_provider_status: verifyResult.status ?? "succeeded",
    });

    return Boolean(applied);
  } catch {
    return false;
  }
}
