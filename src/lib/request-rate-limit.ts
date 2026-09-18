import "server-only";

type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

const MAX_KEYS = 10_000;

function prune(now: number) {
  if (store.size <= MAX_KEYS) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
    if (store.size <= MAX_KEYS * 0.8) break;
  }
}

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > max;
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}
