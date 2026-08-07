import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  buildRows,
  icsDateToIso,
  parseIcs,
  shiftIsoDate,
  unfoldIcsLines,
} from "../scripts/sync-airbnb.mjs";
import {
  bookingDayCount,
  expandBookingsToDates,
  findBookingForDate,
  groupBookingsIntoStays,
  manualGroupKey,
  parseIsoDate,
  reservationKey,
  splitContiguousRuns,
  toIsoDate,
} from "../src/components/calendar/utils.ts";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const TODAY = "2026-08-07";

const booking = (start, end, source = null, id = `${start}_${end}_${source}`) => ({
  id,
  apartment_id: "x",
  start_date: start,
  end_date: end,
  note: null,
  source,
});

/**
 * The pills the calendar draws: one per reservation, clipped to today.
 * A trailing "*" marks a stay already under way, which keeps a square left edge.
 */
const stayPills = (rows, todayIso) => {
  const floor = parseIsoDate(todayIso);
  return groupBookingsIntoStays(rows)
    .filter((stay) => stay.end >= floor)
    .map((stay) => {
      const startsInPast = stay.start < floor;
      const start = startsInPast ? floor : stay.start;
      return `${toIsoDate(start)}..${toIsoDate(stay.end)}${startsInPast ? "*" : ""}`;
    });
};

const isoRuns = (dates) =>
  splitContiguousRuns(dates).map((r) => `${toIsoDate(r.start)}..${toIsoDate(r.end)}`);

/** Mirrors the Supabase filter in useBookings: `.gte("end_date", today)`. */
const currentAndFuture = (rows, todayIso) => rows.filter((r) => r.end_date >= todayIso);

/**
 * Independent re-implementation of "which nights does this feed occupy",
 * deliberately not sharing code with parseIcs/buildRows so the two can disagree.
 */
function nightsFromIcsIndependently(text, todayIso) {
  const nights = new Set();
  for (const block of text.split("BEGIN:VEVENT").slice(1)) {
    const start = /DTSTART[^:]*:(\d{4})(\d{2})(\d{2})/.exec(block);
    const end = /DTEND[^:]*:(\d{4})(\d{2})(\d{2})/.exec(block);
    if (!start || !end) continue;
    const from = Date.UTC(+start[1], +start[2] - 1, +start[3]);
    const until = Date.UTC(+end[1], +end[2] - 1, +end[3]);
    for (let t = from; t < until; t += 86400000) {
      const day = new Date(t).toISOString().slice(0, 10);
      if (day >= todayIso) nights.add(day);
    }
  }
  return nights;
}

describe("iCal parsing", () => {
  test("unfolds RFC 5545 continuation lines", () => {
    expect(unfoldIcsLines("DESCRIPTION:abc\r\n def\r\nSUMMARY:x")).toEqual([
      "DESCRIPTION:abcdef",
      "SUMMARY:x",
    ]);
  });

  test("reads both date-only and date-time forms", () => {
    expect(icsDateToIso("20260813")).toBe("2026-08-13");
    expect(icsDateToIso("20260813T120000Z")).toBe("2026-08-13");
    expect(icsDateToIso("nope")).toBeNull();
  });

  test("shifts dates across month, year and leap-day boundaries", () => {
    expect(shiftIsoDate("2026-09-01", -1)).toBe("2026-08-31");
    expect(shiftIsoDate("2027-01-01", -1)).toBe("2026-12-31");
    expect(shiftIsoDate("2028-03-01", -1)).toBe("2028-02-29");
  });

  test("a folded description does not derail the surrounding fields", () => {
    const ics = [
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20260813",
      "DTEND;VALUE=DATE:20260817",
      "SUMMARY:Reserved",
      "UID:u1@fixture.test",
      "DESCRIPTION:Reservation URL: https://example.test/hosting/reservations/de",
      " tails/HMFIXTURE1\\nPhone Number (Last 4 Digits): 0000",
      "END:VEVENT",
    ].join("\r\n");
    const [event] = parseIcs(ics);
    expect(event.startDate).toBe("2026-08-13");
    expect(event.endDateExclusive).toBe("2026-08-17");
    expect(event.uid).toBe("u1@fixture.test");
  });

  test("never persists guest-identifying data from the description", () => {
    const ics = [
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20260813",
      "DTEND;VALUE=DATE:20260817",
      "SUMMARY:Reserved",
      "UID:u1@fixture.test",
      "DESCRIPTION:Reservation URL: https://example.test/hosting/reservations/de",
      " tails/HMFIXTURE1\\nPhone Number (Last 4 Digits): 1234",
      "END:VEVENT",
    ].join("\r\n");
    const [row] = buildRows("6", parseIcs(ics), TODAY);
    const serialised = JSON.stringify(row);
    expect(serialised).not.toContain("HMFIXTURE1");
    expect(serialised).not.toContain("1234");
    expect(serialised).not.toContain("example.test");
    expect(row.note).toBe("Airbnb — Reserved");
  });
});

