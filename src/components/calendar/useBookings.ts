import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import type { Booking, BookingRange } from "./types";
import { toIsoDate } from "./utils";

export function useBookings(apartmentId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from("bookings")
        .select("id, apartment_id, start_date, end_date, note, created_at")
        .eq("apartment_id", apartmentId)
        .order("start_date", { ascending: true });
      if (queryError) {
        setError(queryError.message);
        setBookings([]);
      } else {
        setBookings((data ?? []) as Booking[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [apartmentId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBookingsFromRuns = useCallback(
    async (runs: BookingRange[], note: string | null) => {
      if (runs.length === 0) return;
      const rows = runs.map((run) => ({
        apartment_id: apartmentId,
        start_date: toIsoDate(run.start),
        end_date: toIsoDate(run.end),
        note: note && note.trim().length > 0 ? note.trim() : null,
      }));
      const { error: insertError } = await supabase.from("bookings").insert(rows);
      if (insertError) throw new Error(insertError.message);
      await fetchBookings();
    },
    [apartmentId, fetchBookings],
  );

  const updateBookingNote = useCallback(
    async (id: string, note: string | null) => {
      const payload = { note: note && note.trim().length > 0 ? note.trim() : null };
      const { error: updateError } = await supabase
        .from("bookings")
        .update(payload)
        .eq("id", id);
      if (updateError) throw new Error(updateError.message);
      await fetchBookings();
    },
    [fetchBookings],
  );

  const deleteBooking = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from("bookings").delete().eq("id", id);
      if (deleteError) throw new Error(deleteError.message);
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
