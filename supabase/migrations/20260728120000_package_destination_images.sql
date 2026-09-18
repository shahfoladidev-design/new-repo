-- Per-province photos for a package.
-- A package previously had a single cover image; admins can now attach one image
-- to each destination (province) inside the package, shown as a gallery on the
-- package detail page. Null keeps the previous behaviour (falls back to the
-- destination's own image, then to nothing).

ALTER TABLE public.package_destinations
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.package_destinations.image_url IS
  'Optional package-specific photo for this destination/province. Falls back to destinations.image_url when null.';
