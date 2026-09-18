import type { Locale } from "@/i18n/config";
import { ContentCard } from "@/components/content-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { localizedField } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";
import { unstable_cache } from "next/cache";
import { CMS_CACHE_SECONDS } from "@/lib/cache-config";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { devPlaceholdersEnabled } from "@/lib/dev-placeholders";
import { toUrlSlug } from "@/lib/slug";
import { getTranslations, setRequestLocale } from "next-intl/server";

type ListPageProps = {
  params: Promise<{ locale: Locale }>;
  table: string;
  titleKey: string;
  basePath: string;
  fallback: Array<Record<string, unknown>>;
  field?: "title" | "name";
};

function cachedPublishedRows(table: string) {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from(table)
        .select(
          "slug, title_en, title_dari, title_pashto, summary_en, summary_dari, summary_pashto, image_url",
        )
        .eq("is_published", true);
      return data ?? [];
    },
    [`cms-list-${table}`],
    { revalidate: CMS_CACHE_SECONDS, tags: [CACHE_TAGS.all, `cms:${table}`] },
  )();
}

export async function renderListPage({
  params,
  table,
  titleKey,
  basePath,
  fallback,
  field = "title",
}: ListPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let items = devPlaceholdersEnabled() ? fallback : [];
  try {
    const data = await cachedPublishedRows(table);
    if (data.length) items = data;
  } catch {
    // placeholders
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <ScrollReveal variant="rise">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">{t(titleKey)}</h1>
        </div>
      </ScrollReveal>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ContentCard
            key={String(item.slug)}
            href={`${basePath}/${toUrlSlug(item.slug)}`}
            title={localizedField(item as never, locale, field)}
            summary={localizedField(item as never, locale, field === "name" ? "bio" : "summary")}
            imageUrl={item.image_url as string | undefined}
            cta={t("common.learnMore")}
          />
        ))}
      </div>
    </div>
  );
}
