import { createClient } from "@supabase/supabase-js";
import { log } from "@/lib/logger";

// New Supabase key model (recommended as of 2025):
// - publishable key  (sb_publishable_...) → safe to expose in the client bundle
// - secret key       (sb_secret_...)      → server-side only, NEVER ship to the client
//
// For this SPA (ssr:false) only the publishable key belongs in the bundle.
// Fallback to the legacy anon key keeps older local .env files working during
// the key rotation window; emit a console warning so we notice the migration.

const url = import.meta.env.VITE_SUPABASE_URL ?? "";

const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? // legacy fallback
  "";

if (!url || !publishableKey) {
  log.error(
    "Supabase: missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — database features disabled.",
  );
}

if (
  !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  log.warn(
    "Supabase: using legacy VITE_SUPABASE_ANON_KEY. Rotate to VITE_SUPABASE_PUBLISHABLE_KEY (sb_publishable_…).",
  );
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  publishableKey || "placeholder-key"
);
