import "server-only";
import { createHash } from "crypto";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/site-settings";
import {
  resolveHesabPayConfig,
  type HesabPaySettingsRow,
  type ResolvedHesabPayConfig,
} from "@/lib/payments/hesabpay/config";

export async function getHesabPaySettingsRow(): Promise<HesabPaySettingsRow | null> {
  if (!hasServiceRole()) return null;
  const supabase = createServiceClient();
  const { data } = await supabase.from("hesabpay_settings").select("*").eq("id", 1).maybeSingle();
  return data as HesabPaySettingsRow | null;
}

export async function getResolvedHesabPayConfig(): Promise<ResolvedHesabPayConfig | null> {
  const row = await getHesabPaySettingsRow();
  return resolveHesabPayConfig(row);
}

export async function isHesabPayEnabledPublic(): Promise<boolean> {
  const settings = await getSiteSettings();
  return Boolean(settings.hesabpay_enabled);
}

export async function isHesabPayOperational(): Promise<boolean> {
  const enabled = await isHesabPayEnabledPublic();
  if (!enabled) return false;
  const config = await getResolvedHesabPayConfig();
  return Boolean(config?.apiKey);
}

export function hashPayload(rawBody: string): string {
  return createHash("sha256").update(rawBody).digest("hex");
}

export function extractWebhookSignature(headers: Headers): string | null {
  return (
    headers.get("x-hesabpay-signature") ??
    headers.get("x-signature") ??
    headers.get("signature") ??
    null
  );
}

export function extractEventId(payload: Record<string, unknown>, payloadHash: string): string {
  const candidates = ["eventId", "event_id", "id", "webhookId", "webhook_id"];
  for (const key of candidates) {
    const val = payload[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return payloadHash;
}

export function extractTransactionId(payload: Record<string, unknown>): string | null {
  const keys = ["transactionId", "transaction_id", "paymentId", "payment_id", "reference"];
  for (const key of keys) {
    const val = payload[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return null;
}

export function extractOrderReference(payload: Record<string, unknown>): string | null {
  const keys = ["orderReferenceNumber", "order_reference", "orderReference", "merchantReference"];
  for (const key of keys) {
    const val = payload[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return null;
}

export function extractAmountCurrency(payload: Record<string, unknown>): { amountMinor: bigint | null; currency: string | null } {
  const amountRaw = payload.amount ?? payload.total ?? payload.price;
  const currencyRaw = payload.currency;
  const currency = typeof currencyRaw === "string" ? currencyRaw.toUpperCase() : null;

  if (typeof amountRaw === "number" && Number.isFinite(amountRaw)) {
    return { amountMinor: BigInt(Math.round(amountRaw * 100)), currency };
  }
  if (typeof amountRaw === "string" && /^\d+(\.\d{1,2})?$/.test(amountRaw.trim())) {
    const [whole, frac = ""] = amountRaw.trim().split(".");
    const minor = BigInt(whole) * BigInt(100) + BigInt((frac + "00").slice(0, 2));
    return { amountMinor: minor, currency };
  }
  return { amountMinor: null, currency };
}
