import { describe, expect, it } from "vitest";
import { localizedField } from "./content";

describe("localizedField", () => {
  const item = {
    title_en: "English title",
    title_dari: "عنوان دری",
    title_pashto: "پښتو سرلیک",
    summary_en: "English summary",
  };

  it("returns English by default", () => {
    expect(localizedField(item, "en", "title")).toBe("English title");
  });

  it("returns Dari with English fallback", () => {
    expect(localizedField(item, "dari", "title")).toBe("عنوان دری");
    expect(localizedField({ title_en: "Only EN" }, "dari", "title")).toBe("Only EN");
  });

  it("returns Pashto with English fallback", () => {
    expect(localizedField(item, "ps", "title")).toBe("پښتو سرلیک");
  });
});
