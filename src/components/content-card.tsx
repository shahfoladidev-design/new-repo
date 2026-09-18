"use client";

import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { isUsableImageUrl } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

type ContentCardProps = {
  href: string;
  title: string;
  summary?: string;
  imageUrl?: string | null;
  meta?: string;
  cta?: string;
  bookHref?: string;
  bookLabel?: string;
  className?: string;
};

export function ContentCard({
  href,
  title,
  summary,
  imageUrl,
  meta,
  cta = "Learn more",
  bookHref,
  bookLabel = "Book now",
  className,
}: ContentCardProps) {
  const initialSrc = isUsableImageUrl(imageUrl) ? imageUrl : null;
  const [src, setSrc] = useState(initialSrc);
  const showImage = Boolean(src);

  return (
    <article
      className={cn(
        "group pressable flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={title}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="media-zoom relative aspect-[16/10] bg-muted">
          {showImage ? (
            <Image
              src={src!}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={() => setSrc(null)}
            />
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col space-y-3 p-6">
        {meta ? <p className="text-xs uppercase tracking-[0.2em] text-secondary">{meta}</p> : null}
        <Link href={href} className="block focus-visible:outline-none">
          <h3 className="text-xl font-semibold tracking-tight transition group-hover:text-primary">{title}</h3>
        </Link>
        {summary ? <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{summary}</p> : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <Link
            href={href}
            className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {cta}
          </Link>
          {bookHref ? (
            <Link
              href={bookHref}
              className="inline-flex rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-sm font-medium text-primary transition hover:bg-primary/15"
            >
              {bookLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
