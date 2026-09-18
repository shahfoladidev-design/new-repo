"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { submitVisitorReview } from "@/app/actions/public-forms";
import { cn } from "@/lib/utils";

export function ReviewForm() {
  const t = useTranslations("reviews");
  const tc = useTranslations("common");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");
    formData.set("rating", String(rating));
    const result = await submitVisitorReview(formData);
    if (!result.ok) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        {t("success")}
      </p>
    );
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{t("formTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("formSubtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span>{t("fullName")}</span>
          <input
            name="full_name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span>{t("country")}</span>
          <input
            name="country"
            placeholder={t("countryPlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
          />
        </label>
      </div>

      <div className="grid gap-1.5 text-sm">
        <span>{t("rating")}</span>
        <div className="flex items-center gap-1" role="group" aria-label={t("rating")}>
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= (hover || rating);
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(value)}
                className="rounded p-0.5 transition"
                aria-label={`${value} ${t("stars")}`}
                aria-pressed={rating === value}
              >
                <Star
                  className={cn(
                    "h-7 w-7",
                    active ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground",
                  )}
                />
              </button>
            );
          })}
          <span className="ms-2 text-sm text-muted-foreground">
            {rating}/5
          </span>
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <label className="grid gap-1.5 text-sm">
        <span>{t("review")}</span>
        <textarea
          name="review_text"
          required
          rows={4}
          placeholder={t("reviewPlaceholder")}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg || tc("error")}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:w-fit"
      >
        {status === "loading" ? tc("loading") : t("submit")}
      </button>
    </form>
  );
}