describe("iCal -> booking rows", () => {
  const ics = (start, end, summary = "Reserved", uid = "u@fixture.test") =>
    [
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${summary}`,
      `UID:${uid}`,
      "END:VEVENT",
    ].join("\r\n");

  test("DTEND is exclusive: the last night is the day before check-out", () => {
    const [row] = buildRows("6", parseIcs(ics("20260813", "20260817")), TODAY);
    expect([row.start_date, row.end_date]).toEqual(["2026-08-13", "2026-08-16"]);
  });

  test("a one-night stay collapses to a single day", () => {
    const [row] = buildRows("6", parseIcs(ics("20260808", "20260809")), TODAY);
    expect([row.start_date, row.end_date]).toEqual(["2026-08-08", "2026-08-08"]);
  });

  test("drops stays that already ended", () => {
    expect(buildRows("6", parseIcs(ics("20260801", "20260805")), TODAY)).toEqual([]);
  });

  test("keeps a stay that started before today and ends later", () => {
    const [row] = buildRows("6", parseIcs(ics("20260803", "20260812")), TODAY);
    expect([row.start_date, row.end_date]).toEqual(["2026-08-03", "2026-08-11"]);
  });

  test("drops a zero-night event (check-out same day as check-in)", () => {
    expect(buildRows("6", parseIcs(ics("20260810", "20260810")), TODAY)).toEqual([]);
  });

  test("namespaces external_uid per apartment so feeds cannot collide", () => {
    const [a] = buildRows("4", parseIcs(ics("20260813", "20260817", "Reserved", "same@x")), TODAY);
    const [b] = buildRows("6", parseIcs(ics("20260813", "20260817", "Reserved", "same@x")), TODAY);
    expect(a.external_uid).not.toBe(b.external_uid);
  });

  test("keeps blocks and reservations apart in the note, never in availability", () => {
    const [block] = buildRows(
      "6",
      parseIcs(ics("20260817", "20260822", "Airbnb (Not available)")),
      TODAY,
    );
    expect(block.note).toBe("Airbnb — Not available");
    expect([block.start_date, block.end_date]).toEqual(["2026-08-17", "2026-08-21"]);
  });
});

describe("occupied-day expansion", () => {
  test("de-duplicates days claimed by two overlapping bookings", () => {
    const days = expandBookingsToDates([
      booking("2026-08-02", "2026-08-04"),
      booking("2026-08-03", "2026-08-05"),
    ]);
    expect(days.map(toIsoDate).sort()).toEqual([
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
    ]);
  });

  test("ignores a booking whose end precedes its start", () => {
    expect(expandBookingsToDates([booking("2026-08-10", "2026-08-08")])).toEqual([]);
  });

  test("clips a stay in progress to today, keeping the nights still to come", () => {
    const days = expandBookingsToDates([booking("2026-08-04", "2026-08-08")], parseIsoDate(TODAY));
    expect(days.map(toIsoDate)).toEqual(["2026-08-07", "2026-08-08"]);
  });

  test("drops a stay lying entirely in the past", () => {
    expect(
      expandBookingsToDates([booking("2026-08-01", "2026-08-05")], parseIsoDate(TODAY)),
    ).toEqual([]);
  });

  test("counts inclusive days", () => {
    expect(bookingDayCount(booking("2026-08-13", "2026-08-16"))).toBe(4);
    expect(bookingDayCount(booking("2026-08-13", "2026-08-13"))).toBe(1);
  });

  test("finds the booking covering a given day", () => {
    const rows = [booking("2026-08-13", "2026-08-16")];
    expect(findBookingForDate(parseIsoDate("2026-08-15"), rows)).not.toBeNull();
    expect(findBookingForDate(parseIsoDate("2026-08-17"), rows)).toBeNull();
  });
});

describe("grouping fingerprint for manual blocks", () => {
  test("the same note yields the same key, a different note a different one", () => {
    expect(manualGroupKey("7", "Famille Bensalem")).toBe(manualGroupKey("7", "Famille Bensalem"));
    expect(manualGroupKey("7", "Famille Bensalem")).not.toBe(manualGroupKey("7", "Karim"));
  });

  test("ignores case and surrounding spaces", () => {
    expect(manualGroupKey("7", "  Famille Bensalem ")).toBe(manualGroupKey("7", "famille bensalem"));
  });

  test("the same note in two apartments never groups across them", () => {
    expect(manualGroupKey("6", "Karim")).not.toBe(manualGroupKey("7", "Karim"));
  });

  test("an empty note stays unqualified, so such blocks never group", () => {
    for (const empty of ["", "   ", null]) {
      expect(manualGroupKey("7", empty)).toBe("manual");
      expect(reservationKey({ source: manualGroupKey("7", empty) })).toBeNull();
    }
  });

  test("legacy rows written before the scheme never group", () => {
    expect(reservationKey({ source: "airbnb" })).toBeNull();
    expect(reservationKey({ source: "manual" })).toBeNull();
    expect(reservationKey({})).toBeNull();
    expect(reservationKey({ source: "airbnb:6:block" })).toBe("airbnb:6:block");
  });

  test("never contains the note itself", () => {
    expect(manualGroupKey("7", "Famille Bensalem")).not.toContain("Bensalem");
  });
});

describe("one pill per reservation", () => {
  test("two guests arriving back to back stay two pills", () => {
    const rows = [
      booking("2026-08-08", "2026-08-11", "airbnb:6:res-a"),
      booking("2026-08-12", "2026-08-14", "airbnb:6:res-b"),
    ];
    expect(stayPills(rows, TODAY)).toEqual([
      "2026-08-08..2026-08-11",
      "2026-08-12..2026-08-14",
    ]);
  });

  test("consecutive blocked days read as a single pill", () => {
    const rows = [
      booking("2026-08-07", "2026-08-08", "airbnb:7:block"),
      booking("2026-08-09", "2026-08-09", "airbnb:7:block"),
    ];
    expect(stayPills(rows, TODAY)).toEqual(["2026-08-07..2026-08-09"]);
  });

  test("blocks sharing a key but separated by a free night stay apart", () => {
    const rows = [
      booking("2026-08-07", "2026-08-08", "airbnb:7:block"),
      booking("2026-08-10", "2026-08-11", "airbnb:7:block"),
    ];
    expect(stayPills(rows, TODAY)).toEqual([
      "2026-08-07..2026-08-08",
      "2026-08-10..2026-08-11",
    ]);
  });

  test("manual blocks carrying the same note become one reservation", () => {
    const key = manualGroupKey("7", "Famille Bensalem");
    const rows = [
      booking("2026-08-07", "2026-08-09", key),
      booking("2026-08-10", "2026-08-12", key),
    ];
    expect(stayPills(rows, TODAY)).toEqual(["2026-08-07..2026-08-12"]);
  });

  test("manual blocks carrying different notes stay two reservations", () => {
    const rows = [
      booking("2026-08-07", "2026-08-09", manualGroupKey("7", "Famille Bensalem")),
      booking("2026-08-10", "2026-08-12", manualGroupKey("7", "Karim")),
    ];
    expect(stayPills(rows, TODAY)).toEqual([
      "2026-08-07..2026-08-09",
      "2026-08-10..2026-08-12",
    ]);
  });

  test("a row without a key never joins its neighbour", () => {
    const rows = [booking("2026-08-07", "2026-08-08"), booking("2026-08-09", "2026-08-10")];
    expect(stayPills(rows, TODAY)).toEqual([
      "2026-08-07..2026-08-08",
      "2026-08-09..2026-08-10",
    ]);
  });

  test("a stay already under way is clipped and keeps its square left edge", () => {
    const rows = [booking("2026-08-04", "2026-08-08", "airbnb:3:res-a")];
    expect(stayPills(rows, TODAY)).toEqual(["2026-08-07..2026-08-08*"]);
  });

  test("a stay lying entirely in the past draws nothing", () => {
    expect(stayPills([booking("2026-08-01", "2026-08-05", "airbnb:3:old")], TODAY)).toEqual([]);
  });
});

describe("regression: apartment 6, August 2026 (reported bug)", () => {
  // What the database actually held: elapsed stays kept as history alongside
  // the live ones. Painting the elapsed rows is what marked 1-5 August as
  // booked even though Airbnb no longer lists anything before the 5th.
  const dbRows = [
    booking("2026-08-01", "2026-08-01"),
    booking("2026-08-02", "2026-08-04"),
    booking("2026-08-03", "2026-08-05"),
    booking("2026-08-06", "2026-08-06"),
    booking("2026-08-07", "2026-08-07"),
    booking("2026-08-08", "2026-08-11"),
    booking("2026-08-13", "2026-08-16"),
    booking("2026-08-17", "2026-08-21"),
  ];

  test("elapsed stays no longer paint past days", () => {
    const painted = expandBookingsToDates(
      currentAndFuture(dbRows, TODAY),
      parseIsoDate(TODAY),
    ).map(toIsoDate);
    expect(painted.filter((d) => d < TODAY)).toEqual([]);
  });

  test("leaves the 12th bookable between the two occupied stretches", () => {
    const days = expandBookingsToDates(currentAndFuture(dbRows, TODAY), parseIsoDate(TODAY));
    expect(isoRuns(days)).toEqual(["2026-08-07..2026-08-11", "2026-08-13..2026-08-21"]);
    expect(days.map(toIsoDate)).not.toContain("2026-08-12");
    expect(days).toHaveLength(14);
  });

  test("draws one pill per reservation from the live feed", () => {
    const feed = readFileSync(join(FIXTURES, "apt6.ics"), "utf8");
    const rows = buildRows("6", parseIcs(feed), TODAY);
    // block, then a guest, then a guest, then a block: four separate stays.
    expect(stayPills(rows, TODAY)).toEqual([
      "2026-08-07..2026-08-07",
      "2026-08-08..2026-08-11",
      "2026-08-13..2026-08-16",
      "2026-08-17..2026-08-21",
    ]);
  });

  test("occupied days are unchanged by the grouping", () => {
    const feed = readFileSync(join(FIXTURES, "apt6.ics"), "utf8");
    const rows = buildRows("6", parseIcs(feed), TODAY);
    expect(isoRuns(expandBookingsToDates(rows, parseIsoDate(TODAY)))).toEqual([
      "2026-08-07..2026-08-11",
      "2026-08-13..2026-08-21",
    ]);
  });
});

describe("apartment 7: the 7-9 August block the owner set by hand", () => {
  const rows = buildRows("7", parseIcs(readFileSync(join(FIXTURES, "apt7.ics"), "utf8")), TODAY);

  test("the three blocked days form a single pill", () => {
    expect(stayPills(rows, TODAY)[0]).toBe("2026-08-07..2026-08-09");
  });

  test("two guests arriving back to back on the 24th stay two pills", () => {
    expect(stayPills(rows, TODAY)).toEqual([
      "2026-08-07..2026-08-09",
      "2026-08-10..2026-08-12",
      "2026-08-22..2026-08-24",
      "2026-08-25..2026-08-27",
    ]);
  });
});

describe("every apartment feed agrees with what the calendar paints", () => {
  for (let apt = 1; apt <= 7; apt += 1) {
    const feed = readFileSync(join(FIXTURES, `apt${apt}.ics`), "utf8");
    const rows = buildRows(String(apt), parseIcs(feed), TODAY);
    const painted = expandBookingsToDates(rows, parseIsoDate(TODAY)).map(toIsoDate).sort();

    test(`apartment ${apt}: painted days equal the feed's occupied nights`, () => {
      const expected = [...nightsFromIcsIndependently(feed, TODAY)].sort();
      expect(painted).toEqual(expected);
    });

    test(`apartment ${apt}: no past day, no duplicate`, () => {
      expect(painted.filter((d) => d < TODAY)).toEqual([]);
      expect(new Set(painted).size).toBe(painted.length);
    });

    test(`apartment ${apt}: occupied stretches are ordered and separated by a free day`, () => {
      const runs = splitContiguousRuns(expandBookingsToDates(rows, parseIsoDate(TODAY)));
      for (let i = 1; i < runs.length; i += 1) {
        const gapDays = (runs[i].start.getTime() - runs[i - 1].end.getTime()) / 86400000;
        expect(gapDays).toBeGreaterThan(1);
      }
      for (const run of runs) expect(run.end.getTime() >= run.start.getTime()).toBe(true);
    });

    test(`apartment ${apt}: pills are ordered, never overlap, and cover every occupied day`, () => {
      const pills = groupBookingsIntoStays(rows).filter(
        (stay) => stay.end >= parseIsoDate(TODAY),
      );
      for (let i = 1; i < pills.length; i += 1) {
        expect(pills[i].start.getTime()).toBeGreaterThan(pills[i - 1].end.getTime());
      }
      const covered = new Set();
      for (const pill of pills) {
        for (let t = pill.start.getTime(); t <= pill.end.getTime(); t += 86400000) {
          covered.add(toIsoDate(new Date(t)));
        }
      }
      for (const day of painted) expect(covered.has(day)).toBe(true);
    });

    test(`apartment ${apt}: every Airbnb reservation keeps its own pill`, () => {
      const reservationKeys = new Set(
        rows.filter((r) => !r.source.endsWith(":block")).map((r) => r.source),
      );
      const merged = groupBookingsIntoStays(rows).filter(
        (stay) =>
          stay.bookings.length > 1 && stay.bookings.some((b) => reservationKeys.has(b.source)),
      );
      expect(merged).toEqual([]);
    });
  }
});
