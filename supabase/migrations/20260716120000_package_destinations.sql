-- Package destinations junction table + province_slug on packages
-- Also adds admin_seen to contact_submissions for gap fix

-- 1. Add province reference to packages
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS province_slug text;

-- 2. Junction table: which destinations are in which package, with per-destination days
CREATE TABLE IF NOT EXISTS public.package_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  days int,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(package_id, destination_id)
);

-- 3. RLS policies
ALTER TABLE public.package_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read package_destinations"
  ON public.package_destinations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage package_destinations"
  ON public.package_destinations
  FOR ALL
  TO authenticated
  USING (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  WITH CHECK (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- 4. Add admin_seen to contact_submissions (gap fix)
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS admin_seen boolean NOT NULL DEFAULT false;
