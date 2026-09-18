import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { getSiteUrl, languageAlternates, normalizePath } from "@/lib/seo";
import { toUrlSlug } from "@/lib/slug";

/** Indexable public marketing paths (exclude redirect stubs & private areas) */
const staticPaths = [
  "",
  "/packages",
  "/upcoming-tours",
  "/destinations",
  "/services",
  "/about",
  "/team",
  "/gallery",
  "/reviews",
  "/blog",
  "/faq",
  "/contact",
  "/book",
  "/agreements",
  "/privacy",
  "/terms",
];

function entry(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority: number;
  },
) {
  const siteUrl = getSiteUrl();
  const suffix = normalizePath(path);
  // Primary URL uses English; alternates cover all locales for hreflang
  const item: MetadataRoute.Sitemap[number] = {
    url: `${siteUrl}/en${suffix}`,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: languageAlternates(path),
    },
  };
  // Only set lastModified when we have a reliable content timestamp
  if (opts.lastModified) {
    item.lastModified = opts.lastModified;
  }
  return item;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    entries.push(
      entry(path, {
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/packages" || path === "/book" ? 0.9 : 0.7,
      }),
    );
  }

  try {
    const supabase = createPublicClient();
    const [{ data: packages }, { data: destinations }, { data: posts }] = await Promise.all([
      supabase.from("packages").select("slug, updated_at").eq("is_published", true),
      supabase.from("destinations").select("slug, updated_at").eq("is_published", true),
      supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true),
    ]);

    for (const row of packages ?? []) {
      entries.push(
        entry(`/packages/${toUrlSlug(row.slug)}`, {
          lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
          changeFrequency: "weekly",
          priority: 0.85,
        }),
      );
    }
    for (const row of destinations ?? []) {
      entries.push(
        entry(`/destinations/${toUrlSlug(row.slug)}`, {
          lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
          changeFrequency: "weekly",
          priority: 0.75,
        }),
      );
    }
    for (const row of posts ?? []) {
      entries.push(
        entry(`/blog/${toUrlSlug(row.slug)}`, {
          lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
          changeFrequency: "monthly",
          priority: 0.6,
        }),
      );
    }
  } catch {
    // Keep static entries if Supabase tables differ or are unavailable
  }

  return entries;
}
