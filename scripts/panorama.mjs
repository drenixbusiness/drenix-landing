import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * Cuts the part of the 8K panorama the camera can see, and makes a small version of the whole for everything else.
 * Run after replacing public/hdri/landscape-8k.webp:  node scripts/panorama.mjs
 * The numbers must match VIEW and VIEW_ROWS in src/components/journey/scene/exterior.ts.
 */
sharp.cache(false);
const dir = fileURLToPath(new URL("../public/hdri/", import.meta.url));
const source = `${dir}landscape-8k.webp`;
const { width: W, height: H } = await sharp(source).metadata();

// From 40° above the horizon to 3° below it
const top = Math.round((50 / 180) * H);
const height = Math.round((93 / 180) * H) - top;

/** Columns from u0 to u1 of the panorama, which may wrap around its edge. */
async function cut(u0, u1) {
  const left = Math.round(u0 * W), width = Math.round(u1 * W) - left;
  const first = Math.min(width, W - left);
  const a = await sharp(source).extract({ left, top, width: first, height }).png().toBuffer();
  if (first === width) return a;
  const b = await sharp(source).extract({ left: 0, top, width: width - first, height }).png().toBuffer();
  return sharp({ create: { width, height, channels: 3, background: "#000" } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: first, top: 0 }])
    .png()
    .toBuffer();
}

for (const [name, u0, u1] of [["view-wide", 0.755, 1.07], ["view-tall", 0.835, 1]]) {
  await sharp(await cut(u0, u1)).webp({ quality: 78, effort: 6 }).toFile(`${dir}${name}.webp`);
  console.log(name, Math.round(statSync(`${dir}${name}.webp`).size / 1024), "KB");
}
await sharp(source).resize(1024, 512).webp({ quality: 70, effort: 6 }).toFile(`${dir}landscape-1k.webp`);
console.log("landscape-1k", Math.round(statSync(`${dir}landscape-1k.webp`).size / 1024), "KB");
