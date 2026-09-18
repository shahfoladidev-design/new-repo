"use client";

import { useState, useTransition } from "react";
import {
  purgeAllStorageOrphans,
  scanStorageOrphans,
  type StorageOrphanReport,
} from "@/app/admin/actions/storage";
import { useAdminFeedback } from "@/components/admin/admin-feedback";

export function StorageCleanupClient() {
  const feedback = useAdminFeedback();
  const [pending, startTransition] = useTransition();
  const [report, setReport] = useState<StorageOrphanReport | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Compares files in Supabase Storage buckets (<code className="text-foreground">gallery</code>,{" "}
        <code className="text-foreground">brand</code>, <code className="text-foreground">journey</code>) to
        every CMS image URL. Orphans are files with no database reference — safe to delete. Live gallery /
        hero / package images are never listed here while still linked.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await scanStorageOrphans();
              if (!result.ok) {
                feedback.error("Scan failed", result.error);
                return;
              }
              if (result.report) setReport(result.report);
              feedback.success(result.message ?? "Scan complete");
            });
          }}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          {pending ? "Working…" : "Scan for orphans"}
        </button>

        <button
          type="button"
          disabled={pending || !report?.orphans.length}
          onClick={() => {
            if (
              !window.confirm(
                `Delete ${report?.orphans.length ?? 0} orphaned file(s) from Supabase Storage? This cannot be undone.`,
              )
            ) {
              return;
            }
            startTransition(async () => {
              const result = await purgeAllStorageOrphans();
              if (!result.ok) {
                feedback.error("Purge failed", result.error);
                return;
              }
              if (result.report) setReport(result.report);
              feedback.success(result.message ?? "Purge complete");
            });
          }}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          Purge orphans
        </button>
      </div>

      {report ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              Scanned: <strong className="text-foreground">{report.scannedCount}</strong>
            </span>
            <span>
              Referenced in CMS: <strong className="text-foreground">{report.referencedCount}</strong>
            </span>
            <span>
              Orphans: <strong className="text-foreground">{report.orphans.length}</strong>
            </span>
          </div>

          {report.orphans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orphaned files. Storage is clean.</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3 font-mono text-xs">
              {report.orphans.map((o) => (
                <li key={o.key}>{o.key}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Run a scan to see orphaned storage files.</p>
      )}
    </div>
  );
}
