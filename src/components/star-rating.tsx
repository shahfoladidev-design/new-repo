"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            cls,
            value <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
