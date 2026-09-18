"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { ILoveAfghanistan } from "@/components/animations/i-love-afghanistan";
import { CmsMediaImage } from "@/components/cms-media-image";
import { isUsableImageUrl } from "@/lib/cms-media";
import { HERO_IMAGE_SIZES, HERO_SECTION_CLASS } from "@/lib/hero-media";
import { normalizeCtaHref } from "@/lib/site-cta-routes";

const AUTO_INTERVAL_MS = 6000;
const SLIDE_MS = 420;

export type HeroSlide = {
  image_url: string;
  title_en: string;
  title_dari?: string | null;
  title_pashto?: string | null;
  subtitle_en?: string | null;
  subtitle_dari?: string | null;
  subtitle_pashto?: string | null;
  cta_primary_label_en?: string | null;
  cta_primary_href?: string | null;
  cta_secondary_label_en?: string | null;
  cta_secondary_href?: string | null;
};

function pickTitle(slide: HeroSlide, locale: Locale) {
  if (locale === "dari" && slide.title_dari) return slide.title_dari;
  if (locale === "ps" && slide.title_pashto) return slide.title_pashto;
  return slide.title_en;
}

function pickSubtitle(slide: HeroSlide, locale: Locale) {
  if (locale === "dari" && slide.subtitle_dari) return slide.subtitle_dari;
  if (locale === "ps" && slide.subtitle_pashto) return slide.subtitle_pashto;
  return slide.subtitle_en ?? "";
}

function HeroCarouselEmpty() {
  return (
    <section className={cn(HERO_SECTION_CLASS, "flex items-center justify-center bg-muted/40")}>
      <ILoveAfghanistan className="opacity-90" />
    </section>
  );
}

function HeroCarouselSlides({
  items,
  locale,
  fallbackPrimaryCta,
  fallbackSecondaryCta,
}: {
  items: HeroSlide[];
  locale: Locale;
  fallbackPrimaryCta: string;
  fallbackSecondaryCta: string;
}) {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const paused = useRef(false);
  const indexRef = useRef(0);
  const flashTimer = useRef<number | null>(null);

  const activeIndex = items.length > 0 ? Math.min(index, items.length - 1) : 0;

  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  const goTo = useCallback(
    (next: number) => {
      const normalized = ((next % items.length) + items.length) % items.length;
      if (normalized === indexRef.current || items.length < 2) return;
      setIndex(normalized);
      setFlash(true);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlash(false), 180);
    },
    [items.length],
  );

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => {
      if (!paused.current) goTo(indexRef.current + 1);
    }, AUTO_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, [items.length, goTo]);

  const slide = items[activeIndex]!;
  const title = pickTitle(slide, locale);
  const subtitle = pickSubtitle(slide, locale);
  const primaryHref = normalizeCtaHref(slide.cta_primary_href, "/packages");
  const secondaryHref = normalizeCtaHref(slide.cta_secondary_href, "/book");
  const primaryLabel = slide.cta_primary_label_en || fallbackPrimaryCta;
  const secondaryLabel = slide.cta_secondary_label_en || fallbackSecondaryCta;

  const trackOffset = `calc(-${activeIndex * 100}% + ${dragging ? dragPx : 0}px)`;

  return (
    <section
      className={HERO_SECTION_CLASS}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        touchDelta.current = 0;
        paused.current = true;
        setDragging(true);
      }}
      onTouchMove={(e) => {
        const delta = e.touches[0].clientX - touchStartX.current;
        touchDelta.current = delta;
        setDragPx(delta * 0.35);
      }}
      onTouchEnd={() => {
        if (touchDelta.current > 56) prev();
        else if (touchDelta.current < -56) next();
        touchDelta.current = 0;
        setDragPx(0);
        setDragging(false);
        paused.current = false;
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full will-change-transform"
          style={{
            transform: `translate3d(${trackOffset}, 0, 0)`,
            transition: dragging ? "none" : `transform ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="relative h-full w-full min-w-full shrink-0 overflow-hidden"
              aria-hidden={i !== activeIndex}
            >
              <CmsMediaImage
                src={item.image_url}
                alt={pickTitle(item, locale)}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                className="object-cover object-center"
                sizes={HERO_IMAGE_SIZES}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-black/40 to-black/55" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[2] bg-white transition-opacity duration-150",
            flash ? "opacity-30" : "opacity-0",
          )}
          aria-hidden
        />
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="pressable absolute start-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 sm:inline-flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="pressable absolute end-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 sm:inline-flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="hero-dots absolute start-1/2 z-20 flex -translate-x-1/2 gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "pressable h-2.5 rounded-full border border-white/40 transition-all duration-200",
                  i === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70",
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-[2.75rem] pt-4 sm:px-6 sm:pb-8 md:pb-6">
        <div
          key={activeIndex}
          className="hero-copy"
          style={{ animation: "heroCopySnap 280ms ease-out" }}
        >
          <h1 className="hero-copy__title">{title}</h1>
          <p className="hero-copy__subtitle">{subtitle || "\u00a0"}</p>
          <div className="hero-copy__actions">
            <Link href={primaryHref} className="btn-hero-primary hero-copy__cta pressable">
              {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="btn-ghost-hero hero-copy__cta pressable">
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>

      <ILoveAfghanistan key={activeIndex} />
    </section>
  );
}

export function HeroCarousel({
  slides,
  locale,
  fallbackPrimaryCta,
  fallbackSecondaryCta,
}: {
  slides: HeroSlide[];
  locale: Locale;
  fallbackPrimaryCta: string;
  fallbackSecondaryCta: string;
}) {
  const items = slides.filter((slide) => isUsableImageUrl(slide.image_url));
  if (items.length === 0) return <HeroCarouselEmpty />;

  return (
    <HeroCarouselSlides
      items={items}
      locale={locale}
      fallbackPrimaryCta={fallbackPrimaryCta}
      fallbackSecondaryCta={fallbackSecondaryCta}
    />
  );
}
