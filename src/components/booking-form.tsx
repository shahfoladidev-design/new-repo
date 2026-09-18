"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitBookingRequest } from "@/app/admin/actions/bookings";
import {
  buildBookingWhatsAppUrl,
  offerSelectValue,
  parseOfferSelectValue,
  type BookingOfferOption,
} from "@/lib/booking-offers";
import { BookingOfferPicker } from "@/components/booking-offer-picker";
import { GuideLanguageSelect } from "@/components/guide-language-select";
import { HesabPayPaymentPanel } from "@/components/hesabpay-pay-button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { PackageTierCards } from "@/components/package-tier-cards";
import { hasVipTier, packageHasVipChoice, packageTierLabel, type PackageTier } from "@/lib/package-tiers";

type BookingFormProps = {
  selectedValue?: string;
  offers: BookingOfferOption[];
  whatsapp: string;
  whatsappNote?: string | null;
  hesabPayEnabled?: boolean;
  offlinePaymentEnabled?: boolean;
};

export function BookingForm({
  selectedValue = "",
  offers,
  whatsapp,
  whatsappNote,
  hesabPayEnabled = false,
  offlinePaymentEnabled = true,
}: BookingFormProps) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [referenceValue, setReferenceValue] = useState(selectedValue || "");
  const [packageTier, setPackageTier] = useState<PackageTier>("standard");
  const [successMeta, setSuccessMeta] = useState<{
    referenceCode: string | null;
    referenceTitle: string | null;
    fullName: string;
    packageTier: PackageTier | null;
    paymentAccessToken: string;
    referencePriceMinor: number | null;
    referencePriceCurrency: string | null;
    quotedAmountMinor: number | null;
    quotedCurrency: string | null;
  } | null>(null);

  const selectedOffer = useMemo(
    () => offers.find((o) => offerSelectValue(o) === referenceValue) ?? null,
    [offers, referenceValue],
  );

  const isPackageSelection =
    referenceValue !== "custom" &&
    referenceValue !== "" &&
    parseOfferSelectValue(referenceValue)?.kind === "package";

  const hasVipOption = isPackageSelection && selectedOffer != null && packageHasVipChoice(selectedOffer);
  const showOfflinePaymentFlow = offlinePaymentEnabled;
  const showOnlinePaymentFlow = hesabPayEnabled;
  const onlineOnlyPayment = showOnlinePaymentFlow && !showOfflinePaymentFlow;

  const successBodyKey =
    onlineOnlyPayment ? "successBodyOnline" : showOnlinePaymentFlow && showOfflinePaymentFlow ? "successBodyHybrid" : "successBody";
  const paymentNotesHintKey =
    onlineOnlyPayment
      ? "paymentNotesHintOnline"
      : showOnlinePaymentFlow && showOfflinePaymentFlow
        ? "paymentNotesHintHybrid"
        : "paymentNotesHint";
  const paymentNotesPlaceholderKey = onlineOnlyPayment ? "paymentNotesPlaceholderOnline" : "paymentNotesPlaceholder";

  // Resetting derived state during render (rather than in an effect) keeps the form
  // from painting one frame with the previous selection's reference or tier.
  const [prevSelectedValue, setPrevSelectedValue] = useState(selectedValue);
  if (prevSelectedValue !== selectedValue) {
    setPrevSelectedValue(selectedValue);
    setReferenceValue(selectedValue || "");
  }

  const [tierResetFor, setTierResetFor] = useState(referenceValue);
  if (tierResetFor !== referenceValue) {
    setTierResetFor(referenceValue);
    setPackageTier("standard");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!formData.get("agreement")) {
      setErrorMsg(t("agreementRequired"));
      setStatus("error");
      return;
    }
    if (!String(formData.get("reference") || "").trim()) {
      setErrorMsg(t("referencePlaceholder"));
      setStatus("error");
      return;
    }

    if (isPackageSelection) {
      const tierFromForm = String(formData.get("package_tier") ?? "").trim();
      const tier: PackageTier =
        tierFromForm === "vip" && hasVipOption ? "vip" : "standard";
      formData.set("package_tier", tier);
      setPackageTier(tier);
    } else {
      formData.delete("package_tier");
    }

    setStatus("loading");
    const result = await submitBookingRequest(formData);
    if (!result.ok) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    const submittedTier = isPackageSelection
      ? (String(formData.get("package_tier")) as PackageTier)
      : null;

    setSuccessMeta({
      referenceCode: result.referenceCode,
      referenceTitle: result.referenceTitle,
      fullName: result.fullName,
      packageTier: submittedTier,
      paymentAccessToken: result.paymentAccessToken,
      referencePriceMinor: result.referencePriceMinor,
      referencePriceCurrency: result.referencePriceCurrency,
      quotedAmountMinor: result.quotedAmountMinor,
      quotedCurrency: result.quotedCurrency,
    });
    setStatus("success");
  }

  if (status === "success" && successMeta) {
    const waUrl = showOfflinePaymentFlow
      ? buildBookingWhatsAppUrl({
          whatsapp,
          referenceCode: successMeta.referenceCode,
          referenceTitle: successMeta.referenceTitle,
          fullName: successMeta.fullName,
          packageTier: successMeta.packageTier,
          note: whatsappNote,
        })
      : null;
    const tierText = packageTierLabel(successMeta.packageTier);

    return (
      <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <p className="font-medium">{tc("success")}</p>
        <p className="text-sm">{t(successBodyKey)}</p>
        {(successMeta.referenceCode || successMeta.referenceTitle) && (
          <p className="text-sm">
            <span className="font-medium">{t("yourReference")}: </span>
            <span className="font-mono font-semibold">
              {[successMeta.referenceCode, successMeta.referenceTitle].filter(Boolean).join(" — ")}
            </span>
          </p>
        )}
        {tierText ? (
          <p className="text-sm">
            <span className="font-medium">{t("packageTierTitle")}: </span>
            <span className="font-semibold">{tierText}</span>
          </p>
        ) : null}
        {showOfflinePaymentFlow && waUrl ? (
          <>
            <p className="text-sm">{t("whatsappNext")}</p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t("whatsappConfirm")}
            </a>
          </>
        ) : null}
        {showOnlinePaymentFlow ? (
          <div className={showOfflinePaymentFlow ? "border-t border-emerald-200 pt-4" : undefined}>
            <HesabPayPaymentPanel
              paymentAccessToken={successMeta.paymentAccessToken}
              hesabPayEnabled={hesabPayEnabled}
              referencePriceMinor={successMeta.referencePriceMinor}
              referencePriceCurrency={successMeta.referencePriceCurrency}
              quotedAmountMinor={successMeta.quotedAmountMinor}
              quotedCurrency={successMeta.quotedCurrency}
              amountPaidMinor={0}
              paymentStatus="unpaid"
              compact
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid min-w-0 gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:rounded-3xl sm:p-6 md:p-8"
    >
      <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">
        <Field label={t("fullName")} name="full_name" required />
        <Field label={t("email")} name="email" type="email" required />
        <Field label={t("phone")} name="phone" required />
        <Field label={t("travelDate")} name="travel_date" type="date" />
        <Field label={t("travelers")} name="travelers" type="number" defaultValue="1" min={1} />
        <Field label={t("nationality")} name="nationality" placeholder={t("nationalityPlaceholder")} />
        <label className="grid min-w-0 gap-1.5 text-sm sm:gap-2">
          <span>{t("preferredLanguage")}</span>
          <GuideLanguageSelect anyLabel={t("languageAny")} otherLabel={t("languageOther")} />
        </label>
        <div className="grid min-w-0 gap-1.5 text-sm sm:gap-2 md:col-span-2">
          <span>{t("reference")}</span>
          <BookingOfferPicker
            offers={offers}
            defaultValue={selectedValue || ""}
            required
            onValueChange={setReferenceValue}
          />
          <span className="text-xs text-muted-foreground">{t("referenceHint")}</span>
        </div>
      </div>

      {isPackageSelection && selectedOffer ? (
        <div className="grid min-w-0 gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div>
            <p className="text-sm font-semibold">{t("packageTierTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasVipOption ? t("packageTierChoose") : t("packageTierHint")}
            </p>
          </div>
          <PackageTierCards
            pkg={selectedOffer}
            locale={locale}
            selectedTier={packageTier}
            onSelectTier={setPackageTier}
            choiceMode={hasVipOption}
            bookingMode
          />
        </div>
      ) : null}

      <label className="grid min-w-0 gap-1.5 text-sm sm:gap-2">
        <span>{t("paymentNotes")}</span>
        <textarea
          name="payment_notes"
          rows={2}
          placeholder={t(paymentNotesPlaceholderKey)}
          className="w-full min-w-0 max-w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm sm:rounded-xl"
        />
        <span className="text-xs text-muted-foreground">{t(paymentNotesHintKey)}</span>
      </label>
      <label className="grid min-w-0 gap-1.5 text-sm sm:gap-2">
        <span>{t("message")}</span>
        <textarea
          name="message"
          rows={3}
          className="w-full min-w-0 max-w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm sm:rounded-xl"
        />
      </label>
      <label className="flex items-start gap-2.5 text-sm sm:gap-3">
        <input type="checkbox" name="agreement" required className="mt-1 shrink-0" />
        <span>
          {t("agreementAcceptPrefix")}{" "}
          <Link href="/agreements" target="_blank" className="underline">
            {t("agreementLinkText")}
          </Link>{" "}
          {t("agreementAcceptSuffix")}
        </span>
      </label>
      {status === "error" && <p className="text-sm text-red-600">{errorMsg || tc("error")}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:w-fit"
      >
        {status === "loading" ? tc("loading") : tc("submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  min,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  min?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm sm:gap-2">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        min={min}
        placeholder={placeholder}
        className="w-full min-w-0 max-w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm sm:rounded-xl"
      />
    </label>
  );
}
