type StorageBucket = "gallery" | "brand" | "journey";

const UNSUPPORTED_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/bmp",
  "image/x-ms-bmp",
  "image/tiff",
  "image/x-tiff",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "application/pdf",
]);

const UNSUPPORTED_EXT = new Set([
  "heic",
  "heif",
  "hif",
  "bmp",
  "tiff",
  "tif",
  "avif",
  "ico",
  "pdf",
  "raw",
  "cr2",
  "nef",
  "arw",
  "dng",
]);

export function mimeFromFileName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "jpe":
    case "jfif":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}

export function allowedUploadTypes(_bucket: StorageBucket): string[] {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"];
}

export function unsupportedFormatMessage(name: string, mime: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const normalizedMime = mime.toLowerCase();

  if (UNSUPPORTED_EXT.has(ext) || UNSUPPORTED_MIMES.has(normalizedMime)) {
    return "This file type is not supported. Please upload a JPEG, PNG, WebP, or GIF image (not HEIC/iPhone photos, BMP, or PDF).";
  }

  if (normalizedMime === "application/octet-stream" && !mimeFromFileName(name)) {
    return "Could not detect a supported image type. Save the file as JPEG or PNG and try again.";
  }

  return null;
}

export function resolveUploadContentType(file: File): string {
  const fromName = mimeFromFileName(file.name);
  const fromBrowser = file.type?.trim().toLowerCase() ?? "";
  if (fromBrowser && fromBrowser !== "application/octet-stream") return fromBrowser;
  return fromName ?? fromBrowser;
}

export function detectImageMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export async function validateImageFileAsync(
  file: File,
  bucket: StorageBucket,
): Promise<{ ok: true; contentType: string } | { ok: false; error: string }> {
  const basic = validateImageFile(file, bucket);
  if (!basic.ok) return basic;

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const detected = detectImageMimeFromBytes(head);
  if (!detected || !allowedUploadTypes(bucket).includes(detected)) {
    return { ok: false, error: "File content does not match a supported image format." };
  }

  return { ok: true, contentType: detected };
}

export function validateImageFile(
  file: File,
  bucket: StorageBucket,
): { ok: true; contentType: string } | { ok: false; error: string } {
  const contentType = resolveUploadContentType(file);
  const unsupported = unsupportedFormatMessage(file.name, contentType);
  if (unsupported) return { ok: false, error: unsupported };

  const allowed = allowedUploadTypes(bucket);
  if (!contentType || !allowed.includes(contentType)) {
    return {
      ok: false,
      error:
        "Only JPEG, PNG, WebP, or GIF images are allowed. If this is an iPhone photo (HEIC), export it as JPEG first.",
    };
  }

  return { ok: true, contentType };
}

/** Map sharp / server processing errors to admin-friendly text. */
export function friendlyImageProcessError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("unsupported") || lower.includes("invalid") || lower.includes("corrupt")) {
    return "This image file could not be read. Use a standard JPEG or PNG (not HEIC, RAW, or a corrupted file).";
  }
  if (lower.includes("dimensions")) {
    return "Invalid image dimensions. Try a different photo file.";
  }
  return message;
}
