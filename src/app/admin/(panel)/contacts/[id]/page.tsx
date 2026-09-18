import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getTranslations } from "next-intl/server";
import { deleteContact } from "@/app/admin/actions/bookings";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function AdminContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const t = await getTranslations("admin.contacts");

  const { data: contact } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!contact) notFound();

  if (!contact.admin_seen) {
    await supabase.from("contact_submissions").update({ admin_seen: true }).eq("id", id);
  }

  async function removeContact() {
    "use server";
    return deleteContact(id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {t("inquiryType")}
          </span>
          <h1 className="text-2xl font-semibold">{contact.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(contact.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminDeleteButton
            label="Delete"
            confirmTitle="Delete contact?"
            confirmMessage="Delete this contact message permanently? This cannot be undone."
            successMessage="Contact deleted"
            redirectTo="/admin/contacts"
            action={removeContact}
          />
          <Link href="/admin/contacts" className="text-sm underline">
            {t("backToList")}
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <Item label="Email" value={contact.email} />
        <Item label="Phone" value={contact.phone ?? "—"} />
        <Item label="Subject" value={contact.subject ?? "—"} />
        <Item
          label="Status"
          value={contact.admin_seen ? t("seen") : t("new")}
          highlight={!contact.admin_seen}
        />
      </dl>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium">{t("message")}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contact.message}</p>
      </div>
    </div>
  );
}

function Item({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={highlight ? "font-medium text-primary" : "font-medium"}>{value}</dd>
    </div>
  );
}
