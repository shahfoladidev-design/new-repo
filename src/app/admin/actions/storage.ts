"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { actionFail, type ActionResult } from "@/lib/admin/action-result";
import {
  findStorageOrphans,
  purgeStorageOrphans,
  type StorageOrphan,
} from "@/lib/admin/storage-cleanup";

export type StorageOrphanReport = {
  orphans: StorageOrphan[];
  referencedCount: number;
  scannedCount: number;
};

export async function scanStorageOrphans(): Promise<ActionResult & { report?: StorageOrphanReport }> {
  const { supabase } = await requireAdmin();
  try {
    const report = await findStorageOrphans(supabase);
    return {
      ok: true,
      message: report.orphans.length
        ? `Found ${report.orphans.length} orphaned file(s) of ${report.scannedCount} scanned.`
        : `No orphans — ${report.scannedCount} file(s) scanned, ${report.referencedCount} referenced.`,
      report,
    };
  } catch (err) {
    return actionFail(err instanceof Error ? err.message : "Storage scan failed");
  }
}

export async function purgeAllStorageOrphans(): Promise<
  ActionResult & { removed?: number; failed?: number; report?: StorageOrphanReport }
> {
  const { supabase } = await requireAdmin();
  try {
    const report = await findStorageOrphans(supabase);
    if (!report.orphans.length) {
      return {
        ok: true,
        message: "Nothing to purge — storage matches CMS URLs.",
        removed: 0,
        failed: 0,
        report,
      };
    }

    const result = await purgeStorageOrphans(supabase, report.orphans);
    const after = await findStorageOrphans(supabase);

    revalidatePath("/admin/storage");
    return {
      ok: true,
      message: `Purged ${result.removed} orphaned file(s)${result.failed ? `, ${result.failed} failed` : ""}.`,
      removed: result.removed,
      failed: result.failed,
      report: after,
    };
  } catch (err) {
    return actionFail(err instanceof Error ? err.message : "Storage purge failed");
  }
}
