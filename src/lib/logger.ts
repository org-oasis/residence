/**
 * Centralised logger. Wraps console in a thin layer so the production sink
 * can be swapped (Sentry, LogRocket, etc.) without touching call sites.
 *
 * Usage:
 *   import { log } from "@/lib/logger";
 *   log.warn("Supabase: missing env var");
 *   log.error(err, { context: "calendar.booking" });
 */

type Meta = Record<string, unknown>;

function emit(
  level: "debug" | "info" | "warn" | "error",
  message: unknown,
  meta?: Meta,
): void {
  if (typeof window === "undefined" && level === "debug") return;
  const args: unknown[] = [message];
  if (meta) args.push(meta);
  console[level](...args);
}

export const log = {
  debug: (message: unknown, meta?: Meta) => emit("debug", message, meta),
  info: (message: unknown, meta?: Meta) => emit("info", message, meta),
  warn: (message: unknown, meta?: Meta) => emit("warn", message, meta),
  error: (message: unknown, meta?: Meta) => emit("error", message, meta),
};
