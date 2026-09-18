import { describe, expect, it } from "vitest";
import { ensureUploadFieldInFormData, requireUsableUploadUrl, resolveUploadUrl } from "./form-upload-url";

const PUBLIC_URL = "https://example.supabase.co/storage/v1/object/public/gallery/hero/test.jpg";

describe("form-upload-url", () => {
  it("prefers ref URL when hidden FormData field is empty", () => {
    const fd = new FormData();
    fd.set("image_url", "");
    const url = resolveUploadUrl(fd, { getUrl: () => PUBLIC_URL, isUploading: () => false, isDirty: () => true, markSaved: () => {} });
    expect(url).toBe(PUBLIC_URL);
  });

  it("falls back to FormData when ref returns empty", () => {
    const fd = new FormData();
    fd.set("image_url", PUBLIC_URL);
    const url = resolveUploadUrl(fd, { getUrl: () => "", isUploading: () => false, isDirty: () => false, markSaved: () => {} });
    expect(url).toBe(PUBLIC_URL);
  });

  it("writes merged URL back into FormData", () => {
    const fd = new FormData();
    const merged = ensureUploadFieldInFormData(fd, {
      getUrl: () => PUBLIC_URL,
      isUploading: () => false,
      isDirty: () => true,
      markSaved: () => {},
    });
    expect(merged).toBe(PUBLIC_URL);
    expect(fd.get("image_url")).toBe(PUBLIC_URL);
  });

  it("rejects blob preview URLs on save", () => {
    const check = requireUsableUploadUrl("blob:http://localhost/abc");
    expect(check.ok).toBe(false);
  });

  it("accepts https storage URLs on save", () => {
    const check = requireUsableUploadUrl(PUBLIC_URL);
    expect(check.ok).toBe(true);
    if (check.ok) expect(check.url).toBe(PUBLIC_URL);
  });
});
