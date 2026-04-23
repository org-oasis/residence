import { useEffect, useState } from "react";

const ADMIN_HASH =
  "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec";

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
 * Calendar admin gate: returns true when `?calendar=<secret>` is present
 * in the URL and its SHA-512 digest matches the hardcoded admin hash.
 * Note: client-only check, suitable for soft-gating UI affordances.
 * Real authorization happens server-side via Supabase RLS.
 */
export function useAdminGate(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
