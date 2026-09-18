/** Prefer existing translation; otherwise use English as an editable default. */
export function withEnglishDefault(
  translated: string | null | undefined,
  english: string | null | undefined,
) {
  const value = (translated ?? "").trim();
  if (value) return value;
  return (english ?? "").trim();
}
