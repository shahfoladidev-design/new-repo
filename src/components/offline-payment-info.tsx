import { getTranslations } from "next-intl/server";
import type { SiteSettings } from "@/lib/site-settings";
import { paymentInstructionsForLocale } from "@/lib/site-settings";

export async function OfflinePaymentInfo({
  settings,
  locale,
  title,
}: {
  settings: SiteSettings;
  locale: string;
  title: string;
}) {
  const t = await getTranslations("booking");
  const instructions = paymentInstructionsForLocale(settings, locale);
  const hasBank =
    settings.payment_bank_name ||
    settings.payment_account_name ||
    settings.payment_account_number ||
    settings.payment_iban;

  return (
    <aside className="min-w-0 rounded-2xl border border-border bg-muted/30 p-4 sm:rounded-3xl sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {instructions ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{instructions}</p> : null}

      <div className="mt-5 rounded-xl border border-border/80 bg-background/70 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("paymentHowTitle")}
        </p>
        <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/90">
          <li>{t("paymentStep1")}</li>
          <li>{t("paymentStep2")}</li>
          <li>{t("paymentStep3")}</li>
        </ol>
      </div>

      {hasBank ? (
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {settings.payment_bank_name ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("paymentBank")}</dt>
              <dd className="font-medium">{settings.payment_bank_name}</dd>
            </div>
          ) : null}
          {settings.payment_account_name ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("paymentAccountName")}</dt>
              <dd className="font-medium">{settings.payment_account_name}</dd>
            </div>
          ) : null}
          {settings.payment_account_number ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("paymentAccountNumber")}</dt>
              <dd className="font-mono font-medium">{settings.payment_account_number}</dd>
            </div>
          ) : null}
          {settings.payment_iban ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("paymentIban")}</dt>
              <dd className="font-mono font-medium">{settings.payment_iban}</dd>
            </div>
          ) : null}
          {settings.payment_swift ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("paymentSwift")}</dt>
              <dd className="font-mono font-medium">{settings.payment_swift}</dd>
            </div>
          ) : null}
          {settings.payment_currency ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("paymentCurrency")}</dt>
              <dd className="font-medium">{settings.payment_currency}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{t("paymentDetailsPending")}</p>
      )}

      <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {t("paymentOfflineWarning")}
      </p>
    </aside>
  );
}
