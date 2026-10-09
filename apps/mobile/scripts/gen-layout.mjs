// Generates src/app/layout.gen.json: each screen's ambient light and hero offset (DESIGN.md §2.8–2.9).
// - tone, beam, decor icons: design/screens.md › "Layout:" lines (lock: the prototype's M1)
// - ambient: the screen's tone, else the group default (tokens color.ambient.defaultByGroup)
// - top: the spacer the prototype puts above the first block (design/reference, `SP(h)`)
// - keeper: the KeeperPlacement's size, side, height, pose and prop (design/reference, `KP(…)`)
// Run after design/ changes: pnpm --filter @kept/mobile layout:gen
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const design = new URL("../../../design/", import.meta.url);
const read = (p) => readFileSync(new URL(p, design), "utf8");

export function parseLayouts(md) {
  const out = {};
  for (const sec of md.split("\n### ").slice(1)) {
    const id = sec.split(" — ")[0].trim();
    const line = sec.match(/\*\*Layout:\*\* (.*)/)?.[1] ?? "";
    const parts = line.split(" · ").map((s) => s.trim());
    const tone = parts.find((p) => p.startsWith("tone "))?.slice(5) ?? null;
    const decor = parts.find((p) => p.startsWith("decor icons: "))?.slice(13).split(",").map((s) => s.trim()) ?? [];
    out[id] = { tone, beam: parts.includes("beam"), decor };
  }
  return out;
}

/** The prototype's screen list (window.KS), evaluated without a browser. */
function prototypeScreens() {
  const window = { KS: [] };
  const ctx = vm.createContext({ window, Number, Math, String, Object, Array, JSON });
  for (const f of ["kept-kit.js", ...[1, 2, 3, 4, 5, 6].map((i) => `kept-screens-${i}.js`)]) vm.runInContext(read(`reference/${f}`), ctx, { filename: f });
  return window.KS;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tokens = JSON.parse(read("tokens.json"));
  const byGroup = tokens.color.ambient.defaultByGroup;
  const layouts = parseLayouts(read("screens.md"));
  const out = {};
  for (const s of prototypeScreens()) {
    const blocks = typeof s.blocks === "function" ? s.blocks({}) : s.blocks ?? [];
    const first = typeof blocks[0] === "function" ? blocks[0]({}) : blocks[0];
    const l = layouts[s.id] ?? { tone: null, beam: false, decor: [] };
    const tone = s.lock ? "lock" : l.tone;
    const ambient = ["lime", "red", "ember", "vio", "sky"].includes(tone) ? tone : byGroup[s.id[0]] ?? null;
    const kp = blocks.map((b) => (typeof b === "function" ? b({}) : b)).find((b) => b?.k === "kp");
    const keeper = kp ? { size: kp.size, side: kp.side, height: kp.h, anim: kp.anim ?? null, prop: kp.prop ?? null } : null;
    out[s.id] = { tone, ambient, beam: l.beam, decor: l.decor, top: first?.k === "sp" ? first.h : 0, keeper };
  }
  const file = new URL("../src/app/layout.gen.json", import.meta.url);
  writeFileSync(file, JSON.stringify(out, null, 1) + "\n");
  console.log(`wrote ${file.pathname} (${Object.keys(out).length} screens)`);
}
