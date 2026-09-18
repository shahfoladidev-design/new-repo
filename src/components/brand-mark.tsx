import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LOGO_FRAME } from "@/lib/brand";
import { isRemoteLogo } from "@/lib/logo";
import { cn } from "@/lib/utils";

/** Server-rendered logo — included in HTML on first paint (no hydration wait). */
export async function BrandMark({
  src,
  className,
  onClick,
}: {
  src: string | null;
  className?: string;
  onClick?: () => void;
}) {
  const t = await getTranslations();
  const width = Math.round(LOGO_FRAME.widthRem * 16);
  const height = Math.round(LOGO_FRAME.heightRem * 16);

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "brand-mark m-0 inline-flex shrink-0 items-end justify-center p-0 leading-none",
        LOGO_FRAME.className,
        !src && "border border-dashed border-border/60 bg-muted/20",
        className,
      )}
      aria-label={src ? t("brand") : undefined}
    >
      {src ? (
        isRemoteLogo(src) ? (
          // Optimized: admin logos are often multi-hundred-KB PNGs, and this renders
          // at ~104px on every page. `priority` emits its own preload for this URL.
          <Image
            src={src}
            alt={t("brand")}
            width={width}
            height={height}
            sizes={`${width}px`}
            priority
            fetchPriority="high"
            className={LOGO_FRAME.imageClassName}
          />
        ) : (
          <img
            src={src}
            alt={t("brand")}
            width={width}
            height={height}
            decoding="async"
            fetchPriority="high"
            className={LOGO_FRAME.imageClassName}
          />
        )
      ) : (
        <span className="sr-only">{t("brand")}</span>
      )}
    </Link>
  );
}
