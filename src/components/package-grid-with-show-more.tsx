"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ContentCard } from "@/components/content-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/utils";
import { interpolate } from "@/lib/i18n-format";

export type PackageGridItem = {
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  meta?: string;
  href: string;
  bookHref?: string;
};

const DEFAULT_PAGE_SIZE = 20;

export function PackageGridWithShowMore({
  items,
  pageSize = DEFAULT_PAGE_SIZE,
  ctaLabel,
  bookLabel,
  className,
}: {
  items: PackageGridItem[];
  pageSize?: number;
  ctaLabel: string;
  bookLabel?: string;
  className?: string;
}) {
  const listKey = useMemo(() => items.map((item) => item.slug).join("|"), [items]);

  return (
    <PackageGridResults
      key={listKey}
      items={items}
      pageSize={pageSize}
      ctaLabel={ctaLabel}
      bookLabel={bookLabel}
      className={className}
    />
  );
}

function PackageGridResults({
  items,
  pageSize,
  ctaLabel,
  bookLabel,
  className,
}: {
  items: PackageGridItem[];
  pageSize: number;
  ctaLabel: string;
  bookLabel?: string;
  className?: string;
}) {
  const t = useTranslations("common");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visible = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item, i) => (
          <ScrollReveal key={item.slug} delay={(i % 6) * 45}>
            <ContentCard
              href={item.href}
              title={item.title}
              summary={item.summary}
              imageUrl={item.imageUrl}
              meta={item.meta}
              cta={ctaLabel}
              bookHref={item.bookHref}
              bookLabel={bookLabel}
            />
          </ScrollReveal>
        ))}
      </div>
      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            className={cn(
              "pressable rounded-full border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/10",
            )}
          >
            {interpolate(t.raw("showMore"), { count: items.length - visibleCount })}
          </button>
        </div>
      ) : null}
    </div>
  );
}
