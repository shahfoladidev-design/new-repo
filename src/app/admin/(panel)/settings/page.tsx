import { requireAdmin } from "@/lib/admin/auth";
import { getAdminSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/seo";
import { brandAccent, brandPrimary, brandSecondary } from "@/lib/colors";
import { updateSiteSettings } from "@/app/admin/actions/settings";
import { updateHesabPaySettings } from "@/app/admin/actions/payments";
import { getTranslations } from "next-intl/server";
import { BrandColorsEditor } from "@/components/admin/brand-colors-editor";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { SiteLogoUploadForm } from "@/components/admin/site-logo-upload-form";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const s = await getAdminSiteSettings();
  const { data: hesab } = await supabase.from("hesabpay_settings").select("*").eq("id", 1).maybeSingle();
  const t = await getTranslations("admin.settings");
  const webhookUrl = `${getSiteUrl()}/api/payments/hesabpay/webhook`;

  const whyUsText = Array.isArray(s.why_us)
    ? s.why_us.map((row) => `${row.title} | ${row.body}`).join("\n")
    : "";
  const testimonialsText = Array.isArray(s.testimonials)
    ? s.testimonials
        .map((row) => [row.quote, row.name, row.country].filter(Boolean).join(" | "))
        .join("\n")
    : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-medium">{t("branding")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload and save the logo separately. Changes apply site-wide after you click Save logo.
          </p>
        </div>
        <SiteLogoUploadForm
          defaultUrl={s.logo_url ?? ""}
          uploadLabel={t("uploadLogo")}
          hint="Preview matches the site header (8.5 × 9.5 rem). Upload a transparent PNG, then click Save logo."
        />
      </section>

      <AdminSubmitForm
        action={updateSiteSettings}
        successMessage="Settings saved"
        encType="multipart/form-data"
        className="grid gap-4 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="font-medium">{t("contact")}</h2>
        <Input label={t("whatsapp")} name="whatsapp" defaultValue={s.whatsapp ?? ""} />
        <Input label={t("phone")} name="phone" defaultValue={s.phone ?? ""} />
        <Input label={t("email")} name="email" defaultValue={s.email ?? ""} />
        <Input label={t("telegramUrl")} name="telegram_url" defaultValue={s.telegram_url ?? ""} />
        <Input label={t("notificationEmail")} name="notification_email" defaultValue={s.notification_email ?? ""} />
        <Input label={t("addressEn")} name="address_en" defaultValue={s.address_en ?? ""} />
        <Input label="Address (Dari)" name="address_dari" defaultValue={s.address_dari ?? ""} />
        <Input label="Address (Pashto)" name="address_pashto" defaultValue={s.address_pashto ?? ""} />

        <h2 className="pt-4 font-medium">Homepage content</h2>
        <TextArea
          label="Why choose us (one per line: Title | Body)"
          name="why_us_text"
          defaultValue={whyUsText}
          rows={6}
        />
        <TextArea
          label="Testimonials (one per line: Quote | Name | Country)"
          name="testimonials_text"
          defaultValue={testimonialsText}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Letter avatars are generated automatically from the reviewer&apos;s name. Prefer publishing visitor reviews from Admin → Reviews.
        </p>
        <Input label="TripAdvisor URL" name="tripadvisor_url" defaultValue={s.tripadvisor_url ?? ""} />
        <Input label="Google reviews URL" name="google_reviews_url" defaultValue={s.google_reviews_url ?? ""} />

        <h2 className="pt-4 font-medium">Brand colors</h2>
        <BrandColorsEditor
          primary={brandPrimary(s.primary_color)}
          secondary={brandSecondary(s.secondary_color)}
          accent={brandAccent(s.accent_color)}
          labels={{
            primary: t("primaryColor"),
            secondary: t("secondaryColor"),
            accent: t("accentColor"),
            restore: t("restoreDefaults"),
            restoreNow: t("restoreDefaultsNow"),
          }}
        />
        <p className="text-xs text-muted-foreground">{t("colorsHint")}</p>

        <h2 className="pt-4 font-medium">{t("appearance")}</h2>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
          <input
            type="checkbox"
            name="glass_look_enabled"
            defaultChecked={Boolean(s.glass_look_enabled)}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{t("glassLook")}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{t("glassLookHint")}</span>
          </span>
        </label>

        <h2 className="pt-4 font-medium">{t("social")}</h2>
        <p className="text-xs text-muted-foreground">
          Paste full profile URLs. TikTok and YouTube appear in the footer, contact page, and homepage whenever a URL is set.
        </p>
        <Input label="TikTok URL" name="social_tiktok" defaultValue={s.social_tiktok ?? ""} />
        <Input label="YouTube URL" name="social_youtube" defaultValue={s.social_youtube ?? ""} />
        <Input label="Instagram URL" name="social_instagram" defaultValue={s.social_instagram ?? ""} />
        <Input label="Facebook URL" name="social_facebook" defaultValue={s.social_facebook ?? ""} />
        <Input label="X (Twitter) URL" name="social_x" defaultValue={s.social_x ?? ""} />
        <Input label="LinkedIn URL" name="social_linkedin" defaultValue={s.social_linkedin ?? ""} />

        <h2 className="pt-4 font-medium">Offline bank payment (not online checkout)</h2>
        <p className="text-xs text-muted-foreground">
          Shown on the booking page. Guests must confirm on WhatsApp before transferring. No card payment is processed on the website.
        </p>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
          <input
            type="checkbox"
            name="offline_payment_enabled"
            defaultChecked={s.offline_payment_enabled}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{t("offlinePaymentEnabled")}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{t("offlinePaymentEnabledHint")}</span>
          </span>
        </label>
        <Input label="Bank name" name="payment_bank_name" defaultValue={s.payment_bank_name ?? ""} />
        <Input label="Account name" name="payment_account_name" defaultValue={s.payment_account_name ?? ""} />
        <Input label="Account number" name="payment_account_number" defaultValue={s.payment_account_number ?? ""} />
        <Input label="IBAN" name="payment_iban" defaultValue={s.payment_iban ?? ""} />
        <Input label="SWIFT / BIC" name="payment_swift" defaultValue={s.payment_swift ?? ""} />
        <Input label="Currency" name="payment_currency" defaultValue={s.payment_currency ?? "USD"} />
        <TextArea
          label="Payment instructions (EN)"
          name="payment_instructions_en"
          defaultValue={s.payment_instructions_en ?? ""}
          rows={4}
        />
        <TextArea
          label="Payment instructions (Dari)"
          name="payment_instructions_dari"
          defaultValue={s.payment_instructions_dari ?? ""}
          rows={3}
        />
        <TextArea
          label="Payment instructions (Pashto)"
          name="payment_instructions_pashto"
          defaultValue={s.payment_instructions_pashto ?? ""}
          rows={3}
        />
        <TextArea
          label="WhatsApp prefilled note (after booking submit)"
          name="payment_whatsapp_note_en"
          defaultValue={s.payment_whatsapp_note_en ?? ""}
          rows={3}
        />

        <h2 className="pt-4 font-medium">HesabPay online payments</h2>
        <p className="text-xs text-muted-foreground">
          Enable secure online checkout. Offline bank transfer remains available. API credentials are stored server-side only.
        </p>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
          <input type="checkbox" name="hesabpay_enabled" defaultChecked={Boolean(s.hesabpay_enabled)} className="mt-1" />
          <span>
            <span className="block font-medium">Enable HesabPay on the booking flow</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Guests can pay after submit when you set a payable amount on their booking.
            </span>
          </span>
        </label>

        <button type="submit" className="mt-4 w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
          {t("save")}
        </button>
      </AdminSubmitForm>

      <AdminSubmitForm
        action={updateHesabPaySettings}
        successMessage="HesabPay credentials saved"
        className="grid gap-4 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="font-medium">HesabPay merchant &amp; API settings</h2>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">🔒 Protected credentials.</span> Changes require your current admin password and are recorded without storing secret values in the audit log.
        </p>
        <p className="text-xs text-muted-foreground">
          Register this webhook URL in your HesabPay Developer Portal:{" "}
          <code className="break-all rounded bg-muted px-1 py-0.5 text-[11px]">{webhookUrl}</code>
        </p>
        <label className="grid gap-1 text-sm">
          <span>Environment</span>
          <select
            name="environment"
            defaultValue={hesab?.environment ?? "sandbox"}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </label>
        <Input
          label="Sandbox API base URL"
          name="sandbox_api_base_url"
          defaultValue={hesab?.sandbox_api_base_url ?? "https://api-sandbox.hesab.com"}
        />
        <Input
          label="Production API base URL"
          name="production_api_base_url"
          defaultValue={hesab?.production_api_base_url ?? "https://api.hesab.com"}
        />
        <Input label="Merchant ID" name="merchant_id" defaultValue={hesab?.merchant_id ?? ""} />
        <label className="grid gap-1 text-sm">
          <span>API key</span>
          <input
            name="api_key"
            type="password"
            autoComplete="off"
            placeholder={hesab?.api_key ? "•••••••• (leave blank to keep)" : "Enter API key"}
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Merchant PIN (if required)</span>
          <input
            name="merchant_pin"
            type="password"
            autoComplete="off"
            placeholder={hesab?.merchant_pin ? "•••••••• (leave blank to keep)" : "Optional"}
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Webhook secret (optional fallback)</span>
          <input
            name="webhook_secret"
            type="password"
            autoComplete="off"
            placeholder={hesab?.webhook_secret ? "•••••••• (leave blank to keep)" : "Optional"}
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <Input
          label="Allowed checkout hosts (comma-separated)"
          name="allowed_checkout_hosts"
          defaultValue={
            hesab?.allowed_checkout_hosts ??
            "api.hesab.com,sandbox-api.hesab.com,pay.hesab.com,checkout.hesab.com"
          }
        />
        <label className="grid gap-1 text-sm">
          <span>Current admin password (required for credential changes)</span>
          <input
            name="current_password"
            type="password"
            autoComplete="current-password"
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Type SAVE PAYMENT CREDENTIALS to confirm a credential change</span>
          <input
            name="credential_confirmation"
            autoComplete="off"
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <button type="submit" className="mt-2 w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
          Save HesabPay credentials
        </button>
      </AdminSubmitForm>
    </div>
  );
}

function Input({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue: string; type?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className="rounded-lg border border-border bg-background px-3 py-2" />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="rounded-lg border border-border bg-background px-3 py-2" />
    </label>
  );
}
