/**
 * next-intl builds an `IntlMessageFormat` with the *routing* locale as soon as a
 * message takes arguments. Our Dari route segment is `dari`, which is not a valid
 * BCP-47 language tag, so that construction throws `INVALID_MESSAGE` and the string
 * renders unsubstituted (`© {year} …`) on every Dari page.
 *
 * These messages only need plain placeholder substitution — no plurals or number
 * formatting — so fill them in ourselves via `t.raw()` and skip ICU entirely.
 *
 * The durable fix is to route Dari as a valid tag (`fa`) with a `/dari` URL prefix;
 * until then, use this for any message that takes arguments.
 */
export function interpolate(raw: unknown, values: Record<string, string | number>): string {
  let out = typeof raw === "string" ? raw : String(raw ?? "");
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}
