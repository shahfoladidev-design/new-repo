export type HesabPayCreateSessionRequest = {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  currency: string;
  orderReferenceNumber: string;
  successUrl: string;
  failureUrl: string;
  webhookUrl: string;
  merchantId?: string;
};

export type HesabPayCreateSessionResponse = {
  sessionUrl?: string;
  paymentUrl?: string;
  url?: string;
  checkoutUrl?: string;
  sessionId?: string;
  transactionId?: string;
  status?: string;
  message?: string;
};

export type HesabPayWebhookPayload = Record<string, unknown>;

export type HesabPayVerifySignatureRequest = {
  payload: HesabPayWebhookPayload;
  signature?: string;
};

export type HesabPayVerifySignatureResponse = {
  valid?: boolean;
  isValid?: boolean;
  status?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  orderReferenceNumber?: string;
};

export const HESABPAY_PATHS = {
  createSession: "/api/v1/payment/create-session",
  verifySignature: "/api/v1/hesab/webhooks/verify-signature",
} as const;

/** Map provider statuses — unknown values stay pending/manual_review */
export function mapProviderStatus(raw: string | null | undefined): string {
  if (!raw) return "pending";
  const s = raw.toLowerCase();
  if (["success", "succeeded", "paid", "completed", "captured", "approved"].includes(s)) return "succeeded";
  if (["failed", "failure", "declined", "rejected", "error"].includes(s)) return "failed";
  if (["cancelled", "canceled", "voided"].includes(s)) return "cancelled";
  if (["expired", "timeout"].includes(s)) return "expired";
  if (["pending", "processing", "initiated", "created"].includes(s)) return "pending";
  return "manual_review";
}

export type NormalizedPaymentStatus =
  | "created"
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "partially_refunded"
  | "manual_review";
