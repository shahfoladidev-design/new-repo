import "server-only";
import {
  assertConfigComplete,
  type ResolvedHesabPayConfig,
  isAllowedCheckoutUrl,
} from "@/lib/payments/hesabpay/config";
import {
  HESABPAY_PATHS,
  type HesabPayCreateSessionRequest,
  type HesabPayCreateSessionResponse,
  type HesabPayVerifySignatureRequest,
  type HesabPayVerifySignatureResponse,
} from "@/lib/payments/hesabpay/types";

const REQUEST_TIMEOUT_MS = 30_000;

export class HesabPayApiError extends Error {
  readonly statusCode: number | null;
  readonly code: string | null;

  constructor(message: string, statusCode: number | null = null, code: string | null = null) {
    super(message);
    this.name = "HesabPayApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

function redactKey(key: string): string {
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HesabPayApiError("Invalid response from payment provider", res.status, "invalid_json");
  }
}

function extractCheckoutUrl(data: HesabPayCreateSessionResponse): string | null {
  return data.sessionUrl ?? data.paymentUrl ?? data.url ?? data.checkoutUrl ?? null;
}

export async function createPaymentSession(
  config: ResolvedHesabPayConfig,
  body: HesabPayCreateSessionRequest,
): Promise<{ checkoutUrl: string; sessionId: string | null; raw: HesabPayCreateSessionResponse }> {
  assertConfigComplete(config);

  const url = `${config.apiBaseUrl}${HESABPAY_PATHS.createSession}`;
  const payload = config.merchantId ? { ...body, merchantId: config.merchantId } : body;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: config.apiKey,
        "api-key": config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const json = (await parseJsonSafe(res)) as HesabPayCreateSessionResponse | { data?: HesabPayCreateSessionResponse; error?: string };

    if (!res.ok) {
      const msg =
        (json && typeof json === "object" && "message" in json && String(json.message)) ||
        (json && typeof json === "object" && "error" in json && String(json.error)) ||
        "Payment session could not be created";
      throw new HesabPayApiError(msg, res.status, "create_session_failed");
    }

    const data =
      json && typeof json === "object" && "data" in json && json.data
        ? (json.data as HesabPayCreateSessionResponse)
        : (json as HesabPayCreateSessionResponse);

    const checkoutUrl = extractCheckoutUrl(data);
    if (!checkoutUrl) {
      throw new HesabPayApiError("Payment provider did not return a checkout URL", res.status, "missing_checkout_url");
    }

    if (!isAllowedCheckoutUrl(checkoutUrl, config.allowedCheckoutHosts)) {
      throw new HesabPayApiError("Checkout URL is not from an approved HesabPay host", null, "unsafe_redirect");
    }

    return {
      checkoutUrl,
      sessionId: data.sessionId ?? data.transactionId ?? null,
      raw: data,
    };
  } catch (err) {
    if (err instanceof HesabPayApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new HesabPayApiError("Payment provider timed out", null, "timeout");
    }
    throw new HesabPayApiError("Unable to reach payment provider", null, "network_error");
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyWebhookSignature(
  config: ResolvedHesabPayConfig,
  request: HesabPayVerifySignatureRequest,
): Promise<HesabPayVerifySignatureResponse> {
  assertConfigComplete(config);

  const url = `${config.apiBaseUrl}${HESABPAY_PATHS.verifySignature}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: config.apiKey,
        "api-key": config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
      cache: "no-store",
    });

    const json = (await parseJsonSafe(res)) as HesabPayVerifySignatureResponse | { data?: HesabPayVerifySignatureResponse };

    if (!res.ok) {
      throw new HesabPayApiError("Webhook signature verification failed", res.status, "verify_failed");
    }

    return json && typeof json === "object" && "data" in json && json.data
      ? (json.data as HesabPayVerifySignatureResponse)
      : (json as HesabPayVerifySignatureResponse);
  } catch (err) {
    if (err instanceof HesabPayApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new HesabPayApiError("Signature verification timed out", null, "timeout");
    }
    throw new HesabPayApiError("Unable to verify webhook with payment provider", null, "network_error");
  } finally {
    clearTimeout(timer);
  }
}

export function safeLogContext(config: ResolvedHesabPayConfig) {
  return {
    environment: config.environment,
    apiBaseUrl: config.apiBaseUrl,
    apiKey: redactKey(config.apiKey),
    merchantId: config.merchantId ? redactKey(config.merchantId) : null,
  };
}
