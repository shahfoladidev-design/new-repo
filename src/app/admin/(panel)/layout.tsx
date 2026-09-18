import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminFeedbackProvider } from "@/components/admin/admin-feedback";
import { AdminSessionKeepAlive } from "@/components/admin/admin-session-keepalive";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();

  const [{ count: unseenBookings }, { count: unseenContacts }] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .eq("admin_seen", false),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("admin_seen", false),
  ]);

  return (
    <AdminFeedbackProvider>
      <AdminSessionKeepAlive />
      <div className="min-h-screen bg-muted/30 lg:flex">
        <AdminSidebar unseenBookings={unseenBookings ?? 0} unseenContacts={unseenContacts ?? 0} />
        <div className="min-w-0 flex-1 lg:ps-0">
          <AdminHeader email={user.email ?? ""} />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminFeedbackProvider>
  );
}
