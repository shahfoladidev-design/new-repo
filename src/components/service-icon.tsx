import { Compass } from "lucide-react";
import { ICON_MAP, resolveServiceIconKey } from "@/lib/service-icons";

export function ServiceIcon({
  iconKey,
  slug,
  className,
}: {
  iconKey?: string | null;
  slug: string;
  className?: string;
}) {
  const Icon = ICON_MAP[resolveServiceIconKey(iconKey, slug)] ?? Compass;
  return <Icon className={className} aria-hidden />;
}
