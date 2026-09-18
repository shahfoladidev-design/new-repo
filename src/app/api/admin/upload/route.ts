import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin/is-admin-user";
import { storageWriteClient, uploadToBucket, type StorageBucket } from "@/lib/admin/upload";

export const runtime = "nodejs";

const BUCKETS = new Set<StorageBucket>(["gallery", "brand", "journey"]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Your admin session expired. Please sign in again." }, { status: 401 });
    }

    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const bucketRaw = String(formData.get("bucket") ?? "gallery");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file selected" }, { status: 400 });
    }

    if (!BUCKETS.has(bucketRaw as StorageBucket)) {
      return NextResponse.json({ error: "Invalid storage bucket" }, { status: 400 });
    }

    // Same-origin + service-role write avoids browser Tracking Prevention / Storage RLS flakes.
    const uploaded = await uploadToBucket(
      storageWriteClient(supabase),
      file,
      bucketRaw as StorageBucket,
    );
    if (!uploaded.ok) {
      return NextResponse.json({ error: uploaded.error }, { status: 400 });
    }

    return NextResponse.json({ url: uploaded.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
