// Builds artifacts/compare/index.html: the app (artifacts/screens) next to the prototype
// (artifacts/reference) and Design.pdf (artifacts/pdf, scripts/pdf-screens.py) for every screen id,
// with the shoot script's logcat errors (Phase 4.5, fidelity pass).
//   node scripts/compare.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../..");
const art = path.join(root, "artifacts");
const routes = JSON.parse(readFileSync(path.join(here, "../src/app/routes.gen.json"), "utf8"));
const pages = (() => { try { return JSON.parse(readFileSync(path.join(art, "pdf/pages.json"), "utf8")); } catch { return {}; } })();
const report = (() => { try { return JSON.parse(readFileSync(path.join(art, "screens/report.json"), "utf8")); } catch { return {}; } })();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const img = (dir, id) => (existsSync(path.join(art, dir, `${id}.png`)) ? `<img loading="lazy" src="../${dir}/${encodeURIComponent(id)}.png" alt="${esc(`${dir} ${id}`)}">` : `<div class="missing">no ${dir} shot</div>`);

const rows = routes.map(({ id, name }) => {
  const r = report[id];
  const status = !r ? "" : r.crashed ? `<span class="bad">crashed</span>` : r.errors.length ? `<span class="bad">${r.errors.length} logcat error(s)</span>` : `<span class="ok">no errors</span>`;
  const errs = r?.errors?.length ? `<pre>${esc(r.errors.join("\n"))}</pre>` : "";
  return `<section id="${esc(id)}"><h2><code>${esc(id)}</code> ${esc(name)} ${status}</h2>${errs}<div class="pair"><figure>${img("screens", id)}<figcaption>App (emulator)</figcaption></figure><figure>${img("reference", id)}<figcaption>Prototype</figcaption></figure><figure>${img("pdf", id)}<figcaption>Design.pdf${pages[id] ? ` · p. ${pages[id]}` : ""}</figcaption></figure></div></section>`;
}).join("\n");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KEPT compare</title><style>
:root{color-scheme:dark;--bg:#0b0b0c;--fg:#f2f0ea;--mute:#a1a1a8;--line:#26262a;--ok:#c5f25c;--bad:#f87171}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 system-ui,sans-serif}
header{position:sticky;top:0;z-index:1;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 16px}
header h1{margin:0 0 6px;font-size:18px}nav{display:flex;flex-wrap:wrap;gap:4px}nav a{color:var(--mute);font:12px ui-monospace,monospace;text-decoration:none;padding:2px 6px;border:1px solid var(--line);border-radius:6px}
main{padding:0 16px 80px;max-width:1280px;margin:0 auto}section{border-bottom:1px solid var(--line);padding:20px 0}
h2{font-size:15px;margin:0 0 10px}.ok{color:var(--ok);font-size:12px}.bad{color:var(--bad);font-size:12px}
pre{white-space:pre-wrap;color:var(--bad);font-size:11px;background:#18181b;padding:8px;border-radius:8px}
.pair{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}figure{margin:0}img{width:100%;height:auto;border-radius:12px;border:1px solid var(--line)}
figcaption{color:var(--mute);font-size:12px;margin-top:4px}.missing{aspect-ratio:390/844;display:grid;place-items:center;border:1px dashed var(--line);border-radius:12px;color:var(--mute)}
</style></head><body><header><h1>KEPT · app vs prototype vs Design.pdf (${routes.length} screens)</h1><nav>${routes.map((r) => `<a href="#${esc(r.id)}">${esc(r.id)}</a>`).join("")}</nav></header>
<main>${rows}</main></body></html>`;
mkdirSync(path.join(art, "compare"), { recursive: true });
writeFileSync(path.join(art, "compare/index.html"), html);
console.log(`wrote ${path.join(art, "compare/index.html")}`);
