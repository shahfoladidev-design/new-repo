"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
  variant?: "rise" | "scale" | "slide";
  /** When false, animate only the first time the block enters the viewport */
  repeat?: boolean;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  variant = "rise",
  repeat = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("scroll-reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("scroll-reveal-visible");
          if (!repeat) observer.unobserve(el);
        } else if (repeat) {
          el.classList.remove("scroll-reveal-visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [repeat]);

  return (
    <Tag
      ref={ref as never}
      className={cn("scroll-reveal", `scroll-reveal-${variant}`, className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
