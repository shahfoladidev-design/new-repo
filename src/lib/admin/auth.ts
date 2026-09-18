import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin/is-admin-user";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  if (!(await isAdminUser(supabase, user.id))) redirect("/admin/login?error=unauthorized");

  return { supabase, user };
}
