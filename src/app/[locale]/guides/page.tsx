import { redirectToLocalePath } from "@/lib/locale-redirect";

export default async function GuidesRedirectPage() {
  await redirectToLocalePath("/team");
}
