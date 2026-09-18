import { redirectToLocalePath } from "@/lib/locale-redirect";

export default async function ItineraryDetailRedirect() {
  await redirectToLocalePath("/packages");
}
