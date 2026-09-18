import { friendlyImageProcessError } from "@/lib/admin/image-upload-validation";
import {
  HERO_JPEG_QUALITY,
  HERO_OUTPUT_HEIGHT,
  HERO_OUTPUT_WIDTH,
} from "@/lib/hero-media";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sharp: any = undefined;

async function getSharp() {
  if (_sharp !== undefined) return _sharp;
  try {
    const mod = await import("sharp");
    _sharp = mod.default ?? mod;
    return _sharp;
  } catch {
    _sharp = null;
    return null;
  }
}

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function processHeroUpload(file: File): Promise<{
  buffer: Buffer;
  contentType: string;
  ext: string;
}> {
  const input = Buffer.from(await file.arrayBuffer());
  const sharp = await getSharp();

  if (!sharp) {
    return { buffer: input, contentType: file.type || "image/jpeg", ext: extFromMime(file.type || "image/jpeg") };
  }

  const meta = await sharp(input).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width === 0 || height === 0) {
    throw new Error(friendlyImageProcessError("Invalid image dimensions"));
  }

  const buffer = await sharp(input)
    .resize(HERO_OUTPUT_WIDTH, HERO_OUTPUT_HEIGHT, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: HERO_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  if (!buffer.length || buffer.length < 128) {
    throw new Error(friendlyImageProcessError("Processed image was empty"));
  }
  return { buffer, contentType: "image/jpeg", ext: "jpg" };
}

const SANITIZE_MAX_WIDTH = 1600;
const SANITIZE_JPEG_QUALITY = 88;
const BRAND_MAX_WIDTH = 512;

export async function processSanitizedUpload(
  file: File,
  bucket?: "gallery" | "brand" | "journey",
): Promise<{
  buffer: Buffer;
  contentType: string;
  ext: string;
}> {
  const input = Buffer.from(await file.arrayBuffer());
  const sharp = await getSharp();

  if (!sharp) {
    return { buffer: input, contentType: file.type || "image/jpeg", ext: extFromMime(file.type || "image/jpeg") };
  }

  const meta = await sharp(input).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width === 0 || height === 0) {
    throw new Error(friendlyImageProcessError("Invalid image dimensions"));
  }

  const maxWidth = bucket === "brand" ? BRAND_MAX_WIDTH : SANITIZE_MAX_WIDTH;

  let pipeline = sharp(input);
  if (width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, undefined, { withoutEnlargement: true });
  }

  const format = meta.format;
  if (format === "png") {
    const buffer = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
    return { buffer, contentType: "image/png", ext: "png" };
  }
  if (format === "webp") {
    const buffer = await pipeline.webp({ quality: 85 }).toBuffer();
    return { buffer, contentType: "image/webp", ext: "webp" };
  }
  if (format === "gif") {
    const buffer = await pipeline.gif().toBuffer();
    return { buffer, contentType: "image/gif", ext: "gif" };
  }

  const buffer = await pipeline.jpeg({ quality: SANITIZE_JPEG_QUALITY, mozjpeg: true }).toBuffer();
  if (!buffer.length || buffer.length < 128) {
    throw new Error(friendlyImageProcessError("Processed image was empty"));
  }
  return { buffer, contentType: "image/jpeg", ext: "jpg" };
}
