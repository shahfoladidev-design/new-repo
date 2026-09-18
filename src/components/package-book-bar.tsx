"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  meta?: string | null;
  bookLabel: string;
  bookTargetId?: string;
};

export function PackageBookBar({ title, meta, bookLabel, bookTargetId = "book" }: Props) {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const target = document.getElementById(bookTargetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [bookTargetId]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/75 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 ease-out sm:px-6",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        showBar ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
      aria-hidden={!showBar}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
        </div>
        <Link
          href={`#${bookTargetId}`}
          className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap"
        >
          {bookLabel}
        </Link>
      </div>
    </div>
  );
}
