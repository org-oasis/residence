import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import "react-day-picker/style.css";
import { ar, enUS, fr } from "date-fns/locale";
import { isSameDay, startOfDay } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBookings } from "./calendar/useBookings";
import { useAdminGate } from "./calendar/useAdminGate";
import {
  expandBookingsToDates,
  findBookingForDate,
  formatDateRange,
  groupBookingsIntoStays,
  splitContiguousRuns,
} from "./calendar/utils";
import type { Booking, BookingRange } from "./calendar/types";
import { BookingDialog } from "./calendar/BookingDialog";
import CustomDayButton from "./calendar/CustomDayButton";
import AdminPanel from "./calendar/AdminPanel";

const localeMap = { fr, en: enUS, ar } as const;

interface CalendarAvailabilityProps {
  apartmentId: string;
  apartmentName?: string;
}

const LOCALE_CODE: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-EG",
};

export default function CalendarAvailability({
  apartmentId,
  apartmentName,
}: CalendarAvailabilityProps) {
  const { language, t } = useLanguage();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isAdmin = useAdminGate();

  // Every route is prerendered to static HTML, which would freeze "today" and
  // the desktop month count at build time and mismatch on hydration. Bookings
  // load in the browser anyway, so the grid is worth nothing until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dialogMode, setDialogMode] = useState<null | "create" | "edit">(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [pendingRuns, setPendingRuns] = useState<BookingRange[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    bookings,
    error: fetchError,
    createBookingsFromRuns,
    updateBookingNote,
    deleteBooking,
  } = useBookings(apartmentId, isAdmin);

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear() + 2, 11, 31);
  }, []);

  const unavailableDates = useMemo(
    () => expandBookingsToDates(bookings, today),
    [bookings, today],
  );

  // One pill per reservation: rounded on the arrival day, rounded on the last
  // night, so two guests following one another read as two stays while a run of
  // blocked days reads as one. A stay already under way keeps a square left
  // edge — capping it on today would announce an arrival that is not one.
  const shapeRuns = useMemo(
    () =>
      groupBookingsIntoStays(bookings)
        .filter((stay) => stay.end >= today)
        .map((stay) => ({
          start: stay.start < today ? today : stay.start,
          end: stay.end,
          startsInPast: stay.start < today,
        })),
    [bookings, today],
  );

  const isStandalone = (run: { start: Date; end: Date; startsInPast: boolean }) =>
    !run.startsInPast && isSameDay(run.start, run.end);

  const bookingStartDates = useMemo(
    () =>
      shapeRuns
        .filter((run) => !run.startsInPast && !isSameDay(run.start, run.end))
        .map((run) => run.start),
    [shapeRuns],
  );
  const bookingEndDates = useMemo(
    () => shapeRuns.filter((run) => !isStandalone(run)).map((run) => run.end),
    [shapeRuns],
  );
  const bookingStandaloneDates = useMemo(
    () => shapeRuns.filter(isStandalone).map((run) => run.start),
    [shapeRuns],
  );

  const locale = localeMap[language];
  const localeCode = LOCALE_CODE[language];

  // Past days are always disabled. Public visitors also have all booked dates disabled.
  const disabledDates = useMemo(() => {
    const out: Array<Date | { before: Date }> = [{ before: today }];
    if (!isAdmin) for (const d of unavailableDates) out.push(d);
    return out;
  }, [isAdmin, today, unavailableDates]);

  const handleSelect = (dates: Date[] | undefined) => {
    if (!isAdmin) return;
    const next = (dates ?? []).filter((d) => d >= today && !findBookingForDate(d, bookings));
    setSelectedDates(next);
  };

  const handleBookingClick = (date: Date) => {
    if (!isAdmin || date < today) return;
    const existing = findBookingForDate(date, bookings);
    if (existing) {
      setEditingBooking(existing);
      setDialogMode("edit");
    }
  };

  const openCreateDialog = () => {
    if (selectedDates.length === 0) return;
    setPendingRuns(splitContiguousRuns(selectedDates));
    setDialogMode("create");
  };

  const summariseRuns = (runs: BookingRange[]): string =>
    runs.map((run) => formatDateRange(run.start, run.end, localeCode)).join(" · ");

  const handleSubmitDialog = async (note: string) => {
    try {
      setActionError(null);
      if (dialogMode === "create") {
        await createBookingsFromRuns(pendingRuns, note);
        setSelectedDates([]);
        setPendingRuns([]);
      } else if (dialogMode === "edit" && editingBooking) {
        await updateBookingNote(editingBooking.id, note);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const handleDeleteDialog = async () => {
    if (!editingBooking) return;
    try {
      setActionError(null);
      await deleteBooking(editingBooking.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingBooking(null);
    setPendingRuns([]);
  };

  const sharedDayPickerProps = {
    disabled: disabledDates,
    modifiers: {
      booked: unavailableDates,
      bookingStart: bookingStartDates,
      bookingEnd: bookingEndDates,
      bookingStandalone: bookingStandaloneDates,
    },
    modifiersClassNames: {
      booked: isAdmin ? "rdp-booked-admin" : "rdp-booked-public",
      bookingStart: "rdp-booking-start",
      bookingEnd: "rdp-booking-end",
      bookingStandalone: "rdp-booking-standalone",
    },
    components: {
      DayButton: (props: DayButtonProps) => (
        <CustomDayButton
          {...props}
          isAdmin={isAdmin}
          bookings={bookings}
          onBookingClick={handleBookingClick}
        />
      ),
    },
    locale,
    weekStartsOn: 1 as const,
    startMonth: today,
    endMonth: maxDate,
    showOutsideDays: false,
    fixedWeeks: true,
    animate: true,
    navLayout: "around" as const,
    captionLayout: "label" as const,
    numberOfMonths: isDesktop ? 3 : 1,
    numerals: (language === "ar" ? "arab" : "latn") as "arab" | "latn",
  };

  return (
    <div className="flex flex-col items-center w-full">
      {apartmentName && (
        <div className="text-center mb-4">
          <span className="bg-secondary text-secondary-foreground font-semibold text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-xs border border-secondary/20">
            {apartmentName}
          </span>
        </div>
      )}

      {fetchError && <div className="text-xs text-red-600 mb-2">{fetchError}</div>}

      <div className="rdp-shell mx-auto" dir={language === "ar" ? "rtl" : "ltr"}>
        {!mounted ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t.apartments.loadingCalendar}
          </div>
        ) : isAdmin ? (
          <DayPicker
            mode="multiple"
            required={false}
            selected={selectedDates}
            onSelect={handleSelect}
            {...sharedDayPickerProps}
          />
        ) : (
          <DayPicker {...sharedDayPickerProps} />
        )}
      </div>

      {isAdmin && (
        <AdminPanel
          bookings={bookings}
          selectedDates={selectedDates}
          actionError={actionError}
          localeCode={localeCode}
          onClearSelection={() => setSelectedDates([])}
          onCreateBooking={openCreateDialog}
          onEditBooking={(b) => {
            setEditingBooking(b);
            setDialogMode("edit");
          }}
        />
      )}

      <BookingDialog
        open={dialogMode !== null}
        mode={dialogMode ?? "create"}
        booking={editingBooking}
        rangeSummary={summariseRuns(pendingRuns)}
        onClose={closeDialog}
        onSubmit={handleSubmitDialog}
        onDelete={dialogMode === "edit" && editingBooking ? handleDeleteDialog : undefined}
      />

    </div>
  );
}
