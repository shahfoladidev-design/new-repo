import { describe, expect, it } from "vitest";
import { isKnownCtaHref, normalizeCtaHref } from "@/lib/site-cta-routes";

describe("normalizeCtaHref", () => {
  it("defaults empty values", () => {
    expect(normalizeCtaHref("")).toBe("/packages");
    expect(normalizeCtaHref(null, "/book")).toBe("/book");
  });

  it("adds a leading slash", () => {
    expect(normalizeCtaHref("packages")).toBe("/packages");
  });

  it("strips locale prefixes", () => {
    expect(normalizeCtaHref("/en/packages")).toBe("/packages");
    expect(normalizeCtaHref("/dari/book")).toBe("/book");
    expect(normalizeCtaHref("/ps")).toBe("/");
  });

  it("recognizes known routes", () => {
    expect(isKnownCtaHref("/packages")).toBe(true);
    expect(isKnownCtaHref("/en/packages")).toBe(false);
  });
});
