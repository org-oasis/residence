import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { log } from "@/lib/logger";
import type { Booking, BookingRange } from "./types";
import { manualGroupKey, toIsoDate } from "./utils";

/**
 * Stable codes surfaced to the UI in place of the raw PostgREST message, which
 * can name the table, a column or the policy that rejected the call. The
 * technical detail goes to the logger instead. Codes are language-neutral on
 * purpose: they are meant to be mapped to a locale key later on.
 */
const ERROR_CODE = {
  load: "calendar-unavailable",
  create: "calendar-save-failed",
  update: "calendar-save-failed",
  delete: "calendar-delete-failed",
} as const;

/** Logs the technical cause and returns the code the UI is allowed to show. */
function reportBookingError(
  operation: keyof typeof ERROR_CODE,
  cause: unknown,
): string {
  log.error(cause, { context: `calendar.bookings.${operation}` });
  return ERROR_CODE[operation];
}

/**
 * @param withNotes Admin only. Notes hold guest names and booking references,
 *   and the UI promises they are never shown to visitors — so they must not be
 *   in the payload a visitor's browser receives either.
 */
export function useBookings(apartmentId: string, withNotes = false) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Stays that already ended are history: they never gate availability, and
      // painting them would mark past days as booked (Airbnb drops them from its
      // feed once elapsed, so the sync can never clean them up either).
      const columns = withNotes
        ? "id, apartment_id, start_date, end_date, note, source, created_at"
        : "id, apartment_id, start_date, end_date, source, created_at";
      const { data, error: queryError } = await supabase
        .from("bookings")
        .select(columns)
        .eq("apartment_id", apartmentId)
        .gte("end_date", toIsoDate(new Date()))
        .order("start_date", { ascending: true });
      if (queryError) {
        setError(reportBookingError("load", queryError));
        setBookings([]);
      } else {
        setBookings((data ?? []) as unknown as Booking[]);
      }
    } catch (err) {
      setError(reportBookingError("load", err));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [apartmentId, withNotes]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBookingsFromRuns = useCallback(
    async (runs: BookingRange[], note: string | null) => {
      if (runs.length === 0) return;
      const cleanNote = note && note.trim().length > 0 ? note.trim() : null;
      const rows = runs.map((run) => ({
        apartment_id: apartmentId,
        start_date: toIsoDate(run.start),
        end_date: toIsoDate(run.end),
        note: cleanNote,
        // Blocks carrying the same note share a source, so they read as one
        // reservation without the note ever reaching a visitor's browser.
        source: manualGroupKey(apartmentId, cleanNote),
      }));
      const { error: insertError } = await supabase.from("bookings").insert(rows);
      // Callers render `err.message` verbatim, so it carries the code, not the
      // PostgREST wording.
      if (insertError) throw new Error(reportBookingError("create", insertError));
      await fetchBookings();
    },
    [apartmentId, fetchBookings],
  );

  const updateBookingNote = useCallback(
    async (id: string, note: string | null) => {
      const cleanNote = note && note.trim().length > 0 ? note.trim() : null;
      // The grouping follows the note: renaming a block regroups it with
      // whatever now shares that note, and parts it from what no longer does.
      const payload = { note: cleanNote, source: manualGroupKey(apartmentId, cleanNote) };
      const { error: updateError } = await supabase
        .from("bookings")
        .update(payload)
        .eq("id", id);
      if (updateError) throw new Error(reportBookingError("update", updateError));
      await fetchBookings();
    },
    [apartmentId, fetchBookings],
  );

  const deleteBooking = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from("bookings").delete().eq("id", id);
      if (deleteError) throw new Error(reportBookingError("delete", deleteError));
      await fetchBookings();
    },
    [fetchBookings],
  );

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createBookingsFromRuns,
    updateBookingNote,
    deleteBooking,
  };
}
