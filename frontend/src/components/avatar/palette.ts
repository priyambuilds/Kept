// Avatar art data from design/reference/Avatar.dc.html (also AVC in reference/kept-kit.js).
// These are character colours, not UI colours, so they live here rather than in the theme.

const SKIN = ["#F6C9A8", "#C98E62", "#7A4A2E", "#F08A3C", "#7BC96F", "#A9B4C6", "#EFE8D8", "#9D86F9"] as const;
const OUTFIT = ["#7C3AED", "#C5F25C", "#38BDF8", "#F472B6", "#FB923C", "#F2F0EA", "#2A2A33"] as const;
const BACKGROUND = ["#C5F25C", "#A78BFA", "#38BDF8", "#F9A8D4", "#FDE68A", "#5EEAD4", "#2E2E36", "#FB923C"] as const;

/** Builder tabs: which digit each edits, how many options, and the colour digit/palette (AVT in the prototype). */
export const AVATAR_TABS = [
  { digit: 0, count: 8, swatchDigit: 1, swatches: SKIN },
  { digit: 2, count: 4 },
  { digit: 3, count: 6 },
  { digit: 4, count: 5, swatchDigit: 5, swatches: OUTFIT },
  { digit: 6, count: 4 },
  { digit: 7, count: 8 },
] as const;

// Per species: eye L x, eye R x, eye y, ear L [x,y], ear R [x,y], head top.
const SPECIES: readonly (readonly [number, number, number, readonly [number, number], readonly [number, number], number])[] = [
  [43, 57, 47, [31, 52], [69, 46], 22], [41.5, 58.5, 43.5, [33, 46], [64, 36], 26], [42, 58, 47, [34, 45], [65, 34], 30],
  [38, 62, 37, [29, 56], [69, 44], 28], [42, 58, 45, [32, 38], [66, 30], 24], [43, 57, 44.5, [29, 55], [71, 44], 26],
  [43, 57, 45, [33, 50], [66, 42], 25], [41, 59, 42.5, [31, 47], [68, 37], 22],
];

/** Mixes a hex colour toward black (or white when `toWhite`) by t. */
function mix(hex: string, t: number, toWhite = false): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255];
  const d = toWhite ? 255 : 0;
  return "#" + c.map((v) => Math.round(v + (d - v) * t).toString(16).padStart(2, "0")).join("");
}

export const parseAvatar = (config: string): number[] =>
  String(config).replace(/\D/g, "").padEnd(8, "0").slice(0, 8).split("").map(Number);

export function randomAvatar(rand: () => number = Math.random): string {
  const r = (k: number) => Math.floor(rand() * k);
  return [r(8), r(8), r(4), r(6), r(5), r(7), r(4), r(8)].join("");
}

/** A stable avatar for a wallet that hasn't picked one (no profiles backend yet, BACKEND_GAPS P1-9). */
export function avatarFor(wallet: string): string {
  let h = 2166136261;
  for (let i = 0; i < wallet.length; i++) h = Math.imul(h ^ wallet.charCodeAt(i), 16777619) >>> 0;
  return randomAvatar(() => { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; return (h % 10000) / 10000; });
}

/** The prototype's renderVals(): every colour, path and visibility flag for one config. */
export function avatarValues(config: string) {
  const d = parseAvatar(config);
  const s = d[0]! % 8, e = d[2]! % 4, hat = d[3]! % 6, o = d[4]! % 5, it = d[6]! % 4;
  const sp = SPECIES[s]!;
  const sk = SKIN[d[1]! % 8]!, oc = OUTFIT[d[5]! % 7]!, bg = BACKGROUND[d[7]! % 8]!;
  const [x1, x2, y] = sp;
  const f = (v: number) => Math.round(v * 10) / 10;
  return {
    bg, bgD: mix(bg, 0.14), bgL: mix(bg, 0.12, true),
    sk, skD: mix(sk, 0.2), skDD: mix(sk, 0.42), skL: mix(sk, 0.35, true),
    oc, ocD: mix(oc, 0.22), ocDD: mix(oc, 0.42), ocL: mix(oc, 0.3, true),
    s0: s === 0, s1: s === 1, s2: s === 2, s3: s === 3, s4: s === 4, s5: s === 5, s6: s === 6, s7: s === 7,
    o0: o === 0, o1: o === 1, o2: o === 2, o3: o === 3, o4: o === 4,
    eD: e === 0, e1: e === 1, e2: e === 2, e3: e === 3,
    ex1: x1, ex2: x2, ey: y,
    sl: `M${f(x1 - 4)} ${y} Q${x1} ${f(y + 3)} ${f(x1 + 4)} ${y} M${f(x2 - 4)} ${y} Q${x2} ${f(y + 3)} ${f(x2 + 4)} ${y} M${f(x1 - 4.5)} ${f(y - 1.5)} L${f(x1 + 4.5)} ${f(y - 1.5)} M${f(x2 - 4.5)} ${f(y - 1.5)} L${f(x2 + 4.5)} ${f(y - 1.5)}`,
    lz: `M${x1} ${y} L104 ${f(y + 22)} M${x2} ${y} L104 ${f(y + 12)}`,
    shx: f(x1 - 7.5), shy: f(y - 4.5), shw: f(x2 - x1 + 15), shg: `M${f(x1 - 4)} ${f(y - 1.5)} L${f(x1 - 0.5)} ${f(y - 1.5)}`,
    h1: hat === 1, h2: hat === 2, h3: hat === 3, h4: hat === 4, h5: hat === 5, dy: f(y - 50 - (s === 3 ? 4 : 0)),
    i1: it === 1, i2: it === 2, i3: it === 3,
    erx: sp[4][0], ery: sp[4][1], elx: sp[3][0], ely: sp[3][1], bx: f(x1 - 1), by: f(y + 9),
  };
}
