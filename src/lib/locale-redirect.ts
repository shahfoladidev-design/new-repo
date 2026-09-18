import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

/** Redirect to a public path while preserving the active site locale prefix. */
export async function redirectToLocalePath(path: string): Promise<never> {
  const locale = await getLocale();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  redirect(`/${locale}${normalized}`);
}
