import type { SupabaseClient } from "@supabase/supabase-js";

export type StorageBucketName = "gallery" | "brand" | "journey";

export type StoredObjectRef = {
  bucket: StorageBucketName;
  path: string;
};

const ALLOWED_BUCKETS = new Set<string>(["gallery", "brand", "journey"]);
export const STORAGE_BUCKETS: StorageBucketName[] = ["gallery", "brand", "journey"];
const PUBLIC_MARKER = "/storage/v1/object/public/";

/** Tables that store CMS image URLs in an `image_url` column. */
export const CMS_IMAGE_URL_TABLES = [
  "packages",
  "destinations",
  "package_destinations",
  "blog_posts",
  "services",
  "team_members",
  "tour_departures",
  "gallery_images",
  "hero_slides",
  "destination_attractions",
] as const;

/**
 * Parse a Supabase public storage URL into bucket + object path.
 * Returns null for non-storage / external / local paths.
 */
export function parseSupabaseStoragePublicUrl(url: string | null | undefined): StoredObjectRef | null {
  const value = String(url ?? "").trim();
  if (!value || value.startsWith("/") || value.startsWith("blob:") || value.startsWith("data:")) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const idx = parsed.pathname.indexOf(PUBLIC_MARKER);
    if (idx === -1) return null;

    const rest = decodeURIComponent(parsed.pathname.slice(idx + PUBLIC_MARKER.length));
    const slash = rest.indexOf("/");
    if (slash <= 0) return null;

    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1).replace(/^\/+/, "");
    if (!ALLOWED_BUCKETS.has(bucket) || !path) return null;

    return { bucket: bucket as StorageBucketName, path };
  } catch {
    return null;
  }
}

export function storageObjectKey(ref: StoredObjectRef): string {
  return `${ref.bucket}/${ref.path}`;
}

/** True when any CMS row (or site logo) still points at this exact URL. */
export async function isCmsImageUrlStillReferenced(
  supabase: SupabaseClient,
  url: string,
): Promise<boolean> {
  const target = url.trim();
  if (!target) return false;

  const checks = await Promise.all([
    ...CMS_IMAGE_URL_TABLES.map((table) =>
      supabase.from(table).select("id").eq("image_url", target).limit(1),
    ),
    supabase.from("site_settings").select("id").eq("logo_url", target).limit(1),
  ]);

  return checks.some((result) => (result.data?.length ?? 0) > 0);
}

/**
 * Best-effort delete of a storage object **only if** no CMS row still references the URL.
 * Safe for multi-image pages (gallery, hero slides, highlights): siblings keep their files.
 */
export async function removeStoredCmsImageIfOrphaned(
  supabase: SupabaseClient,
  url: string | null | undefined,
): Promise<{ removed: boolean; reason?: string }> {
  const target = String(url ?? "").trim();
  if (!target) return { removed: false, reason: "empty" };

  const ref = parseSupabaseStoragePublicUrl(target);
  if (!ref) return { removed: false, reason: "not-supabase-storage" };

  try {
    if (await isCmsImageUrlStillReferenced(supabase, target)) {
      return { removed: false, reason: "still-referenced" };
    }

    const { error } = await supabase.storage.from(ref.bucket).remove([ref.path]);
    if (error) return { removed: false, reason: error.message };
    return { removed: true };
  } catch (err) {
    return {
      removed: false,
      reason: err instanceof Error ? err.message : "cleanup-failed",
    };
  }
}

/**
 * Delete an upload that was never saved to the DB.
 * Never deletes `savedUrl` (the last server-known image).
 */
export async function removeUnsavedUploadedFile(
  supabase: SupabaseClient,
  candidateUrl: string | null | undefined,
  savedUrl: string | null | undefined,
): Promise<{ removed: boolean; reason?: string }> {
  const candidate = String(candidateUrl ?? "").trim();
  const saved = String(savedUrl ?? "").trim();
  if (!candidate) return { removed: false, reason: "empty" };
  if (candidate === saved) return { removed: false, reason: "is-saved-url" };

  const ref = parseSupabaseStoragePublicUrl(candidate);
  if (!ref) return { removed: false, reason: "not-supabase-storage" };

  try {
    // Extra safety: if somehow already linked in CMS, leave it.
    if (await isCmsImageUrlStillReferenced(supabase, candidate)) {
      return { removed: false, reason: "still-referenced" };
    }
    const { error } = await supabase.storage.from(ref.bucket).remove([ref.path]);
    if (error) return { removed: false, reason: error.message };
    return { removed: true };
  } catch (err) {
    return {
      removed: false,
      reason: err instanceof Error ? err.message : "cleanup-failed",
    };
  }
}

