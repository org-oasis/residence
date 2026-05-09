#!/usr/bin/env bun
/**
 * Sync Airbnb iCal calendars into the Supabase `bookings` table.
 *
 * For each apartment with a configured AIRBNB_*_CALENDAR env var, fetches the
 * listing's iCal export, extracts busy ranges and upserts them as rows with
 * source='airbnb' (keyed by external_uid). Rows created manually via the
 * admin panel (source='manual') are never touched. Airbnb rows that disappear
 * from the feed (cancellations) are deleted, but only future ones — past
 * rows are kept as history.
 *
 * Required env:
 *   SUPABASE_URL         (falls back to VITE_SUPABASE_URL)
 *   SUPABASE_SECRET_KEY  sb_secret_... — server-side only, never in the client
 *   AIRBNB_*_CALENDAR    iCal export URLs; missing ones are skipped
 *
 * Usage: bun scripts/sync-airbnb.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";

const CALENDARS = [
  { envVar: "AIRBNB_STUDIO_1_CALENDAR", apartmentId: "1" },
  { envVar: "AIRBNB_F2_2_CALENDAR", apartmentId: "2" },
  { envVar: "AIRBNB_F2_3_CALENDAR", apartmentId: "3" },
  { envVar: "AIRBNB_F2_4_CALENDAR", apartmentId: "4" },
  { envVar: "AIRBNB_F2_5_CALENDAR", apartmentId: "5" },
  { envVar: "AIRBNB_F2_6_CALENDAR", apartmentId: "6" },
  { envVar: "AIRBNB_F3_7_CALENDAR", apartmentId: "7" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Unfold RFC 5545 folded lines (continuation lines start with space/tab). */
export function unfoldIcsLines(text) {
  const lines = text.split(/\r\n|\n|\r/);
  const out = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

/** "20260710" or "20260710T120000Z" → "2026-07-10". */
export function icsDateToIso(value) {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(value.trim());
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Shift an ISO date by n days (UTC-safe). */
export function shiftIsoDate(iso, days) {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Parse an Airbnb iCal export into events.
 * Returns [{ uid, startDate, endDateExclusive, summary, description }].
 */
export function parseIcs(text) {
  const events = [];
  let current = null;
  for (const line of unfoldIcsLines(text)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.startDate && current?.endDateExclusive) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const name = line.slice(0, colon).split(";")[0].toUpperCase();
    const value = line.slice(colon + 1);
    if (name === "UID") current.uid = value.trim();
    else if (name === "DTSTART") current.startDate = icsDateToIso(value);
    else if (name === "DTEND") current.endDateExclusive = icsDateToIso(value);
    else if (name === "SUMMARY") current.summary = value.trim();
    else if (name === "DESCRIPTION") current.description = value;
  }
  return events;
}

/** Extract the reservation code (HM...) from an event description, if any. */
export function reservationCode(description) {
  const m = /reservations\/details\/([A-Z0-9]+)/i.exec(description ?? "");
  return m ? m[1] : null;
}

/**
 * Map iCal events to `bookings` rows. iCal DTEND is exclusive (checkout day)
 * while the site's end_date is the last blocked day, hence the -1 day shift.
 * Events already fully in the past are skipped.
 */
export function buildRows(apartmentId, events, todayIso) {
  const rows = [];
  for (const event of events) {
    const endDate = shiftIsoDate(event.endDateExclusive, -1);
    if (endDate < event.startDate || endDate < todayIso) continue;
    const uid = event.uid ?? `${event.startDate}_${event.endDateExclusive}`;
    const code = reservationCode(event.description);
    const summary = event.summary ?? "Busy";
    rows.push({
      apartment_id: apartmentId,
      start_date: event.startDate,
      end_date: endDate,
      note: code ? `Airbnb — ${summary} (${code})` : `Airbnb — ${summary}`,
      source: "airbnb",
      external_uid: `airbnb:${apartmentId}:${uid}`,
    });
  }
  return rows;
}

async function fetchIcs(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const body = await response.text();
  if (!body.includes("BEGIN:VCALENDAR")) {
    throw new Error("response is not an iCal document");
  }
  return body;
}

async function syncApartment(supabase, apartmentId, icsText, todayIso, dryRun) {
  const rows = buildRows(apartmentId, parseIcs(icsText), todayIso);
  const keptUids = rows.map((row) => row.external_uid);

  const { data: existing, error: selectError } = await supabase
    .from("bookings")
    .select("id, external_uid, start_date, end_date")
    .eq("apartment_id", apartmentId)
    .eq("source", "airbnb")
    .gte("end_date", todayIso);
  if (selectError) throw new Error(`select failed: ${selectError.message}`);

  const staleIds = (existing ?? [])
    .filter((row) => !keptUids.includes(row.external_uid))
    .map((row) => row.id);

  console.log(
    `  apartment ${apartmentId}: ${rows.length} busy range(s) in feed, ` +
      `${staleIds.length} stale row(s) to remove`,
  );
  if (dryRun) {
    for (const row of rows) console.log(`    keep ${row.start_date} → ${row.end_date}`);
    return;
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from("bookings")
      .upsert(rows, { onConflict: "external_uid" });
    if (upsertError) throw new Error(`upsert failed: ${upsertError.message}`);
  }
  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .in("id", staleIds);
    if (deleteError) throw new Error(`delete failed: ${deleteError.message}`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SECRET_KEY.");
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, { auth: { persistSession: false } });
  const todayIso = new Date().toISOString().slice(0, 10);
  const failures = [];
  let synced = 0;

  for (const { envVar, apartmentId } of CALENDARS) {
    const icalUrl = process.env[envVar];
    if (!icalUrl || icalUrl.trim().length === 0) {
      console.log(`- ${envVar} not set, skipping apartment ${apartmentId}`);
      continue;
    }
    console.log(`- syncing apartment ${apartmentId} (${envVar})${dryRun ? " [dry-run]" : ""}`);
    try {
      const icsText = await fetchIcs(icalUrl);
      await syncApartment(supabase, apartmentId, icsText, todayIso, dryRun);
      synced += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  FAILED apartment ${apartmentId}: ${message}`);
      failures.push(apartmentId);
    }
  }

  console.log(`Done: ${synced} calendar(s) synced, ${failures.length} failure(s).`);
  if (failures.length > 0) process.exit(1);
}

if (import.meta.main) {
  await main();
}
