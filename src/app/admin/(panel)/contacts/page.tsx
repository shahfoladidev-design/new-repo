import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { getTranslations } from "next-intl/server";

export default async function AdminContactsPage() {
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.contacts");
  const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <div className="space-y-3">
        {(data ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/admin/contacts/${c.id}`}
            className="block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:bg-muted/50"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-foreground">
                {c.full_name}
                {!c.admin_seen && (
                  <span className="ms-2 inline-block h-2 w-2 rounded-full bg-primary" />
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t("inquiryType")}
                </span>
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{c.email} · {c.subject}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{c.message}</p>
          </Link>
        ))}
        {!data?.length && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
