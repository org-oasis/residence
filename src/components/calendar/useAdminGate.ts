import { useEffect, useState } from "react";

// Build-time secret. Absent from the repo on purpose: set VITE_ADMIN_GATE_HASH
// (SHA-512 hex of the chosen secret) in the deploy environment. When unset the
// gate stays closed rather than falling back to a shipped default.
const ADMIN_HASH = (import.meta.env.VITE_ADMIN_GATE_HASH ?? "")
  .trim()
  .toLowerCase();

async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSecretFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("calendar");
}

/**
 * Calendar admin gate: returns true when `?calendar=<secret>` is present in the
 * URL and its SHA-512 digest matches VITE_ADMIN_GATE_HASH.
 *
 * This is a UI convenience only — it hides the admin affordances from casual
 * visitors and nothing more. The comparison runs in the browser against a hash
 * shipped in the bundle, so anyone can flip the flag with a debugger, and the
 * Supabase table is currently readable and writable by the publishable key
 * regardless of this gate. There is NO server-side authorization today; see
 * docs/sql/ for the RLS migration that would add one.
 */
export function useAdminGate(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!ADMIN_HASH) return;
    const secret = getSecretFromUrl();
    if (!secret) return;
    void (async () => {
      const hash = await sha512(secret);
      if (!cancelled) setIsAdmin(hash === ADMIN_HASH);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return isAdmin;
}
