import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden /> : null}
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "font-medium text-foreground" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
