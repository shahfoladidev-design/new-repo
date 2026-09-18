"use client";

import { useTransition } from "react";
import Link from "next/link";
import { minorToMajor } from "@/lib/payments/money";
import { useAdminFeedback } from "@/components/admin/admin-feedback";
import type { ActionResult } from "@/lib/admin/action-result";

export function BookingQuoteForm({
  bookingId,
  defaultAmount,
  catalogPriceLabel,
  catalogEditHref,
  hasCatalogPrice,
  isOverride,
  action,
  syncFromCatalogAction,
}: {
  bookingId: string;
  defaultAmount: string;
  catalogPriceLabel?: string | null;
  catalogEditHref?: string | null;
  hasCatalogPrice: boolean;
  isOverride: boolean;
  action: (id: string, formData: FormData) => Promise<ActionResult | void>;
  syncFromCatalogAction?: (id: string) => Promise<ActionResult | void>;
}) {
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm font-medium">Total amount due</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Set the catalog price under Admin → Packages or Admin → Upcoming Tours. Override here only for custom
        quotes, discounts, or deposits.
      </p>

      {catalogPriceLabel ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm">
          <span>
            Catalog price: <span className="font-semibold">{catalogPriceLabel}</span>
          </span>
          {catalogEditHref ? (
            <Link href={catalogEditHref} className="text-xs font-medium underline">
              Edit in catalog
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          No catalog price yet — add price on the package or upcoming tour in the dashboard, or enter a custom total
          below.
        </p>
      )}

      {isOverride && catalogPriceLabel ? (
        <p className="mt-2 text-xs text-muted-foreground">This booking total differs from the current catalog price.</p>
      ) : null}

      <form
        action={(fd) => {
          startTransition(async () => {
            await feedback.run(() => action(bookingId, fd), { successMessage: "Total amount due saved" });
          });
        }}
        className="mt-4 grid gap-3 sm:grid-cols-2"
      >
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="text-xs text-muted-foreground">Total due for this booking (USD)</span>
          <input
            name="quoted_amount"
            type="text"
            inputMode="decimal"
            defaultValue={defaultAmount}
            placeholder="e.g. 890.00"
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <input type="hidden" name="quoted_currency" value="USD" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60 sm:col-span-3 sm:w-fit"
        >
          {pending ? "Saving…" : "Save total due"}
        </button>
        {syncFromCatalogAction && hasCatalogPrice ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await feedback.run(() => syncFromCatalogAction(bookingId), {
                  successMessage: "Synced from catalog price",
                });
              });
            }}
            className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-60 sm:col-span-3 sm:w-fit"
          >
            Reset to catalog price
          </button>
        ) : null}
      </form>
    </div>
  );
}

export function formatQuoteDisplay(amountMinor: number | null, _currency: string | null): string {
  if (amountMinor == null) return "";
  return `$${minorToMajor(BigInt(amountMinor))}`;
}
