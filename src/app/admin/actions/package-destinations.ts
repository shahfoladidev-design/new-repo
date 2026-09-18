"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

type PackageDestEntry = {
  destination_id: string;
  days: number | null;
  sort_order: number;
  image_url?: string | null;
};

export async function getPackageDestinations(packageId: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("package_destinations")
    .select("id, destination_id, days, sort_order, image_url, destinations(id, slug, title_en)")
    .eq("package_id", packageId)
    .order("sort_order");

  return (data ?? []).map((row) => ({
    id: row.id,
    destination_id: row.destination_id,
    days: row.days,
    sort_order: row.sort_order,
    image_url: (row.image_url as string | null) ?? "",
    dest_title: (row.destinations as unknown as Record<string, unknown> | null)?.title_en as string ?? "",
    dest_slug: (row.destinations as unknown as Record<string, unknown> | null)?.slug as string ?? "",
  }));
}

export async function setPackageDestinations(packageId: string, entries: PackageDestEntry[]) {
  const { supabase } = await requireAdmin();

  await supabase.from("package_destinations").delete().eq("package_id", packageId);

  if (entries.length > 0) {
    const rows = entries.map((e) => ({
      package_id: packageId,
      destination_id: e.destination_id,
      days: e.days,
      sort_order: e.sort_order,
      image_url: e.image_url?.trim() || null,
    }));
    await supabase.from("package_destinations").insert(rows);
  }

  revalidatePath("/admin/packages");
  const { revalidateContentTable } = await import("@/lib/revalidate-cms");
  revalidateContentTable("packages");
}
