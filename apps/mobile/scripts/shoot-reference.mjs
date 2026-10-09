// Screenshots every screen of the design prototype (design/reference/KEPT Play.dc.html) at
// 390×844, device scale 3, into artifacts/reference/<id>.png (Phase 4.5).
//   node scripts/shoot-reference.mjs [--ids A0,B1]
// The prototype keeps its place in localStorage["kept-play"] ({ cur, hist, sel, invite }) and
// restores it on load, so each id is: set it, reload, wait, shoot the 390×844 phone screen.
// Uses the installed Google Chrome through playwright-core (no browser download).
import { createServer } from "node:http";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../..");
const refDir = path.join(root, "design/reference");
const out = path.join(root, "artifacts/reference");
const arg = (name, d) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : d; };
const routes = JSON.parse(readFileSync(path.join(here, "../src/app/routes.gen.json"), "utf8"));
const ids = arg("ids", "") ? arg("ids", "").split(",") : routes.map((r) => r.id);

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = createServer((req, res) => {
  const file = path.join(refDir, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(refDir) || !existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/${encodeURIComponent("KEPT Play.dc.html")}`;

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 3 });
// Freeze the prototype's auto-advance timers (2000–2200 ms: splash, signing, checks) so pending
// screens stay put; CSS animations are unaffected.
await page.addInitScript(() => {
  const st = window.setTimeout;
  window.setTimeout = (fn, ms, ...a) => (ms >= 1950 && ms <= 2300 ? 0 : st(fn, ms, ...a));
});
await page.goto(base, { waitUntil: "networkidle" });

for (const id of ids) {
  await page.evaluate((cur) => localStorage.setItem("kept-play", JSON.stringify({ cur, hist: [], sel: {}, invite: false })), id);
  await page.reload({ waitUntil: "networkidle" });
  // The id chip above the phone shows the current screen once the prototype is ready.
  const ok = await page.waitForFunction((cur) => [...document.querySelectorAll("span")].some((s) => s.textContent?.trim() === cur), id, { timeout: 8000 }).then(() => true, () => false);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1300); // entry animations
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("div")].find((d) => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 390 && Math.round(r.height) === 844; });
    el?.setAttribute("data-phone", "1");
  });
  const phone = page.locator("[data-phone='1']").first();
  await phone.screenshot({ path: path.join(out, `${id}.png`) });
  console.log(`${id.padEnd(8)} ${ok ? "ok" : "not found in the prototype"}`);
}
await browser.close();
server.close();
