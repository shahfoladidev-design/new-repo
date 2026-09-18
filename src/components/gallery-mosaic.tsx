"use client";

import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { isUsableImageUrl } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

export type GalleryMosaicItem = {
  image_url: string;
  title?: string | null;
  location_tag?: string | null;
};

/**
 * Unordered masonry gallery — staggered offsets, natural image heights,
 * soft cover (minimal crop) so photos keep their character.
 */
export function GalleryMosaic({
  items,
  href,
  viewAllHref,
  viewAllLabel,
}: {
  items: GalleryMosaicItem[];
  href?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const usableItems = items.filter((item) => isUsableImageUrl(item.image_url));
  if (usableItems.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        {usableItems.map((item, i) => (
          <MosaicTile
            key={`${item.image_url}-${i}`}
            item={item}
            href={href}
            stagger={i % 5}
          />
        ))}
      </div>
      {viewAllHref && viewAllLabel ? (
        <div className="flex justify-center">
          <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
            {viewAllLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function MosaicTile({
  item,
  href,
  stagger,
}: {
  item: GalleryMosaicItem;
  href?: string;
  stagger: number;
}) {
  const [failed, setFailed] = useState(false);
  const label = item.title || item.location_tag || "Gallery";

  if (failed) return null;

  const offsetClass =
    stagger === 1
      ? "mt-4 sm:mt-8"
      : stagger === 2
        ? "mt-2 sm:mt-4"
        : stagger === 3
          ? "mt-6 sm:mt-10"
          : stagger === 4
            ? "mt-1 sm:mt-3"
            : "mt-0";

  const className = cn(
    "media-zoom group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-muted sm:mb-4",
    offsetClass,
    href &&
      "block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  );

  const media = (
    <>
      <Image
        src={item.image_url}
        alt={label}
        width={900}
        height={1200}
        className="h-auto w-full object-cover object-center"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        onError={() => setFailed(true)}
      />
      {(item.title || item.location_tag) && (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3 pb-3 pt-10 opacity-100 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          {item.location_tag ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
              {item.location_tag}
            </p>
          ) : null}
          {item.title ? <p className="text-sm font-medium text-white">{item.title}</p> : null}
        </figcaption>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {media}
      </Link>
    );
  }

  return <figure className={className}>{media}</figure>;
}
