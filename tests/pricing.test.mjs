import { describe, expect, test } from "bun:test";

import { allApartments, PRICE_EUR_MAX, PRICE_EUR_MIN } from "../src/data/appData.ts";
import {
  currentSeasonKey,
  DZD_PER_EUR,
  EXTRA_PERSON_FEE,
  eurFrom,
  peakRateDzd,
  rateDzd,
  SEASON_DISPLAY_ORDER,
  SEASON_RATES_DZD,
  SEASON_WINDOWS,
  TIER_CAPACITY,
  TIERS,
  tierForType,
  WEEKLY_DISCOUNT_MIN_NIGHTS,
  WEEKLY_DISCOUNT_PCT,
} from "../src/data/pricing.ts";

const TIER_KEYS = ["studio", "f2", "f2jacuzzi", "f3"];
const SEASON_KEYS = ["base", "juneEarly", "juneLate", "summer", "septEarly", "septLate"];

/** Build a Date in local time (currentSeasonKey reads getMonth/getDate, not UTC). */
const localDate = (mmdd) => new Date(2026, Number(mmdd.slice(0, 2)) - 1, Number(mmdd.slice(3, 5)));

describe("pricing grid completeness", () => {
  test("every season declares a rate for every tier", () => {
    expect(Object.keys(SEASON_RATES_DZD).sort()).toEqual([...SEASON_KEYS].sort());
    for (const season of SEASON_KEYS) {
      expect(Object.keys(SEASON_RATES_DZD[season]).sort()).toEqual([...TIER_KEYS].sort());
    }
  });

  test("all 24 rates are positive round numbers", () => {
    for (const season of SEASON_KEYS) {
      for (const tier of TIER_KEYS) {
        const rate = rateDzd(tier, season);
        expect(Number.isInteger(rate)).toBe(true);
        expect(rate).toBeGreaterThan(0);
      }
    }
  });

  test("the display order lists each season exactly once, base last", () => {
    expect([...SEASON_DISPLAY_ORDER].sort()).toEqual([...SEASON_KEYS].sort());
    expect(SEASON_DISPLAY_ORDER.at(-1)).toBe("base");
  });
});

describe('"from" price honesty', () => {
  // The whole site advertises TIERS[x].dzd as an "à partir de" price. If any dated
  // season ever undercuts the base rate, that claim becomes false advertising.
  test("base rate is the cheapest rate of its tier", () => {
    for (const tier of TIER_KEYS) {
      const cheapest = Math.min(...SEASON_KEYS.map((season) => rateDzd(tier, season)));
      expect(SEASON_RATES_DZD.base[tier]).toBe(cheapest);
    }
  });

  test("TIERS mirrors the base row and converts to EUR consistently", () => {
    for (const tier of TIER_KEYS) {
      expect(TIERS[tier].dzd).toBe(SEASON_RATES_DZD.base[tier]);
      expect(TIERS[tier].eur).toBe(eurFrom(SEASON_RATES_DZD.base[tier]));
      expect(TIERS[tier].capacity).toBe(TIER_CAPACITY[tier]);
    }
  });

  test("peakRateDzd is the maximum of the column and never below base", () => {
    for (const tier of TIER_KEYS) {
      const peak = peakRateDzd(tier);
      expect(peak).toBe(Math.max(...SEASON_KEYS.map((season) => rateDzd(tier, season))));
      expect(peak).toBeGreaterThanOrEqual(TIERS[tier].dzd);
    }
  });

  test("summer is the peak season for every tier", () => {
    for (const tier of TIER_KEYS) {
      expect(SEASON_RATES_DZD.summer[tier]).toBe(peakRateDzd(tier));
    }
  });
});

