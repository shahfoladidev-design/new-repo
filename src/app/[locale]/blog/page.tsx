import type { Metadata } from "next";
import { renderListPage } from "@/lib/list-page";
import { placeholderBlog } from "@/lib/content";
import type { Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return staticPageMetadata(params, "/blog", "blogTitle", "blogDescription");
}

export default function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  return renderListPage({
    params,
    table: "blog_posts",
    titleKey: "pages.blog",
    basePath: "/blog",
    fallback: placeholderBlog,
  });
}
