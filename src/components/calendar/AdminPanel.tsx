import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBookingRange } from "./utils";
import type { Booking } from "./types";

interface Props {
  bookings: Booking[];
  selectedDates: Date[];
  actionError: string | null;
  localeCode: string;
  onClearSelection: () => void;
  onCreateBooking: () => void;
  onEditBooking: (booking: Booking) => void;
}

/**
 * Admin-only UI: selection toolbar + list of existing bookings with edit affordance.
 * Surfaced below the calendar when `useAdminGate` returns true.
 */
export default function AdminPanel({
  bookings,
  selectedDates,
  actionError,
  localeCode,
  onClearSelection,
  onCreateBooking,
  onEditBooking,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="w-full mt-4 flex flex-col gap-3">
      {selectedDates.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t.apartments.calendar.selectedCount.replace("{n}", String(selectedDates.length))}
          </span>
          <Button size="sm" onClick={onCreateBooking}>
            {t.apartments.calendar.blockSelection}
          </Button>
          <Button size="sm" variant="outline" onClick={onClearSelection}>
            {t.apartments.calendar.clearSelection}
          </Button>
        </div>
      )}

      {actionError && <div className="text-xs text-red-600 text-center">{actionError}</div>}

      {bookings.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
            {t.apartments.calendar.existingBookings} ({bookings.length})
          </div>
          <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors flex items-center justify-between gap-3"
                  onClick={() => onEditBooking(booking)}
                >
                  <span className="font-medium">{formatBookingRange(booking, localeCode)}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[50%]">
                    {booking.note || ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
