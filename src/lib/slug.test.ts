import { describe, expect, it } from "vitest";
import { decodeSlugParam, findBySlug, slugKey, toUrlSlug } from "./slug";

describe("toUrlSlug", () => {
  it("cleans admin-entered slugs into URL-safe segments", () => {
    expect(toUrlSlug("6-day, Kabul, Ghazni, Bamyan ")).toBe("6-day-kabul-ghazni-bamyan");
    expect(toUrlSlug("Minaret of jam tour")).toBe("minaret-of-jam-tour");
    expect(toUrlSlug("Afghanistan Top Destination 10-day tour ")).toBe(
      "afghanistan-top-destination-10-day-tour",
    );
  });

  it("leaves already-clean slugs untouched", () => {
    expect(toUrlSlug("kabul-bamyan-5-day")).toBe("kabul-bamyan-5-day");
  });

  it("keeps non-Latin letters instead of emptying the slug", () => {
    expect(toUrlSlug("کابل بامیان")).toBe("کابل-بامیان");
  });
});

describe("decodeSlugParam", () => {
  it("decodes percent-encoded route params", () => {
    expect(decodeSlugParam("Minaret%20of%20jam%20tour")).toBe("Minaret of jam tour");
  });

  it("returns malformed input unchanged rather than throwing", () => {
    expect(decodeSlugParam("100%")).toBe("100%");
  });
});

describe("findBySlug", () => {
  const rows = [
    { slug: "6-day, Kabul, Ghazni, Bamyan ", id: "a" },
    { slug: "kabul-bamyan-5-day", id: "b" },
    { slug: "Minaret of jam tour", id: "c" },
  ];

  it("matches an exact slug", () => {
    expect(findBySlug(rows, "kabul-bamyan-5-day")?.id).toBe("b");
  });

  it("matches the percent-encoded param Next.js passes to the page", () => {
    expect(findBySlug(rows, "Minaret%20of%20jam%20tour")?.id).toBe("c");
  });

  it("matches when the browser dropped the row's trailing space", () => {
    expect(findBySlug(rows, "6-day%2C%20Kabul%2C%20Ghazni%2C%20Bamyan")?.id).toBe("a");
  });

  it("matches the canonical slug we now link to", () => {
    expect(findBySlug(rows, "6-day-kabul-ghazni-bamyan")?.id).toBe("a");
  });

  it("returns null for an unknown slug", () => {
    expect(findBySlug(rows, "does-not-exist")).toBeNull();
  });
});

describe("slugKey", () => {
  it("gives encoded, canonical and raw forms the same key", () => {
    const key = slugKey("6-day-kabul-ghazni-bamyan");
    expect(slugKey("6-day%2C%20Kabul%2C%20Ghazni%2C%20Bamyan")).toBe(key);
    expect(slugKey("6-day, Kabul, Ghazni, Bamyan ")).toBe(key);
  });
});
