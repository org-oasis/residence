export interface Booking {
  id: string;
  apartment_id: string;
  start_date: string;
  end_date: string;
  /** Admin only: holds guest names, so it is absent from the visitor payload. */
  note?: string | null;
  /**
   * Where the row came from, and which reservation it belongs to. Rows sharing
   * a qualified value (one containing a colon) and touching dates form a single
   * reservation:
   *   `airbnb:<apt>:<uid>`   one guest reservation — unique, so never merges
   *   `airbnb:<apt>:block`   blocked-off days — shared, so consecutive ones merge
   *   `manual:<fingerprint>` manual block, fingerprinted from its note so blocks
   *                          group without the note ever reaching visitors
   * Bare `airbnb` / `manual` predate this and simply never merge.
   */
  source?: string | null;
  created_at?: string;
}

export interface BookingRange {
  start: Date;
  end: Date;
}
