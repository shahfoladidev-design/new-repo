import { describe, expect, it } from "vitest";
import {
  parseSupabaseStoragePublicUrl,
  storageObjectKey,
  cleanupReplacedCmsImage,
  removeUnsavedUploadedFile,
} from "@/lib/admin/storage-cleanup";

describe("parseSupabaseStoragePublicUrl", () => {
  it("parses gallery and brand public URLs", () => {
    expect(
      parseSupabaseStoragePublicUrl(
        "https://abc.supabase.co/storage/v1/object/public/gallery/hero/123-abcd.jpg",
      ),
    ).toEqual({ bucket: "gallery", path: "hero/123-abcd.jpg" });

    expect(
      parseSupabaseStoragePublicUrl(
        "https://abc.supabase.co/storage/v1/object/public/brand/logo-1.png",
      ),
    ).toEqual({ bucket: "brand", path: "logo-1.png" });
  });

  it("rejects local, external, and empty URLs", () => {
    expect(parseSupabaseStoragePublicUrl("/media/x.jpg")).toBeNull();
    expect(parseSupabaseStoragePublicUrl("https://images.unsplash.com/photo.jpg")).toBeNull();
    expect(parseSupabaseStoragePublicUrl("")).toBeNull();
    expect(parseSupabaseStoragePublicUrl(null)).toBeNull();
  });

  it("rejects unknown buckets", () => {
    expect(
      parseSupabaseStoragePublicUrl(
        "https://abc.supabase.co/storage/v1/object/public/other/file.jpg",
      ),
    ).toBeNull();
  });

  it("builds storage object keys", () => {
    expect(storageObjectKey({ bucket: "gallery", path: "hero/a.jpg" })).toBe("gallery/hero/a.jpg");
  });
});

describe("cleanup helpers with mock supabase", () => {
  function mockSupabase(opts: {
    referenced?: boolean;
    removeError?: string | null;
  }) {
    const removed: Array<{ bucket: string; paths: string[] }> = [];
    const supabase = {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  limit() {
                    return Promise.resolve({
                      data: opts.referenced ? [{ id: "1" }] : [],
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      },
      storage: {
        from(bucket: string) {
          return {
            remove(paths: string[]) {
              removed.push({ bucket, paths });
              return Promise.resolve({
                data: null,
                error: opts.removeError ? { message: opts.removeError } : null,
              });
            },
          };
        },
      },
    };
    return { supabase: supabase as never, removed };
  }

  it("cleanupReplacedCmsImage skips when URLs match", async () => {
    const { supabase, removed } = mockSupabase({});
    const url = "https://abc.supabase.co/storage/v1/object/public/gallery/a.jpg";
    await cleanupReplacedCmsImage(supabase, url, url);
    expect(removed).toHaveLength(0);
  });

  it("cleanupReplacedCmsImage removes previous when unreferenced", async () => {
    const { supabase, removed } = mockSupabase({ referenced: false });
    const prev = "https://abc.supabase.co/storage/v1/object/public/gallery/old.jpg";
    const next = "https://abc.supabase.co/storage/v1/object/public/gallery/new.jpg";
    await cleanupReplacedCmsImage(supabase, prev, next);
    expect(removed).toEqual([{ bucket: "gallery", paths: ["old.jpg"] }]);
  });

  it("cleanupReplacedCmsImage keeps previous when still referenced", async () => {
    const { supabase, removed } = mockSupabase({ referenced: true });
    const prev = "https://abc.supabase.co/storage/v1/object/public/gallery/shared.jpg";
    const next = "https://abc.supabase.co/storage/v1/object/public/gallery/new.jpg";
    await cleanupReplacedCmsImage(supabase, prev, next);
    expect(removed).toHaveLength(0);
  });

  it("removeUnsavedUploadedFile never deletes the saved URL", async () => {
    const { supabase, removed } = mockSupabase({ referenced: false });
    const saved = "https://abc.supabase.co/storage/v1/object/public/gallery/saved.jpg";
    const result = await removeUnsavedUploadedFile(supabase, saved, saved);
    expect(result.removed).toBe(false);
    expect(result.reason).toBe("is-saved-url");
    expect(removed).toHaveLength(0);
  });

  it("removeUnsavedUploadedFile deletes a different unsaved upload", async () => {
    const { supabase, removed } = mockSupabase({ referenced: false });
    const saved = "https://abc.supabase.co/storage/v1/object/public/gallery/saved.jpg";
    const unsaved = "https://abc.supabase.co/storage/v1/object/public/gallery/temp.jpg";
    const result = await removeUnsavedUploadedFile(supabase, unsaved, saved);
    expect(result.removed).toBe(true);
    expect(removed).toEqual([{ bucket: "gallery", paths: ["temp.jpg"] }]);
  });
});
