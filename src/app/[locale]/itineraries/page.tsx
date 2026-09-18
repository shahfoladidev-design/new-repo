import { redirectToLocalePath } from "@/lib/locale-redirect";

export default async function ItinerariesRedirectPage() {
  await redirectToLocalePath("/packages");
}
