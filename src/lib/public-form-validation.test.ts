import { describe, expect, it } from "vitest";
import { validateBookingFields, validateContactFields, validateReviewFields } from "@/lib/public-form-validation";

describe("validateContactFields", () => {
  it("accepts valid contact payload", () => {
    const result = validateContactFields({
      fullName: "Jane Doe",
      email: "jane@example.com",
      message: "Hello",
      phone: null,
      subject: null,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = validateContactFields({
      fullName: "Jane",
      email: "not-an-email",
      message: "Hello",
      phone: null,
      subject: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("invalid_email");
  });

  it("clamps long message", () => {
    const result = validateContactFields({
      fullName: "Jane",
      email: "jane@example.com",
      message: "x".repeat(6000),
      phone: null,
      subject: null,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.message.length).toBe(5000);
  });
});

describe("validateBookingFields", () => {
  it("accepts valid booking payload", () => {
    const result = validateBookingFields({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+93701234567",
      message: "Hello",
      travelers: 2,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = validateBookingFields({
      fullName: "Jane",
      email: "bad",
      phone: "+93701234567",
      message: null,
      travelers: 1,
    });
    expect(result.ok).toBe(false);
  });
});

describe("validateReviewFields", () => {
  it("normalizes rating bounds", () => {
    const result = validateReviewFields({
      fullName: "Jane",
      country: "UK",
      reviewText: "Great trip",
      rating: 9,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.rating).toBe(5);
  });
});
