"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm } from "@/app/actions/public-forms";

export function ContactForm() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    const result = await submitContactForm(formData);
    if (!result.ok) {
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{tc("success")}</p>;
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:p-8">
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("fullName")} name="full_name" required />
        <Field label={t("email")} name="email" type="email" required />
        <Field label={t("phone")} name="phone" />
        <Field label={t("subject")} name="subject" />
      </div>
      <label className="grid gap-2 text-sm">
        <span>{t("message")}</span>
        <textarea name="message" rows={5} required className="rounded-xl border border-border bg-background px-3 py-2" />
      </label>
      {status === "error" && <p className="text-sm text-red-600">{tc("error")}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-xl border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
