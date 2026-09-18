import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const t = await getTranslations("admin.common");

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">{t("loading")}</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
