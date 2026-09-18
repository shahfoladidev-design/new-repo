"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isUsableImageUrl, resolveImageSrc } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

type CmsMediaImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

/**
 * CMS image — renders nothing (muted placeholder) when no URL is set or load fails.
 * No default/stock fallback images.
 */
export function CmsMediaImage({ src, alt, className, fill, onError, ...props }: CmsMediaImageProps) {
  const resolvedSrc = resolveImageSrc(src);

  return (
    <CmsMediaImageInner
      key={resolvedSrc ?? "empty"}
      src={resolvedSrc}
      alt={alt}
      className={className}
      fill={fill}
      onError={onError}
      {...props}
    />
  );
}

function CmsMediaImageInner({
  src,
  alt,
  className,
  fill,
  onError,
  ...props
}: Omit<CmsMediaImageProps, "src"> & { src: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn("bg-muted", fill && "absolute inset-0", className)}
        aria-hidden={!alt}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      />
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      className={className}
      src={src}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (isUsableImageUrl(src)) setFailed(true);
      }}
    />
  );
}
