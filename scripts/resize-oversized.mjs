#!/usr/bin/env node
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PUB = resolve(ROOT, "public");

const JOBS = [
  { src: "assets/COMMON/01-background.avif", width: 280 },
  { src: "assets/COMMON/02-background.avif", width: 400 },
  { src: "assets/3-F2/01.avif", width: 520 },
  { src: "assets/logo.avif", width: 128 },
];

for (const job of JOBS) {
  const abs = resolve(PUB, job.src);
  const before = (await sharp(abs).metadata());
  const buf = await sharp(abs)
    .resize({ width: job.width, withoutEnlargement: true })
    .avif({ quality: 55, effort: 6 })
    .toBuffer();
  await writeFile(abs, buf);
  const after = await sharp(abs).metadata();
  console.log(
    `${job.src}: ${before.width}x${before.height} -> ${after.width}x${after.height} (${buf.byteLength} bytes)`,
  );
}
