// SINGLE SOURCE OF TRUTH for all pricing AND tier-level capacity across the site.
// Editing this file updates: apartment cards (from-price + seasonal grid), apartment
// detail pages, apartment-page price filter bounds, blog price tables (regenerated
// via `bun run blog:gen`), and JSON-LD Offers/Apartment schemas.

/** Apartment tiers. `f2jacuzzi` = F2 with private jacuzzi. */
export type TierKey = "studio" | "f2" | "f2jacuzzi" | "f3";

/** Pricing periods: 5 dated seasons + "base" for the rest of the year. */
export type SeasonKey =
  | "base"
  | "juneEarly"
  | "juneLate"
  | "summer"
  | "septEarly"
  | "septLate";

// ─────────────────────────────────────────────────────────────────────────
// EDIT PRICES HERE — nightly rate in DZD, per tier and per period.
// ─────────────────────────────────────────────────────────────────────────
export const SEASON_RATES_DZD: Record<SeasonKey, Record<TierKey, number>> = {
  // Tout le reste de l'année
  base: { studio: 4500, f2: 5000, f2jacuzzi: 13000, f3: 10000 },
  // 1 – 15 juin
  juneEarly: { studio: 6000, f2: 7500, f2jacuzzi: 15000, f3: 15000 },
  // 15 – 30 juin
  juneLate: { studio: 7500, f2: 10000, f2jacuzzi: 17000, f3: 20000 },
  // Juillet – Août
  summer: { studio: 10000, f2: 12000, f2jacuzzi: 20000, f3: 30000 },
  // 1 – 15 septembre
  septEarly: { studio: 7500, f2: 10000, f2jacuzzi: 17000, f3: 20000 },
  // 15 – 30 septembre
  septLate: { studio: 6000, f2: 7500, f2jacuzzi: 15000, f3: 15000 },
};

/** Stay-length discount: −10% from 7 nights. */
export const WEEKLY_DISCOUNT_PCT = 10;
export const WEEKLY_DISCOUNT_MIN_NIGHTS = 7;

/** Display conversion rate used to derive the "≈ €" figures. */
export const DZD_PER_EUR = 250;

/** Base capacity per tier (guests included in the listed price). */
export const TIER_CAPACITY: Record<TierKey, number> = {
  studio: 3,
  f2: 4,
  f2jacuzzi: 4,
  f3: 6,
};

/** Season windows as MM-DD, start inclusive / end exclusive; anything else is "base". */
export const SEASON_WINDOWS: ReadonlyArray<{
  key: Exclude<SeasonKey, "base">;
  from: string;
  to: string;
}> = [
  { key: "juneEarly", from: "06-01", to: "06-15" },
  { key: "juneLate", from: "06-15", to: "07-01" },
  { key: "summer", from: "07-01", to: "09-01" },
  { key: "septEarly", from: "09-01", to: "09-15" },
  { key: "septLate", from: "09-15", to: "10-01" },
];

/** Chronological order used by the seasonal-pricing UI ("base" shown last). */
export const SEASON_DISPLAY_ORDER: readonly SeasonKey[] = [
  "juneEarly",
  "juneLate",
  "summer",
  "septEarly",
  "septLate",
  "base",
];

export function eurFrom(dzd: number): number {
  return Math.round(dzd / DZD_PER_EUR);
}

export function rateDzd(tier: TierKey, season: SeasonKey): number {
  return SEASON_RATES_DZD[season][tier];
}

/** Highest nightly rate across the year (peak season) for a tier. */
export function peakRateDzd(tier: TierKey): number {
  return Math.max(...Object.values(SEASON_RATES_DZD).map((rates) => rates[tier]));
}

/** Season active on a given date ("base" when no dated window matches). */
export function currentSeasonKey(date: Date = new Date()): SeasonKey {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mmdd = `${mm}-${dd}`;
  const match = SEASON_WINDOWS.find((w) => mmdd >= w.from && mmdd < w.to);
  return match?.key ?? "base";
}

/** Map an apartment `type` from appData ("Studio", "F2-jacuzzi", …) to its tier. */
export function tierForType(type: string): TierKey {
  switch (type) {
    case "Studio":
      return "studio";
    case "F2-jacuzzi":
      return "f2jacuzzi";
    case "F3":
      return "f3";
    default:
      return "f2";
  }
}

export interface TierPricing {
  eur: number;
  dzd: number;
  /** Base capacity (number of guests included in the listed price). */
  capacity: number;
}

/**
 * Year-round "from" price (rest-of-year base rate) + capacity per tier.
 * Consumed by appData (cards, filter bounds, SEO), navigation OG text,
 * JSON-LD offers and the blog generator.
 */
export const TIERS: Record<TierKey, TierPricing> = {
  studio: {
    eur: eurFrom(SEASON_RATES_DZD.base.studio),
    dzd: SEASON_RATES_DZD.base.studio,
    capacity: TIER_CAPACITY.studio,
  },
  f2: {
    eur: eurFrom(SEASON_RATES_DZD.base.f2),
    dzd: SEASON_RATES_DZD.base.f2,
    capacity: TIER_CAPACITY.f2,
  },
  f2jacuzzi: {
    eur: eurFrom(SEASON_RATES_DZD.base.f2jacuzzi),
    dzd: SEASON_RATES_DZD.base.f2jacuzzi,
    capacity: TIER_CAPACITY.f2jacuzzi,
  },
  f3: {
    eur: eurFrom(SEASON_RATES_DZD.base.f3),
    dzd: SEASON_RATES_DZD.base.f3,
    capacity: TIER_CAPACITY.f3,
  },
};

/** Surcharge per extra occupant above the apartment's listed capacity. */
export const EXTRA_PERSON_FEE = {
  eur: 5,
  dzd: 1000,
  /** Maximum extra persons allowed above declared capacity. */
  maxExtra: 2,
} as const;
