import { describe, expect, it } from "vitest";
import {
  hasVipTier,
  packageHasVipChoice,
  parseCatalogPrice,
  parseIncludesList,
  tierIncludes,
  tierPrice,
  packageTierLabel,
} from "@/lib/package-tiers";

describe("package-tiers", () => {
  it("detects VIP when price is positive", () => {
    expect(hasVipTier(1200)).toBe(true);
    expect(hasVipTier("1498.00")).toBe(true);
    expect(hasVipTier(null)).toBe(false);
    expect(hasVipTier(0)).toBe(false);
    expect(hasVipTier("")).toBe(false);
  });

  it("coerces Supabase numeric strings", () => {
    expect(parseCatalogPrice("890.00")).toBe(890);
    expect(parseCatalogPrice(1498)).toBe(1498);
    expect(parseCatalogPrice(null)).toBeNull();
    expect(parseCatalogPrice("abc")).toBeNull();
  });

  it("detects VIP choice from price or includes", () => {
    expect(packageHasVipChoice({ vip_price: "1498.00", vip_includes: [] })).toBe(true);
    expect(packageHasVipChoice({ vip_price: null, vip_includes: ["Private guide"] })).toBe(true);
    expect(packageHasVipChoice({ vip_price: null, vip_includes: [] })).toBe(false);
  });

  it("returns tier-specific includes with legacy fallback", () => {
    const legacy = ["Guide"];
    const standard = ["Hotel", "Breakfast"];
    const vip = ["Luxury hotel", "Private guide"];

    expect(tierIncludes("standard", standard, vip, legacy)).toEqual(standard);
    expect(tierIncludes("vip", standard, vip, legacy)).toEqual(vip);
    expect(tierIncludes("standard", [], [], legacy)).toEqual(legacy);
  });

  it("resolves tier price", () => {
    expect(tierPrice("standard", 800, 1200)).toBe(800);
    expect(tierPrice("vip", 800, "1200.00")).toBe(1200);
    expect(parseIncludesList(["a", ""])).toEqual(["a"]);
    expect(packageTierLabel("vip")).toBe("VIP");
    expect(packageTierLabel("standard")).toBe("Standard");
  });
});
