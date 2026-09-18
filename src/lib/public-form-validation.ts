const LIMITS = {
  fullName: 200,
  email: 254,
  phone: 40,
  subject: 200,
  message: 5000,
  reviewText: 2000,
  country: 80,
  reviewName: 120,
} as const;

export function clampText(value: string, max: number) {
  return value.trim().slice(0, max);
}

export function validateContactFields(input: {
  fullName: string;
  email: string;
  message: string;
  phone: string | null;
  subject: string | null;
}): { ok: true; value: typeof input } | { ok: false; error: string } {
  const fullName = clampText(input.fullName, LIMITS.fullName);
  const email = clampText(input.email, LIMITS.email);
  const message = clampText(input.message, LIMITS.message);
  const phone = input.phone ? clampText(input.phone, LIMITS.phone) : null;
  const subject = input.subject ? clampText(input.subject, LIMITS.subject) : null;

  if (!fullName || !email || !message) {
    return { ok: false, error: "missing_fields" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid_email" };
  }

  return { ok: true, value: { fullName, email, message, phone, subject } };
}

export function validateBookingFields(input: {
  fullName: string;
  email: string;
  phone: string;
  message: string | null;
  travelers: number;
}): { ok: true; value: typeof input } | { ok: false; error: string } {
  const fullName = clampText(input.fullName, LIMITS.fullName);
  const email = clampText(input.email, LIMITS.email);
  const phone = clampText(input.phone, LIMITS.phone);
  const message = input.message ? clampText(input.message, LIMITS.message) : null;
  const travelers = Number.isFinite(input.travelers) ? Math.min(99, Math.max(1, Math.round(input.travelers))) : 1;

  if (!fullName || !email || !phone) {
    return { ok: false, error: "missing_fields" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid_email" };
  }

  return { ok: true, value: { fullName, email, phone, message, travelers } };
}

export function validateReviewFields(input: {
  fullName: string;
  country: string | null;
  reviewText: string;
  rating: number;
}): { ok: true; value: typeof input } | { ok: false; error: string } {
  const fullName = clampText(input.fullName, LIMITS.reviewName);
  const country = input.country ? clampText(input.country, LIMITS.country) : null;
  const reviewText = clampText(input.reviewText, LIMITS.reviewText);
  const rating = Number.isFinite(input.rating) ? Math.min(5, Math.max(1, Math.round(input.rating))) : 0;

  if (!fullName || !reviewText || rating < 1) {
    return { ok: false, error: "missing_fields" };
  }

  return { ok: true, value: { fullName, country, reviewText, rating } };
}
