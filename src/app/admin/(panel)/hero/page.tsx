import { requireAdmin } from "@/lib/admin/auth";
import { HeroSlidesAdminClient } from "@/components/admin/hero-slides-admin";
import { HERO_UPLOAD_SPECS } from "@/lib/hero-media";

export default async function AdminHeroPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("hero_slides").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hero slides</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Homepage carousel backgrounds, titles, and the two buttons on each slide.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{HERO_UPLOAD_SPECS}</p>
      </div>
      <HeroSlidesAdminClient items={(data ?? []) as never} />
    </div>
  );
}
