import { describe, expect, it } from "vitest";
import { filterCatalog, type CatalogItem } from "./catalog-search";

const items: CatalogItem[] = [
  {
    kind: "package",
    slug: "kabul-bamyan-5-day",
    title_en: "5-Day Kabul & Bamyan Experience",
    summary_en: "Short cultural trip",
    href: "/packages/kabul-bamyan-5-day",
    duration_days: 5,
    price_from: 700,
    province_slug: "kabul",
    route_label: "Kabul • Bamyan",
  },
  {
    kind: "package",
    slug: "wakhan-pamir-14-day",
    title_en: "14-Day Wakhan & Pamir Adventure",
    summary_en: "High altitude journey",
    href: "/packages/wakhan-pamir-14-day",
    duration_days: 14,
    price_from: 2200,
    province_slug: "wakhan",
  },
  {
    kind: "destination",
    slug: "herat",
    title_en: "Herat",
    summary_en: "Historic western city",
    href: "/destinations/herat",
  },
  {
    kind: "upcoming",
    slug: "june-2026",
    title_en: "13–22 June 2026 Afghanistan Tour",
    href: "/upcoming-tours",
    duration_days: 10,
  },
];

describe("filterCatalog", () => {
  it("filters by free-text query across titles and routes", () => {
    const result = filterCatalog(items, { query: "bamyan" }, "en");
    expect(result.map((i) => i.slug)).toEqual(["kabul-bamyan-5-day"]);
  });

  it("filters destinations by query", () => {
    const result = filterCatalog(items, { query: "herat", kind: "destination" }, "en");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("herat");
  });

  it("applies duration and price filters to packages", () => {
    const result = filterCatalog(items, { kind: "package", duration: "long", price: "premium" }, "en");
    expect(result.map((i) => i.slug)).toEqual(["wakhan-pamir-14-day"]);
  });

  it("filters by province", () => {
    const result = filterCatalog(items, { province: "kabul" }, "en");
    expect(result.map((i) => i.slug)).toEqual(["kabul-bamyan-5-day"]);
  });
});
