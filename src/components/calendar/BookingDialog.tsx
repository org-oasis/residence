import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Booking } from "./types";
import { formatBookingRange } from "./utils";

type Mode = "create" | "edit";

interface BookingDialogProps {
  open: boolean;
  mode: Mode;
  booking?: Booking | null;
  rangeSummary?: string;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function BookingDialog({
  open,
  mode,
  booking,
  rangeSummary,
  onClose,
  onSubmit,
  onDelete,
}: BookingDialogProps) {
  const { t, language } = useLanguage();
  const [note, setNote] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setNote(mode === "edit" ? booking?.note ?? "" : "");
  }, [open, mode, booking]);

  const localeCode = language === "fr" ? "fr-FR" : language === "ar" ? "ar-EG" : "en-US";
  const displayedRange =
    mode === "edit" && booking
      ? formatBookingRange(booking, localeCode)
      : rangeSummary ?? "";

  const handleSave = async () => {
    setBusy(true);
    try {
      await onSubmit(note);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const ok = typeof window !== "undefined" ? window.confirm(t.apartments.calendar.deleteConfirm) : true;
    if (!ok) return;
    setBusy(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? t.apartments.calendar.editBooking : t.apartments.calendar.addBooking}
          </DialogTitle>
          {displayedRange && <DialogDescription>{displayedRange}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="booking-note" className="text-sm font-medium">
            {t.apartments.calendar.noteLabel}
          </label>
          <textarea
            id="booking-note"
            className="w-full border border-border rounded-md p-2 text-sm bg-background text-foreground min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t.apartments.calendar.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {t.apartments.calendar.noteHelp}
          </p>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <div>
            {mode === "edit" && onDelete && (
              <Button variant="destructive" onClick={handleDelete} disabled={busy}>
                {t.apartments.calendar.deleteBooking}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={busy}>
              {t.apartments.calendar.cancel}
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {t.apartments.calendar.save}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
