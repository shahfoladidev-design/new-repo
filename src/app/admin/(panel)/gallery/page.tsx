import { requireAdmin } from "@/lib/admin/auth";
import { GalleryAdminClient } from "@/components/admin/gallery-admin";

export default async function AdminGalleryPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("gallery_images").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gallery</h1>
      <GalleryAdminClient items={data ?? []} />
    </div>
  );
}
