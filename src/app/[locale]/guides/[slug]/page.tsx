import { redirectToLocalePath } from "@/lib/locale-redirect";

export default async function GuideDetailRedirect() {
  await redirectToLocalePath("/team");
}
