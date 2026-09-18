import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/booking-offers";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { packageTierLabel } from "@/lib/package-tiers";

const STATUS_STYLES: Record<BookingStatus, string> = {
  new: "bg-amber-100 text-amber-900",
  contacted: "bg-sky-100 text-sky-900",
  quoted: "bg-violet-100 text-violet-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  traveling: "bg-teal-100 text-teal-900",
  declined: "bg-red-100 text-red-900",
};

function statusLabel(
  status: string,
  t: (key: string) => string,
) {
  if ((BOOKING_STATUSES as readonly string[]).includes(status)) {
    return t(`statuses.${status}`);
  }
  return status;
}

export default async function AdminBookingsPage() {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.bookings");
  const tc = await getTranslations("admin.common");
  const { data: bookings } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <AdminDataTable
        headers={[t("guest"), t("contact"), t("reference"), t("tier"), t("travelDate"), t("status"), t("seen")]}
        emptyMessage={t("empty")}
      >
        {(bookings ?? []).map((b) => {
          const status = String(b.status ?? "new");
          const style =
            STATUS_STYLES[status as BookingStatus] ?? "bg-muted text-muted-foreground";
          return (
            <tr key={b.id} className="hover:bg-muted/40">
              <td className="px-4 py-3">
                <Link href={`/admin/bookings/${b.id}`} className="font-medium text-primary hover:underline">
                  {b.full_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{b.email}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs font-semibold text-primary">
                  {b.reference_code ?? (b.reference_type === "custom" ? "CUSTOM" : "—")}
                </span>
                {b.reference_title ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">{b.reference_title}</span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                {packageTierLabel(b.package_tier) ? (
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      b.package_tier === "vip"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-slate-100 text-slate-800",
                    )}
                  >
                    {packageTierLabel(b.package_tier)}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">{b.travel_date ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", style)}>
                  {statusLabel(status, t)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={b.admin_seen ? "text-muted-foreground" : "font-medium text-amber-600"}>
                  {b.admin_seen ? tc("seen") : tc("newBadge")}
                </span>
              </td>
            </tr>
          );
        })}
      </AdminDataTable>
    </div>
  );
}
