import { revalidatePath, revalidateTag } from "next/cache";
import { locales } from "@/i18n/config";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";

/** Next 16 requires a cacheLife profile as the second argument. */
function bustTag(tag: CacheTag | string) {
  revalidateTag(tag, "max");
}

/**
 * Invalidate CMS Data Cache tags and public locale routes after admin mutations.
 */
export function revalidateCms(tags: CacheTag[] = [CACHE_TAGS.all]) {
  const unique = new Set<string>([CACHE_TAGS.all, ...tags]);
  for (const tag of unique) bustTag(tag);

  revalidatePath("/", "layout");
  for (const locale of locales) {
    revalidatePath(`/${locale}`, "layout");
  }
}

export function revalidatePublicPaths(...paths: string[]) {
  for (const path of paths) {
    if (path.startsWith("/admin")) {
      revalidatePath(path);
      continue;
    }
    if (path === "/" || path === "") {
      for (const locale of locales) revalidatePath(`/${locale}`);
      continue;
    }
    for (const locale of locales) {
      revalidatePath(`/${locale}${path.startsWith("/") ? path : `/${path}`}`);
    }
  }
}

/** Map content tables → cache tags + public path prefixes. */
export function revalidateContentTable(
  table:
    | "packages"
    | "destinations"
    | "blog_posts"
    | "services"
    | "team_members"
    | "faqs"
    | "tour_departures",
) {
  const map: Record<string, { tags: CacheTag[]; paths: string[] }> = {
    packages: {
      tags: [CACHE_TAGS.packages, CACHE_TAGS.nav, CACHE_TAGS.homepage, CACHE_TAGS.bookingOffers],
      paths: ["/packages", "/book", "/"],
    },
    destinations: {
      tags: [CACHE_TAGS.destinations, CACHE_TAGS.nav, CACHE_TAGS.homepage],
      paths: ["/destinations", "/"],
    },
    blog_posts: { tags: [CACHE_TAGS.blog], paths: ["/blog"] },
    services: {
      tags: [CACHE_TAGS.services, CACHE_TAGS.homepage, CACHE_TAGS.bookingOffers],
      paths: ["/services", "/book", "/"],
    },
    team_members: { tags: [CACHE_TAGS.team], paths: ["/team"] },
    faqs: { tags: [CACHE_TAGS.faqs, CACHE_TAGS.homepage], paths: ["/faq", "/"] },
    tour_departures: {
      tags: [CACHE_TAGS.upcoming, CACHE_TAGS.nav, CACHE_TAGS.bookingOffers, CACHE_TAGS.homepage],
      paths: ["/upcoming-tours", "/book", "/"],
    },
  };

  const entry = map[table] ?? { tags: [CACHE_TAGS.all], paths: ["/"] };
  revalidateCms(entry.tags);
  revalidatePublicPaths(...entry.paths);
}
