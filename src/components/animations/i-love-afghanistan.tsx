"use client";

import { cn } from "@/lib/utils";

/** Classic airport / souvenir “I ♥ Afghanistan” sticker — not a UI button. */
export function ILoveAfghanistan({ className }: { className?: string }) {
  return (
    <div className={cn("hero-sticker pointer-events-none absolute z-30", className)} aria-hidden>
      <div className="hero-sticker__scale">
        <div className="i-love-afg inline-flex items-center gap-1.5 px-3 py-2 sm:gap-2 sm:px-4 sm:py-2.5 md:gap-2.5 md:px-5 md:py-3">
          <span className="font-display text-sm font-extrabold tracking-wide text-[#1a1a1a] sm:text-base md:text-xl">
            I
          </span>
          <svg
            className="i-love-afg__heart h-4 w-4 shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6"
            viewBox="0 0 24 24"
            fill="#e11d48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21s-6.7-4.35-9.33-8.1C.8 10.1 1.5 6.6 4.4 5.15 6.3 4.2 8.55 4.65 10 6.2L12 8.35 14 6.2c1.45-1.55 3.7-2 5.6-1.05 2.9 1.45 3.6 4.95 1.73 7.75C18.7 16.65 12 21 12 21z" />
          </svg>
          <span className="font-display text-sm font-extrabold tracking-[0.08em] text-[#1a1a1a] sm:text-base md:text-xl">
            AFGHANISTAN
          </span>
        </div>
      </div>
    </div>
  );
}
