import { redirectToLocalePath } from "@/lib/locale-redirect";

export default async function HotelDetailRedirect() {
  await redirectToLocalePath("/destinations");
}
