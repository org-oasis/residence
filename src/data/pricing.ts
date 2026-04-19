// SINGLE SOURCE OF TRUTH for all pricing AND tier-level capacity across the site.
// Editing this file updates: apartment cards, apartment detail pages, apartment-page
// price filter bounds, blog price tables (regenerated via `bun run blog:gen`),
// and JSON-LD Offers/Apartment schemas.
//
// TODO (future coverage):
//   - Surface the extra-person fee on apartment cards / detail UI (currently mentioned
//     in blog only — see {{EXTRA_PERSON_NOTE}} token).
//   - Add seasonal multipliers here so the seasonal-pricing dropdown in
//     ApartmentCard.tsx (currently hard-coded) and the blog seasonal table both
//     derive from a single source.
//   - Localize tier labels here too so the blog generator stops duplicating
//     "Studio Deluxe" / "F2 Classique" / etc.

export interface TierPricing {
  eur: number;
  dzd: number;
  /** Base capacity (number of guests included in the listed price). */
  capacity: number;
}

/** Base nightly rate + capacity per apartment tier (high-season reference). */
export const TIERS = {
  studio: { eur: 40, dzd: 10000, capacity: 2 },
  f2: { eur: 45, dzd: 12000, capacity: 4 },
  f2jacuzzi: { eur: 70, dzd: 20000, capacity: 4 },
  f3: { eur: 110, dzd: 30000, capacity: 6 },
} as const satisfies Record<string, TierPricing>;

export type TierKey = keyof typeof TIERS;

/** Surcharge per extra occupant above the apartment's listed capacity. */
export const EXTRA_PERSON_FEE = {
  eur: 5,
  dzd: 1000,
  /** Maximum extra persons allowed above declared capacity. */
  maxExtra: 2,
} as const;
