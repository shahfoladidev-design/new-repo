import { redirectToLocalePath } from "@/lib/locale-redirect";

export default async function HotelsRedirectPage() {
  await redirectToLocalePath("/destinations");
}
