import Image from "next/image";
import { cn } from "@/lib/utils";

export function ReviewAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  const letter = (name.trim().charAt(0) || "?").toUpperCase();

  if (avatarUrl) {
    return (
      <span className={cn("relative inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted", className)}>
        <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="44px" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary",
        className,
      )}
      aria-hidden
    >
      {letter}
    </span>
  );
}
