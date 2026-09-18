import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getTranslations } from "next-intl/server";

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.overview");
  const tNav = await getTranslations("admin.nav");

  const [
    { count: bookings },
    { count: unseenBookings },
    { count: contacts },
    { count: unseenContacts },
    { count: packages },
    { count: destinations },
    { count: services },
    { count: team },
    { count: faqs },
    { count: tours },
    { count: posts },
    { count: gallery },
  ] = await Promise.all([
    supabase.from("booking_requests").select("*", { count: "exact", head: true }),
    supabase.from("booking_requests").select("*", { count: "exact", head: true }).eq("admin_seen", false),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("admin_seen", false),
    supabase.from("packages").select("*", { count: "exact", head: true }),
    supabase.from("destinations").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("team_members").select("*", { count: "exact", head: true }),
    supabase.from("faqs").select("*", { count: "exact", head: true }),
    supabase.from("tour_departures").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: t("bookingRequests"), value: bookings ?? 0, href: "/admin/bookings" },
    { label: t("newUnseenBookings"), value: unseenBookings ?? 0, href: "/admin/bookings" },
    { label: t("contactMessages"), value: contacts ?? 0, href: "/admin/contacts" },
    { label: t("newUnseenContacts"), value: unseenContacts ?? 0, href: "/admin/contacts" },
    { label: tNav("packages"), value: packages ?? 0, href: "/admin/packages" },
    { label: tNav("upcomingTours"), value: tours ?? 0, href: "/admin/upcoming-tours" },
    { label: tNav("destinations"), value: destinations ?? 0, href: "/admin/destinations" },
    { label: tNav("services"), value: services ?? 0, href: "/admin/services" },
    { label: tNav("team"), value: team ?? 0, href: "/admin/team" },
    { label: tNav("faqs"), value: faqs ?? 0, href: "/admin/faqs" },
    { label: tNav("blog"), value: posts ?? 0, href: "/admin/blog" },
    { label: tNav("gallery"), value: gallery ?? 0, href: "/admin/gallery" },
  ];

  const [{ data: recentBookings }, { data: recentContacts }] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id, full_name, email, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_submissions")
      .select("id, full_name, email, subject, created_at, admin_seen")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href + card.label}
            href={card.href}
            className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted/40"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("recentBookings")}</h2>
        <div className="overflow-hidden rounded-2xl border border-border">
          {(recentBookings ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{t("noBookings")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentBookings?.map((row) => (
                <li key={row.id}>
                  <Link href={`/admin/bookings/${row.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40">
                    <div>
                      <p className="font-medium">{row.full_name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{row.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("recentContacts")}</h2>
        <div className="overflow-hidden rounded-2xl border border-border">
          {(recentContacts ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{t("noContacts")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentContacts?.map((row) => (
                <li key={row.id}>
                  <Link href={`/admin/contacts/${row.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40">
                    <div>
                      <p className="font-medium">
                        {row.full_name}
                        {!row.admin_seen && (
                          <span className="ms-2 inline-block h-2 w-2 rounded-full bg-primary" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("contactUsInquiry")} · {row.email}
                        {row.subject ? ` · ${row.subject}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
