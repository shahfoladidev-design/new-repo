import { StorageCleanupClient } from "@/components/admin/storage-cleanup-client";

export default function AdminStoragePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Storage cleanup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find and remove Supabase Storage files that are no longer linked from the dashboard.
        </p>
      </div>
      <StorageCleanupClient />
    </div>
  );
}
