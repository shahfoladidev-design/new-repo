import { requireAdmin } from "@/lib/admin/auth";
import { changeAdminEmail, changeAdminPassword } from "@/app/admin/actions/account";
import { AdminSubmitForm } from "@/components/admin/admin-submit-form";
import { getTranslations } from "next-intl/server";

export default async function AdminAccountPage() {
  const { supabase, user } = await requireAdmin();
  const t = await getTranslations("admin.account");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("email")
    .eq("user_id", user.id)
    .maybeSingle();

  const loginEmail = user.email ?? adminRow?.email ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-medium">{t("loginEmail")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{loginEmail || t("noEmail")}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-medium">{t("changePassword")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("changePasswordHint")}</p>
        </div>
        <AdminSubmitForm
          action={changeAdminPassword}
          successMessage={t("passwordUpdated")}
          className="grid gap-4"
        >
          <PasswordField label={t("currentPassword")} name="current_password" autoComplete="current-password" />
          <PasswordField label={t("newPassword")} name="new_password" autoComplete="new-password" minLength={8} />
          <PasswordField
            label={t("confirmPassword")}
            name="confirm_password"
            autoComplete="new-password"
            minLength={8}
          />
          <button type="submit" className="w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
            {t("updatePassword")}
          </button>
        </AdminSubmitForm>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-medium">{t("changeEmail")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("changeEmailHint")}</p>
        </div>
        <AdminSubmitForm action={changeAdminEmail} successMessage={t("emailUpdated")} className="grid gap-4">
          <TextField label={t("newEmail")} name="new_email" type="email" autoComplete="email" />
          <PasswordField label={t("currentPassword")} name="current_password" autoComplete="current-password" />
          <button type="submit" className="w-fit rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">
            {t("updateEmail")}
          </button>
        </AdminSubmitForm>
      </section>
    </div>
  );
}

function TextField({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="rounded-lg border border-border bg-background px-3 py-2"
      />
    </label>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
  minLength,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input
        name={name}
        type="password"
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="rounded-lg border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
