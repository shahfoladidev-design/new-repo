import { getCachedBookingOffers } from "@/lib/cms-cache";
import type { BookingOfferOption } from "@/lib/booking-offers";

/** Load published packages, services, and upcoming tours for the booking dropdown (cached). */
export async function getBookingOffers(): Promise<BookingOfferOption[]> {
  return getCachedBookingOffers();
}
