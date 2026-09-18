import { Link } from "@/i18n/navigation";
import { ServiceIcon } from "@/components/service-icon";

export function ServiceCard({
  slug,
  title,
  summary,
  iconKey,
  askLabel,
  href = "/contact",
}: {
  slug: string;
  title: string;
  summary?: string;
  iconKey?: string | null;
  askLabel: string;
  href?: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
        <ServiceIcon iconKey={iconKey} slug={slug} className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {summary ? <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{summary}</p> : null}
      <Link href={href} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
        {askLabel}
      </Link>
    </article>
  );
}
