import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { processHeroUpload } from "./image-process";
import { HERO_OUTPUT_HEIGHT, HERO_OUTPUT_WIDTH } from "@/lib/hero-media";

async function makeTestFile(width: number, height: number, name: string): Promise<File> {
  const buffer = (await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 80, g: 120, b: 160 },
    },
  })
    .jpeg()
    .toBuffer()) as unknown as BlobPart;

  return new File([buffer], name, { type: "image/jpeg" });
}

describe("processHeroUpload", () => {
  it.each([
    ["landscape", 3200, 1800],
    ["portrait", 1200, 2000],
    ["square", 1500, 1500],
  ] as const)("outputs 2400×1350 JPEG for %s input", async (_label, width, height) => {
    const file = await makeTestFile(width, height, `${_label}.jpg`);
    const { buffer, contentType, ext } = await processHeroUpload(file);
    const meta = await sharp(buffer).metadata();

    expect(contentType).toBe("image/jpeg");
    expect(ext).toBe("jpg");
    expect(buffer.length).toBeGreaterThan(128);
    expect(meta.width).toBe(HERO_OUTPUT_WIDTH);
    expect(meta.height).toBe(HERO_OUTPUT_HEIGHT);
    expect(meta.format).toBe("jpeg");
  });

  it("rejects empty or invalid input", async () => {
    const empty = new File([], "empty.jpg", { type: "image/jpeg" });
    await expect(processHeroUpload(empty)).rejects.toThrow();
  });
});
