export type HesabPayEnvironment = "sandbox" | "production";

export type HesabPaySettingsRow = {
  id: number;
  environment: HesabPayEnvironment;
  sandbox_api_base_url: string;
  production_api_base_url: string;
  api_key: string | null;
  merchant_id: string | null;
  merchant_pin: string | null;
  webhook_secret: string | null;
  allowed_checkout_hosts: string;
  updated_at: string;
};

export type ResolvedHesabPayConfig = {
  environment: HesabPayEnvironment;
  apiBaseUrl: string;
  apiKey: string;
  merchantId: string | null;
  merchantPin: string | null;
  webhookSecret: string | null;
  allowedCheckoutHosts: string[];
};

const DEFAULT_SANDBOX = "https://api-sandbox.hesab.com";
const DEFAULT_PRODUCTION = "https://api.hesab.com";

export function resolveHesabPayConfig(
  row: HesabPaySettingsRow | null,
  opts?: { vercelEnv?: string | undefined },
): ResolvedHesabPayConfig | null {
  if (!row?.api_key?.trim()) return null;

  const vercelEnv = opts?.vercelEnv ?? process.env.VERCEL_ENV;
  let environment = row.environment;

  // Preview/local must not use production credentials
  if (vercelEnv === "preview" || vercelEnv === "development") {
    environment = "sandbox";
  }

  const envOverride = process.env.HESABPAY_ENV?.trim();
  if (envOverride === "sandbox" || envOverride === "production") {
    environment = envOverride;
  }

  const apiBaseUrl =
    environment === "production"
      ? (row.production_api_base_url?.trim() || process.env.HESABPAY_PRODUCTION_API_BASE_URL || DEFAULT_PRODUCTION).replace(/\/$/, "")
      : (row.sandbox_api_base_url?.trim() || process.env.HESABPAY_SANDBOX_API_BASE_URL || DEFAULT_SANDBOX).replace(/\/$/, "");

  const allowedFromEnv = process.env.HESABPAY_ALLOWED_CHECKOUT_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean);
  const allowedFromRow = row.allowed_checkout_hosts?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];

  return {
    environment,
    apiBaseUrl,
    apiKey: row.api_key.trim(),
    merchantId: row.merchant_id?.trim() || process.env.HESABPAY_MERCHANT_ID?.trim() || null,
    merchantPin: row.merchant_pin?.trim() || process.env.HESABPAY_MERCHANT_PIN?.trim() || null,
    webhookSecret: row.webhook_secret?.trim() || process.env.HESABPAY_WEBHOOK_SECRET?.trim() || null,
    allowedCheckoutHosts: allowedFromEnv?.length ? allowedFromEnv : allowedFromRow,
  };
}

export function assertConfigComplete(config: ResolvedHesabPayConfig | null): asserts config is ResolvedHesabPayConfig {
  if (!config?.apiKey) {
    throw new HesabPayConfigError("HesabPay is not configured. Add API credentials in the admin dashboard.");
  }
}

export class HesabPayConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HesabPayConfigError";
  }
}

export function isAllowedCheckoutUrl(url: string, allowedHosts: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return allowedHosts.some((allowed) => {
      const a = allowed.toLowerCase();
      return host === a || host.endsWith(`.${a}`);
    });
  } catch {
    return false;
  }
}

export function normalizeAllowedCheckoutHosts(value: string): string[] {
  return [...new Set(
    value
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter((host) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(host)),
  )];
}
