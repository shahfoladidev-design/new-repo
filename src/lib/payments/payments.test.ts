import { describe, expect, it } from "vitest";
import { majorToMinor, minorToMajor, formatMoney } from "@/lib/payments/money";
import { resolveHesabPayConfig, isAllowedCheckoutUrl } from "@/lib/payments/hesabpay/config";
import { mapProviderStatus } from "@/lib/payments/hesabpay/types";
import { resolveAuthorizedPayAmount } from "@/lib/payments/pay-amount";
import {
  hasExpectedPaymentAmountAndCurrency,
  hasVerifiedHesabPayWebhookSignature,
} from "@/lib/payments/hesabpay/verification";

describe("money", () => {
  it("converts major to minor without float drift", () => {
    expect(majorToMinor("890.50", "USD")).toBe(BigInt(89050));
    expect(minorToMajor(BigInt(89050))).toBe("890.50");
  });

  it("formats USD", () => {
    expect(formatMoney(BigInt(10000), "USD", "en")).toContain("100");
  });
});

describe("hesabpay config", () => {
  it("forces sandbox on preview deployments", () => {
    const config = resolveHesabPayConfig(
      {
        id: 1,
        environment: "production",
        sandbox_api_base_url: "https://sandbox-api.hesab.com",
        production_api_base_url: "https://api.hesab.com",
        api_key: "test-key-12345678",
        merchant_id: null,
        merchant_pin: null,
        webhook_secret: null,
        allowed_checkout_hosts: "pay.hesab.com",
        updated_at: new Date().toISOString(),
      },
      { vercelEnv: "preview" },
    );
    expect(config?.environment).toBe("sandbox");
    expect(config?.apiBaseUrl).toContain("sandbox");
  });

  it("rejects unsafe checkout URLs", () => {
    expect(isAllowedCheckoutUrl("https://evil.example/phish", ["pay.hesab.com"])).toBe(false);
    expect(isAllowedCheckoutUrl("http://pay.hesab.com/session/abc", ["pay.hesab.com"])).toBe(false);
    expect(isAllowedCheckoutUrl("https://pay.hesab.com/session/abc", ["pay.hesab.com"])).toBe(true);
  });

  it("returns null when api key missing", () => {
    expect(resolveHesabPayConfig(null)).toBeNull();
  });
});

describe("pay amount authorization", () => {
  it("allows partial payment up to remaining quote", () => {
    const pay = resolveAuthorizedPayAmount({
      payAmountMinor: BigInt(20000),
      quotedAmountMinor: BigInt(89000),
      amountPaidMinor: BigInt(0),
      currency: "USD",
      quotedCurrency: "USD",
    });
    expect(pay).toBe(BigInt(20000));
  });

  it("rejects overpayment", () => {
    expect(() =>
      resolveAuthorizedPayAmount({
        payAmountMinor: BigInt(90000),
        quotedAmountMinor: BigInt(89000),
        amountPaidMinor: BigInt(0),
        currency: "USD",
        quotedCurrency: "USD",
      }),
    ).toThrow();
  });
});

describe("HesabPay webhook verification", () => {
  it("rejects a missing or unverified provider signature", () => {
    expect(hasVerifiedHesabPayWebhookSignature(null, { valid: true })).toBe(false);
    expect(hasVerifiedHesabPayWebhookSignature("signature", { valid: false })).toBe(false);
    expect(hasVerifiedHesabPayWebhookSignature("signature", { isValid: true })).toBe(true);
  });

  it("rejects a mismatched payment amount or currency", () => {
    expect(hasExpectedPaymentAmountAndCurrency(BigInt(89000), "USD", BigInt(89000), "USD")).toBe(true);
    expect(hasExpectedPaymentAmountAndCurrency(BigInt(1), "USD", BigInt(89000), "USD")).toBe(false);
    expect(hasExpectedPaymentAmountAndCurrency(BigInt(89000), "AFN", BigInt(89000), "USD")).toBe(false);
  });
});

describe("provider status mapping", () => {
  it("maps success statuses", () => {
    expect(mapProviderStatus("SUCCESS")).toBe("succeeded");
    expect(mapProviderStatus("paid")).toBe("succeeded");
  });

  it("keeps unknown as manual_review", () => {
    expect(mapProviderStatus("WEIRD_STATUS_XYZ")).toBe("manual_review");
  });
});
