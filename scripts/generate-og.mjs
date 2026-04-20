// Verifies that every top-menu page has a matching OG image file at
// public/og/og-<slug>.png. Throws if any is missing.
//
// Source of truth: src/data/navigation.ts — TOP_MENU_PAGES.
// No dynamic generation: OG images are hand-authored and committed to public/og/.
// Replace them there to update social previews.

import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TOP_MENU_PAGES } from "../src/data/navigation.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OG_DIR = join(__dirname, "..", "public", "og");

function fileStat(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

const missing = [];
let ok = 0;

for (const page of TOP_MENU_PAGES) {
  const file = join(OG_DIR, `og-${page.slug}.png`);
  const stat = fileStat(file);
  if (!stat || !stat.isFile()) {
    missing.push(`og-${page.slug}.png`);
    continue;
  }
  const kb = (stat.size / 1024).toFixed(1);
  console.log(`✓ og-${page.slug}.png  ${kb} KB`);
  ok++;
}

if (missing.length) {
  console.error(
    `\n✗ Missing OG image${missing.length > 1 ? "s" : ""} in public/og/:\n  - ${missing.join("\n  - ")}\n\nTop-menu page${missing.length > 1 ? "s require" : " requires"} matching PNG file${missing.length > 1 ? "s" : ""}. Add them to public/og/ and rebuild.\n`,
  );
  process.exit(1);
}

console.log(
  `All ${ok} OG image${ok > 1 ? "s" : ""} present for top-menu pages.`,
);
