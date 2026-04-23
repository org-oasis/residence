import type { CSSProperties } from "react";
import type { DayButtonProps } from "react-day-picker";
import { differenceInCalendarDays, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { findBookingForDate, isFirstDayOfBooking, parseIsoDate } from "./utils";
import type { Booking } from "./types";

interface Props extends DayButtonProps {
  isAdmin: boolean;
  bookings: Booking[];
  onBookingClick: (date: Date) => void;
}

/**
 * Custom DayPicker DayButton that:
 * - Routes clicks on booked cells to the admin edit handler.
 * - Renders the booking note label spanning consecutive days within the same week.
 */
export default function CustomDayButton({
  day,
  modifiers,
  onClick,
  className,
  children,
  isAdmin,
  bookings,
  onBookingClick,
  ...rest
}: Props) {
  const date = day.date;
  const booking = isAdmin ? findBookingForDate(date, bookings) : null;
  const note = booking?.note ?? null;

  // Monday-first weekday index (matches DayPicker's weekStartsOn={1}).
  const weekdayIndex = (getDay(date) + 6) % 7;
  const isFirstDay = booking ? isFirstDayOfBooking(date, booking) : false;
  const showNoteLabel = Boolean(
    isAdmin && booking && note && (isFirstDay || weekdayIndex === 0),
  );

  let noteSpan = 1;
  if (showNoteLabel && booking) {
    const remainingInBooking =
      differenceInCalendarDays(parseIsoDate(booking.end_date), date) + 1;
    const remainingInWeek = 7 - weekdayIndex;
    noteSpan = Math.max(1, Math.min(remainingInBooking, remainingInWeek));
  }

  const tooltip = isAdmin && booking ? note ?? "" : undefined;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (modifiers.disabled) return;
    if (booking) {
      onBookingClick(date);
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      type="button"
      title={tooltip}
      onClick={handleClick}
      className={cn(className, "rdp-day-button-reset")}
    >
      <span className="relative z-10">{children}</span>
      {showNoteLabel && booking && (
        <span
          className="rdp-note-label"
          aria-hidden="true"
          style={{ ["--note-span" as string]: String(noteSpan) } as CSSProperties}
        >
          <span>{note}</span>
        </span>
      )}
    </button>
  );
}
