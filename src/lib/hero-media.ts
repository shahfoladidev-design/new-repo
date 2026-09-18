export const HERO_ASPECT = 16 / 9;
export const HERO_OUTPUT_WIDTH = 2400;
export const HERO_OUTPUT_HEIGHT = 1350;
export const HERO_JPEG_QUALITY = 85;
export const HERO_UPLOAD_MAX_MB = 20;
export const HERO_UPLOAD_FORMATS = "JPEG, PNG, WebP, or GIF";

/** Admin copy — formats, file limit, and processed output size. */
export const HERO_UPLOAD_SPECS = `Accepted formats: ${HERO_UPLOAD_FORMATS}. Max ${HERO_UPLOAD_MAX_MB} MB. Saved as ${HERO_OUTPUT_WIDTH}×${HERO_OUTPUT_HEIGHT}px (16:9 JPEG); larger or off-ratio images are center-cropped.`;

export const HERO_UPLOAD_HINT = `${HERO_UPLOAD_SPECS} Preview matches the live homepage.`;

/** Public carousel + empty-state frame */
export const HERO_SECTION_CLASS =
  "hero-frame relative isolate w-full aspect-[16/9] min-h-[300px] max-h-[760px] shrink-0 overflow-hidden [contain:layout_size]";

/** Admin upload preview frame */
export const HERO_PREVIEW_FRAME_CLASS = "aspect-[16/9] w-full max-w-xl";

/** next/image sizes — hero frame caps at 760px tall → ~1350px wide at 16:9 */
export const HERO_IMAGE_SIZES = "(max-width: 768px) 100vw, 1350px";

/** Detail page cover banners (max-w-5xl container) */
export const DETAIL_COVER_SIZES = "(max-width: 768px) 100vw, 1024px";

/** Detail page highlight cards — two-col grid inside a max-w-5xl container */
export const HIGHLIGHT_CARD_SIZES = "(max-width: 767px) 100vw, 640px";
