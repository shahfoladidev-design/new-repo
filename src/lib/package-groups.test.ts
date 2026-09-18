import { describe, expect, it } from "vitest";
import { groupPackagesByProvince, type PackageWithDestinations } from "./package-groups";

describe("groupPackagesByProvince", () => {
  const mkPkg = (
    slug: string,
    provinceSlug: string,
    destinations: { destSlug: string; days?: number | null; sortOrder?: number }[],
  ): PackageWithDestinations => ({
    id: `pkg-${slug}`,
    slug,
    title_en: slug,
    province_slug: provinceSlug,
    package_destinations: destinations.map((d, i) => ({
      id: `pd-${slug}-${i}`,
      days: d.days ?? null,
      sort_order: d.sortOrder ?? i,
      destinations: {
        id: `dest-${d.destSlug}`,
        slug: d.destSlug,
        title_en: d.destSlug,
        image_url: null,
      },
    })),
  });

  it("groups by province and deduplicates destinations", () => {
    const packages = [
      mkPkg("a", "kabul", [{ destSlug: "bamyan" }, { destSlug: "herat" }]),
      mkPkg("b", "kabul", [{ destSlug: "bamyan" }, { destSlug: "kandahar" }]),
    ];
    const groups = groupPackagesByProvince(packages);
    expect(groups).toHaveLength(1);
    expect(groups[0].provinceSlug).toBe("kabul");
    expect(groups[0].destinations).toHaveLength(3);
  });

  it("returns empty for no packages", () => {
    expect(groupPackagesByProvince([])).toEqual([]);
  });

  it("filters out packages without province_slug", () => {
    const packages = [mkPkg("a", "kabul", [{ destSlug: "x" }])];
    packages[0].province_slug = null as unknown as string;
    expect(groupPackagesByProvince(packages)).toEqual([]);
  });

  it("sorts groups by known province order", () => {
    const packages = [
      mkPkg("a", "herat", [{ destSlug: "x" }]),
      mkPkg("b", "kabul", [{ destSlug: "y" }]),
    ];
    const groups = groupPackagesByProvince(packages);
    expect(groups.map((g) => g.provinceSlug)).toEqual(["kabul", "herat"]);
  });

  it("picks shortest days when multiple packages share a destination", () => {
    const packages = [
      mkPkg("a", "kabul", [{ destSlug: "bamyan", days: 5 }]),
      mkPkg("b", "kabul", [{ destSlug: "bamyan", days: 3 }]),
    ];
    const groups = groupPackagesByProvince(packages);
    expect(groups[0].destinations[0].days).toBe(3);
  });

  it("uses fallback province name when slug is not in AFGHAN_PROVINCES", () => {
    const packages = [mkPkg("a", "unknown-province", [{ destSlug: "x" }])];
    const groups = groupPackagesByProvince(packages);
    expect(groups[0].provinceName).toBe("unknown-province");
  });

  it("skips entries with null destinations", () => {
    const pkg: PackageWithDestinations = {
      id: "p1",
      slug: "p1",
      title_en: "p1",
      province_slug: "kabul",
      package_destinations: [
        {
          id: "pd1",
          days: null,
          sort_order: 0,
          destinations: null,
        },
      ],
    };
    const groups = groupPackagesByProvince([pkg]);
    expect(groups[0].destinations).toHaveLength(0);
  });

  it("sorts destinations by days ascending with nulls last", () => {
    const packages = [
      mkPkg("a", "kabul", [
        { destSlug: "late", days: 5 },
        { destSlug: "early", days: 2 },
        { destSlug: "unset", days: null },
      ]),
    ];
    const groups = groupPackagesByProvince(packages);
    expect(groups[0].destinations.map((d) => d.slug)).toEqual(["early", "late", "unset"]);
  });
});
