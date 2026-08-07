import { addDays, differenceInCalendarDays, isSameDay, parseISO, startOfDay } from "date-fns";
import type { Booking, BookingRange } from "./types";

export function toIsoDate(date: Date): string {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  return startOfDay(parseISO(iso));
}

/**
 * Every day covered by at least one booking, de-duplicated: Airbnb exports
 * reservations and "not available" blocks as separate events that can overlap,
 * so the same day may be claimed by several bookings.
 *
 * `from` clips the result, dropping days before it. A stay in progress starts
 * in the past, and painting those days would mark elapsed dates as booked while
 * every past date is already unselectable.
 */
export function expandBookingsToDates(bookings: Booking[], from?: Date): Date[] {
  const seen = new Set<string>();
  const out: Date[] = [];
  const floor = from ? startOfDay(from) : null;
  for (const booking of bookings) {
    const start = parseIsoDate(booking.start_date);
    const end = parseIsoDate(booking.end_date);
    const span = differenceInCalendarDays(end, start);
    for (let i = 0; i <= span; i += 1) {
      const day = addDays(start, i);
      if (floor && day < floor) continue;
      const key = toIsoDate(day);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(day);
    }
  }
  return out;
}

export function findBookingForDate(date: Date, bookings: Booking[]): Booking | null {
  const d = startOfDay(date).getTime();
  for (const booking of bookings) {
    const start = parseIsoDate(booking.start_date).getTime();
    const end = parseIsoDate(booking.end_date).getTime();
    if (d >= start && d <= end) return booking;
  }
  return null;
}

/**
 * Grouping fingerprint for a manually blocked run. The note itself never
 * reaches visitors, so blocks belonging to the same reservation are matched on
 * this instead. An empty note yields no key, so such blocks never merge.
 */
export function manualGroupKey(apartmentId: string, note: string | null): string {
  const normalised = (note ?? "").trim().toLowerCase();
  if (!normalised) return "manual";
  let hash = 0x811c9dc5;
  for (const char of `${apartmentId}|${normalised}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `manual:${hash.toString(16).padStart(8, "0")}`;
}

/**
 * The reservation a row belongs to, or null when it belongs to none. Only
 * qualified sources carry one; a bare `airbnb` or `manual` predates the scheme
 * and stands alone, which keeps unmigrated rows from merging by accident.
 */
export function reservationKey(booking: Booking): string | null {
  const source = booking.source ?? "";
  return source.includes(":") ? source : null;
}

export interface BookingStay {
  start: Date;
  end: Date;
  bookings: Booking[];
}

/**
 * One stay per reservation, in date order. Two rows join only when they carry
 * the same group key AND their dates touch, so consecutive blocked days read as
 * a single unavailable stretch while two guests arriving back to back stay two.
 * A row without a key never joins anything.
 */
export function groupBookingsIntoStays(bookings: Booking[]): BookingStay[] {
  const sorted = bookings
    .map((booking) => ({
      booking,
      start: parseIsoDate(booking.start_date),
      end: parseIsoDate(booking.end_date),
    }))
    .filter((entry) => entry.end >= entry.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime());

  const stays: BookingStay[] = [];
  for (const { booking, start, end } of sorted) {
    const previous = stays[stays.length - 1];
    const key = reservationKey(booking);
    const previousKey = previous ? reservationKey(previous.bookings[0]) : null;
    const joinsPrevious =
      previous !== undefined &&
      key !== null &&
      key === previousKey &&
      differenceInCalendarDays(start, previous.end) <= 1;

    if (joinsPrevious) {
      if (end > previous.end) previous.end = end;
      previous.bookings.push(booking);
    } else {
      stays.push({ start, end, bookings: [booking] });
    }
  }
  return stays;
}

export function splitContiguousRuns(dates: Date[]): BookingRange[] {
  if (dates.length === 0) return [];
  const sorted = [...dates]
    .map((d) => startOfDay(d))
    .sort((a, b) => a.getTime() - b.getTime());
  const runs: BookingRange[] = [];
  let runStart = sorted[0];
  let runEnd = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    // <= 1 keeps duplicate days (overlapping bookings) inside the same run.
    if (differenceInCalendarDays(curr, prev) <= 1) {
      runEnd = curr;
    } else {
      runs.push({ start: runStart, end: runEnd });
      runStart = curr;
      runEnd = curr;
    }
  }
  runs.push({ start: runStart, end: runEnd });
  return runs;
}

export function isFirstDayOfBooking(date: Date, booking: Booking): boolean {
  return isSameDay(date, parseIsoDate(booking.start_date));
}

export function isLastDayOfBooking(date: Date, booking: Booking): boolean {
  return isSameDay(date, parseIsoDate(booking.end_date));
}

export function isSingleDayBooking(booking: Booking): boolean {
  return booking.start_date === booking.end_date;
}

export function bookingDayCount(booking: Booking): number {
  const start = parseIsoDate(booking.start_date);
  const end = parseIsoDate(booking.end_date);
  return differenceInCalendarDays(end, start) + 1;
}

/**
 * Localised date range. `formatRange` is used rather than joining with an arrow
 * because a literal arrow flips against the dates under Arabic bidi reordering,
 * reading as if the stay ran backwards.
 */
export function formatDateRange(start: Date, end: Date, localeCode: string): string {
  const formatter = new Intl.DateTimeFormat(localeCode, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (isSameDay(start, end)) return formatter.format(start);
  return formatter.formatRange(start, end);
}

export function formatBookingRange(booking: Booking, localeCode: string): string {
  return formatDateRange(
    parseIsoDate(booking.start_date),
    parseIsoDate(booking.end_date),
    localeCode,
  );
}
