"use client";

import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

type WhatsAppFloatProps = {
  whatsapp: string;
};

export function WhatsAppFloat({ whatsapp }: WhatsAppFloatProps) {
  const t = useTranslations("contact");
  const wa = whatsapp.replace(/\D/g, "") || "937000000000";

  return (
    <a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 end-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-1.5 sm:bottom-5 sm:end-5"
      aria-label={t("whatsappHelp")}
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0 text-[#25D366] drop-shadow-sm sm:h-7 sm:w-7" />
      <span className="truncate text-[10px] font-medium leading-tight text-[#25D366] drop-shadow-sm sm:text-[11px]">
        {t("whatsappHelp")}
      </span>
    </a>
  );
}
