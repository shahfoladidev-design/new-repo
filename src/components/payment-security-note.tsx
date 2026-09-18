"use client";

import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";

export function PaymentSecurityNote() {
  const t = useTranslations("booking");

  return (
    <aside className="flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{t("paymentProtectedTitle")}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {t("paymentProtectedBody")}{" "}
          <a className="underline decoration-primary/40 underline-offset-2 hover:text-primary" href="mailto:bookings@shahfoladi.com">
            bookings@shahfoladi.com
          </a>
          .
        </p>
      </div>
    </aside>
  );
}
