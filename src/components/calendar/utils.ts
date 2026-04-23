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

export function expandBookingsToDates(bookings: Booking[]): Date[] {
  const out: Date[] = [];
  for (const booking of bookings) {
    const start = parseIsoDate(booking.start_date);
    const end = parseIsoDate(booking.end_date);
    const span = differenceInCalendarDays(end, start);
    for (let i = 0; i <= span; i += 1) {
      out.push(addDays(start, i));
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
    if (differenceInCalendarDays(curr, prev) === 1) {
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

export function formatBookingRange(booking: Booking, localeCode: string): string {
  const start = parseIsoDate(booking.start_date);
  const end = parseIsoDate(booking.end_date);
  const formatter = new Intl.DateTimeFormat(localeCode, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (isSameDay(start, end)) return formatter.format(start);
  return `${formatter.format(start)} → ${formatter.format(end)}`;
}