describe("season windows", () => {
  test("windows are chronological, non-overlapping and contiguous", () => {
    for (const { from, to } of SEASON_WINDOWS) {
      expect(from).toMatch(/^\d{2}-\d{2}$/);
      expect(to).toMatch(/^\d{2}-\d{2}$/);
      expect(from < to).toBe(true);
    }
    for (let i = 1; i < SEASON_WINDOWS.length; i += 1) {
      expect(SEASON_WINDOWS[i].from).toBe(SEASON_WINDOWS[i - 1].to);
    }
  });

  test("every dated window maps to a declared season", () => {
    const dated = SEASON_WINDOWS.map((w) => w.key);
    expect([...dated].sort()).toEqual(SEASON_KEYS.filter((k) => k !== "base").sort());
  });

  test("currentSeasonKey is start-inclusive and end-exclusive at each boundary", () => {
    for (const { key, from, to } of SEASON_WINDOWS) {
      expect(currentSeasonKey(localDate(from))).toBe(key);
      // The day before the window opens must never already be in it.
      const dayBefore = localDate(from);
      dayBefore.setDate(dayBefore.getDate() - 1);
      expect(currentSeasonKey(dayBefore)).not.toBe(key);
      // `to` is exclusive: it belongs to the next window (or to "base").
      expect(currentSeasonKey(localDate(to))).not.toBe(key);
    }
  });

  test("dates outside every window fall back to base", () => {
    for (const mmdd of ["01-01", "03-15", "05-31", "10-01", "12-31"]) {
      expect(currentSeasonKey(localDate(mmdd))).toBe("base");
    }
  });

  test("mid-window sampling picks the expected season", () => {
    expect(currentSeasonKey(localDate("06-07"))).toBe("juneEarly");
    expect(currentSeasonKey(localDate("06-20"))).toBe("juneLate");
    expect(currentSeasonKey(localDate("08-01"))).toBe("summer");
    expect(currentSeasonKey(localDate("09-10"))).toBe("septEarly");
    expect(currentSeasonKey(localDate("09-20"))).toBe("septLate");
  });
});

describe("tier mapping and capacity", () => {
  test("tierForType covers every apartment type used in appData", () => {
    for (const apt of allApartments) {
      const tier = tierForType(apt.type);
      expect(TIER_KEYS).toContain(tier);
      // The card price must come from the tier the type maps to, otherwise the
      // detail page and the seasonal grid would advertise different numbers.
      expect(apt.pricedz).toBe(TIERS[tier].dzd);
      expect(apt.priceeur).toBe(TIERS[tier].eur);
      expect(apt.capacity).toBe(TIER_CAPACITY[tier]);
    }
  });

  test("tierForType maps the known labels and defaults unknown ones to f2", () => {
    expect(tierForType("Studio")).toBe("studio");
    expect(tierForType("F2")).toBe("f2");
    expect(tierForType("F2-jacuzzi")).toBe("f2jacuzzi");
    expect(tierForType("F3")).toBe("f3");
    expect(tierForType("something-unknown")).toBe("f2");
  });

  test("capacities are positive integers and the F3 is the largest tier", () => {
    for (const tier of TIER_KEYS) {
      expect(Number.isInteger(TIER_CAPACITY[tier])).toBe(true);
      expect(TIER_CAPACITY[tier]).toBeGreaterThan(0);
    }
    expect(TIER_CAPACITY.f3).toBe(Math.max(...Object.values(TIER_CAPACITY)));
  });

  test("the price filter bounds match the cheapest and dearest tier on sale", () => {
    expect(PRICE_EUR_MIN).toBe(Math.min(...allApartments.map((a) => a.priceeur)));
    expect(PRICE_EUR_MAX).toBe(Math.max(...allApartments.map((a) => a.priceeur)));
    expect(PRICE_EUR_MIN).toBeGreaterThan(0);
    expect(PRICE_EUR_MIN).toBeLessThanOrEqual(PRICE_EUR_MAX);
  });
});

describe("commercial constants", () => {
  test("the weekly discount stays a sane percentage from a sane threshold", () => {
    expect(WEEKLY_DISCOUNT_PCT).toBeGreaterThan(0);
    expect(WEEKLY_DISCOUNT_PCT).toBeLessThan(100);
    expect(WEEKLY_DISCOUNT_MIN_NIGHTS).toBeGreaterThanOrEqual(2);
  });

  test("EUR conversion is a positive rate and rounds to whole euros", () => {
    expect(DZD_PER_EUR).toBeGreaterThan(0);
    expect(eurFrom(DZD_PER_EUR)).toBe(1);
    expect(Number.isInteger(eurFrom(SEASON_RATES_DZD.base.studio))).toBe(true);
  });

  test("the extra-person fee is consistent with the display rate", () => {
    expect(EXTRA_PERSON_FEE.dzd).toBeGreaterThan(0);
    // The EUR figure is a hand-rounded display value (1000 DZD ≈ 4 €, advertised
    // as 5 €), so only guard against a real drift, not against that 1 € rounding.
    expect(Math.abs(EXTRA_PERSON_FEE.eur - eurFrom(EXTRA_PERSON_FEE.dzd))).toBeLessThanOrEqual(1);
    expect(EXTRA_PERSON_FEE.maxExtra).toBeGreaterThan(0);
  });
});