/**
 * After a successful DB replace/clear: delete the previous storage file when it differs
 * from the new URL and is no longer referenced anywhere.
 */
export async function cleanupReplacedCmsImage(
  supabase: SupabaseClient,
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined,
): Promise<void> {
  const prev = String(previousUrl ?? "").trim();
  const next = String(nextUrl ?? "").trim();
  if (!prev || prev === next) return;
  await removeStoredCmsImageIfOrphaned(supabase, prev);
}

/** Cleanup many URLs (e.g. deleted destination highlights). Dedupes first. */
export async function cleanupOrphanedCmsImages(
  supabase: SupabaseClient,
  urls: Array<string | null | undefined>,
): Promise<void> {
  const unique = [...new Set(urls.map((u) => String(u ?? "").trim()).filter(Boolean))];
  for (const url of unique) {
    await removeStoredCmsImageIfOrphaned(supabase, url);
  }
}

/** Collect every CMS-referenced storage object key (`bucket/path`). */
export async function collectReferencedStorageKeys(supabase: SupabaseClient): Promise<Set<string>> {
  const keys = new Set<string>();
  const addUrl = (url: string | null | undefined) => {
    const ref = parseSupabaseStoragePublicUrl(url);
    if (ref) keys.add(storageObjectKey(ref));
  };

  const tableReads = await Promise.all(
    CMS_IMAGE_URL_TABLES.map((table) => supabase.from(table).select("image_url")),
  );
  for (const result of tableReads) {
    for (const row of result.data ?? []) {
      addUrl((row as { image_url?: string | null }).image_url);
    }
  }

  const { data: settings } = await supabase.from("site_settings").select("logo_url").eq("id", 1).maybeSingle();
  addUrl((settings as { logo_url?: string | null } | null)?.logo_url);

  return keys;
}

async function listBucketObjectPaths(
  supabase: SupabaseClient,
  bucket: StorageBucketName,
  prefix = "",
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) return paths;

  for (const item of data) {
    if (!item.name || item.name === ".emptyFolderPlaceholder") continue;
    const full = prefix ? `${prefix}/${item.name}` : item.name;
    // Folders typically have id === null in Supabase Storage list results.
    const isFolder = item.id === null;
    if (isFolder) {
      paths.push(...(await listBucketObjectPaths(supabase, bucket, full)));
    } else {
      paths.push(full);
    }
  }
  return paths;
}

export type StorageOrphan = {
  bucket: StorageBucketName;
  path: string;
  key: string;
};

/** Compare bucket files to CMS URLs — files with no DB reference are orphans. */
export async function findStorageOrphans(supabase: SupabaseClient): Promise<{
  orphans: StorageOrphan[];
  referencedCount: number;
  scannedCount: number;
}> {
  const referenced = await collectReferencedStorageKeys(supabase);
  const orphans: StorageOrphan[] = [];
  let scannedCount = 0;

  for (const bucket of STORAGE_BUCKETS) {
    const paths = await listBucketObjectPaths(supabase, bucket);
    for (const path of paths) {
      scannedCount += 1;
      const key = `${bucket}/${path}`;
      if (!referenced.has(key)) {
        orphans.push({ bucket, path, key });
      }
    }
  }

  return { orphans, referencedCount: referenced.size, scannedCount };
}

/** Delete orphaned storage objects. Returns how many were removed. */
export async function purgeStorageOrphans(
  supabase: SupabaseClient,
  orphans: StorageOrphan[],
): Promise<{ removed: number; failed: number }> {
  let removed = 0;
  let failed = 0;

  const byBucket = new Map<StorageBucketName, string[]>();
  for (const orphan of orphans) {
    const list = byBucket.get(orphan.bucket) ?? [];
    list.push(orphan.path);
    byBucket.set(orphan.bucket, list);
  }

  for (const [bucket, paths] of byBucket) {
    // Batch in chunks of 100
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { error } = await supabase.storage.from(bucket).remove(chunk);
      if (error) failed += chunk.length;
      else removed += chunk.length;
    }
  }

  return { removed, failed };
}
