"use client";

import { cn } from "@/lib/utils";

/** Soft map-pin pulse — second travel motion accent. */
export function MapPinPulse({ className }: { className?: string }) {
  return (
    <span className={cn("map-pin-pulse relative inline-flex h-10 w-10 items-center justify-center", className)} aria-hidden>
      <span className="map-pin-pulse__ring absolute inset-0 rounded-full bg-primary/15" />
      <svg viewBox="0 0 28 40" className="map-pin-pulse__pin relative h-7 w-5 text-primary" fill="none">
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z"
          fill="currentColor"
        />
        <circle cx="14" cy="14" r="5" fill="var(--background, #fff)" />
      </svg>
    </span>
  );
}
