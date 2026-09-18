/**
 * Canonical Shah Foladi / Peace Hope brand palette.
 * Used as CSS defaults, admin color fallbacks, and DB coalescing.
 */
export const BRAND_COLORS = {
  primary: "#cb9274",
  secondary: "#a8755a",
  accent: "#e0d7c9",
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;

/**
 * Fixed logo frame for header and admin upload preview.
 * Display box: 6rem (height) × 6.5rem (width).
 */
export const LOGO_FRAME = {
  heightRem: 6,
  widthRem: 6.5,
  className: "h-[6rem] w-[6.5rem]",
  /** Bottom-align in frame so the mark sits flush above the search bar */
  imageClassName: "m-0 block h-full w-full p-0 object-contain object-bottom",
} as const;
