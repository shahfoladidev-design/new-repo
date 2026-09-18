/** Demo catalog rows — only shown in local development when CMS data is missing. */
export function devPlaceholdersEnabled() {
  return process.env.NODE_ENV === "development";
}
