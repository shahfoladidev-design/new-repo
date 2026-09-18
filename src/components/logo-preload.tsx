import { isRemoteLogo } from "@/lib/logo";

/**
 * Preload for locally-served logos only. Remote (admin-uploaded) logos go through
 * next/image, which emits its own preload for the *optimized* URL — preloading the
 * original here would download the full-size PNG a second time.
 */
export function LogoPreload({ src }: { src: string | null }) {
  if (!src || isRemoteLogo(src)) return null;
  return <link rel="preload" as="image" href={src} fetchPriority="high" />;
}
