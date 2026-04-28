#!/usr/bin/env node
import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join, parse } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const ASSETS = resolve(ROOT, "public/assets");
const VARIANT_WIDTHS = [480, 768];
const SKIP_DIRS = new Set(["WIP"]);
const VARIANT_RE = /-\d+w\.avif$/;

async function* walkAvif(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walkAvif(full);
    } else if (entry.name.endsWith(".avif") && !VARIANT_RE.test(entry.name)) {
      yield full;
    }
  }
}

async function shouldRebuild(src, target) {
  if (!existsSync(target)) return true;
  const [s, t] = await Promise.all([stat(src), stat(target)]);
  return s.mtimeMs > t.mtimeMs;
}

const SMALLEST_VARIANT = Math.min(...VARIANT_WIDTHS);

let generated = 0;
let skipped = 0;
let tinySkipped = 0;

for await (const src of walkAvif(ASSETS)) {
  const { dir, name } = parse(src);
  const meta = await sharp(src).metadata();

  // Skip the entire source only if it's smaller than the smallest variant
  // we want (e.g. logos, icons < 480w). For everything else we ALWAYS emit
  // every variant so the component's srcset never references a 404.
  // Sources between 480-767w produce a 768w file at source size thanks to
  // withoutEnlargement — small storage cost, zero broken-link cost.
  if (!meta.width || meta.width <= SMALLEST_VARIANT) {
    tinySkipped++;
    continue;
  }

  for (const w of VARIANT_WIDTHS) {
    const target = join(dir, `${name}-${w}w.avif`);
    if (!(await shouldRebuild(src, target))) {
      skipped++;
      continue;
    }
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .avif({ quality: 60, effort: 6 })
      .toFile(target);
    generated++;
  }
}

console.log(
  `Image variants: generated=${generated} skipped=${skipped} tinySkipped=${tinySkipped}`,
);
