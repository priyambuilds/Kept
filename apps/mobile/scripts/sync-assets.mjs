// Copies the raster assets the app needs from design/assets (read-only) into apps/mobile/assets,
// renaming "-2x.png" → "@2x.png" and "-3x.png" → "@3x.png" so Metro picks densities (design/assets.md).
// Run after the design package changes: pnpm --filter @kept/mobile assets:sync
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const design = new URL("../../../design/assets/", import.meta.url).pathname;
const out = new URL("../assets/", import.meta.url).pathname;
const jobs = [
  ["keeper/png", "keeper", () => true],
  ["objects", "objects", (f) => f.endsWith(".png")],
  ["gestures", "gestures", (f) => f.endsWith(".png")],
  ["money", "money", (f) => f.endsWith(".png")],
  ["brand", "brand", (f) => f.endsWith(".png")],
];
let n = 0;
for (const [from, to, keep] of jobs) {
  mkdirSync(join(out, to), { recursive: true });
  for (const f of readdirSync(join(design, from)).filter(keep)) {
    copyFileSync(join(design, from, f), join(out, to, f.replace(/-([23])x\.png$/, "@$1x.png")));
    n++;
  }
}
console.log(`synced ${n} files into apps/mobile/assets`);
