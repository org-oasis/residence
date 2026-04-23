export interface Booking {
  id: string;
  apartment_id: string;
  start_date: string;
  end_date: string;
  note: string | null;
  created_at?: string;
}

export interface BookingRange {
  start: Date;
  end: Date;
}
