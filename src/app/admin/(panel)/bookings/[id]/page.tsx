import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getGuideLanguageLabel } from "@/lib/guide-languages";
import { deleteBooking, markBookingSeen, updateBookingNotes, updateBookingStatus } from "@/app/admin/actions/bookings";
import { updateBookingQuote, syncBookingFromCatalog } from "@/app/admin/actions/payments";
import { fetchCatalogPriceForBooking } from "@/lib/payments/catalog-price";
import { BookingNotesForm } from "@/components/admin/booking-notes-form";
import { BookingQuoteForm, formatQuoteDisplay } from "@/components/admin/booking-quote-form";
import { minorToMajor } from "@/lib/payments/money";
import { BookingStatusForm } from "@/components/admin/booking-status-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: booking } = await supabase.from("booking_requests").select("*").eq("id", id).maybeSingle();

  if (!booking) notFound();
  if (!booking.admin_seen) await markBookingSeen(id);

  const liveCatalog = await fetchCatalogPriceForBooking(
    supabase,
    booking.reference_type ?? "",
    booking.reference_slug,
    booking.package_tier === "vip" || booking.package_tier === "standard" ? booking.package_tier : null,
  );

  let catalogEditHref: string | null = null;
  if (booking.reference_slug && booking.reference_type === "package") {
    const { data } = await supabase.from("packages").select("id").eq("slug", booking.reference_slug).maybeSingle();
    if (data?.id) catalogEditHref = `/admin/packages/${data.id}`;
  } else if (booking.reference_slug && booking.reference_type === "upcoming") {
    const { data } = await supabase.from("tour_departures").select("id").eq("slug", booking.reference_slug).maybeSingle();
    if (data?.id) catalogEditHref = `/admin/upcoming-tours/${data.id}`;
  }

  const catalogLabel = liveCatalog
    ? formatQuoteDisplay(liveCatalog.price_minor, liveCatalog.currency)
    : formatQuoteDisplay(booking.reference_price_minor, booking.reference_price_currency) || null;

  const isOverride =
    liveCatalog != null &&
    booking.quoted_amount_minor != null &&
    (booking.quoted_amount_minor !== liveCatalog.price_minor ||
      booking.quoted_currency !== liveCatalog.currency);

  async function removeBooking() {
    "use server";
    return deleteBooking(id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{booking.full_name}</h1>
          <p className="text-sm text-muted-foreground">Booking request</p>
        </div>
        <AdminDeleteButton
          label="Delete booking"
          confirmTitle="Delete booking?"
          confirmMessage="Delete this booking permanently? This cannot be undone."
          successMessage="Booking deleted"
          redirectTo="/admin/bookings"
          action={removeBooking}
        />
      </div>
      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <Item label="Email" value={booking.email} />
        <Item label="Phone" value={booking.phone} />
        <Item label="Travel date" value={booking.travel_date ?? "—"} />
        <Item label="Travelers" value={String(booking.travelers ?? 1)} />
        <Item label="Nationality" value={booking.nationality ?? "—"} />
        <Item label="Preferred language" value={getGuideLanguageLabel(booking.preferred_language)} />
        <Item
          label="Reference ID"
          value={booking.reference_code ?? (booking.reference_type === "custom" ? "CUSTOM" : "—")}
        />
        <Item label="Package / service" value={booking.reference_title ?? booking.reference_slug ?? "—"} />
        {booking.package_tier ? (
          <Item
            label="Package tier"
            value={booking.package_tier === "vip" ? "VIP" : "Standard"}
          />
        ) : null}
        <Item label="Type" value={booking.reference_type ?? "general"} />
        <Item label="Status" value={booking.status} />
        <Item label="Payment" value={booking.payment_status ?? "unpaid"} />
        <Item
          label="Total amount due"
          value={formatQuoteDisplay(booking.quoted_amount_minor, booking.quoted_currency) || "—"}
        />
        <Item
          label="Paid so far"
          value={formatQuoteDisplay(booking.amount_paid_minor, booking.quoted_currency) || "—"}
        />
      </dl>
      {booking.payment_notes && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium">Payment notes (guest)</p>
          <p className="mt-2 text-sm text-muted-foreground">{booking.payment_notes}</p>
        </div>
      )}
      {booking.message && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium">Message</p>
          <p className="mt-2 text-sm text-muted-foreground">{booking.message}</p>
        </div>
      )}
      <BookingQuoteForm
        bookingId={id}
        defaultAmount={
          booking.quoted_amount_minor != null
            ? minorToMajor(BigInt(booking.quoted_amount_minor))
            : ""
        }
        catalogPriceLabel={catalogLabel}
        catalogEditHref={catalogEditHref}
        hasCatalogPrice={Boolean(liveCatalog ?? booking.reference_price_minor)}
        isOverride={Boolean(isOverride)}
        action={updateBookingQuote}
        syncFromCatalogAction={syncBookingFromCatalog}
      />
      <BookingStatusForm bookingId={id} currentStatus={booking.status} action={updateBookingStatus} />
      <BookingNotesForm bookingId={id} defaultNotes={booking.admin_notes ?? ""} action={updateBookingNotes} />
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
