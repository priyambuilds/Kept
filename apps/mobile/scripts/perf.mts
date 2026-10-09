// Release-build performance numbers (fidelity pass): cold start, and frame stats for tab switches,
// a list scroll and a push/pop transition.
//   node scripts/perf.mts <app-release.apk> [--out artifacts/perf/<name>.json]
// Build the APK with mock data so it reaches the tabs without a wallet app:
//   EXPO_PUBLIC_API_MODE=mock ./gradlew assembleRelease   (in apps/mobile/android)
// Uses `am start -W` (TotalTime) and `dumpsys gfxinfo` (janky frames, frame-time percentiles).
// Also watches logcat for the whole run (audit P-6): Reanimated's "synchronouslyUpdateUIProps failed"
// lines (an animated-props update for a view that isn't mounted, logged with a stack trace on the UI
// thread) and ANRs. The run fails when there's an ANR or more failures than --max-sync-failures (50).
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../..");
const sdk = process.env.ANDROID_HOME ?? path.join(process.env.HOME!, "Library/Android/sdk");
const ADB = path.join(sdk, "platform-tools/adb");
const PKG = "app.kept.mobile";
const adb = (...a: string[]) => execFileSync(ADB, a, { encoding: "utf8", maxBuffer: 64 << 20 });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const apk = process.argv[2]?.endsWith(".apk") ? process.argv[2] : undefined;
const outArg = process.argv.indexOf("--out");
const out = outArg > 0 ? path.resolve(process.argv[outArg + 1]!) : path.join(root, "artifacts/perf/run.json");
const maxArg = process.argv.indexOf("--max-sync-failures");
const MAX_SYNC_FAILURES = maxArg > 0 ? Number(process.argv[maxArg + 1]) : 50;

/** Streams logcat (the ring buffer overflows at these volumes) and counts P-6 failures and ANRs. */
function watchLogcat() {
  spawnSync(ADB, ["logcat", "-c"]);
  const counts = { syncFailures: 0, anrs: 0 };
  const proc = spawn(ADB, ["logcat", "-v", "brief", "Reanimated:W", "ActivityManager:E", "*:S"]);
  let rest = "";
  proc.stdout.setEncoding("utf8");
  proc.stdout.on("data", (chunk: string) => {
    const lines = (rest + chunk).split("\n");
    rest = lines.pop() ?? "";
    for (const l of lines) {
      if (l.includes("synchronouslyUpdateUIProps failed")) counts.syncFailures++;
      else if (l.includes(`ANR in ${PKG}`)) counts.anrs++;
    }
  });
  return { counts, stop: () => proc.kill() };
}

interface Node { text: string; desc: string; x: number; y: number }
function dump(): Node[] {
  spawnSync(ADB, ["shell", "rm", "-f", "/sdcard/kept-ui.xml"]);
  spawnSync(ADB, ["shell", "uiautomator", "dump", "/sdcard/kept-ui.xml"]);
  const xml = spawnSync(ADB, ["shell", "cat", "/sdcard/kept-ui.xml"], { encoding: "utf8", maxBuffer: 64 << 20 }).stdout ?? "";
  return [...xml.matchAll(/<node [^>]*?text="([^"]*)"[^>]*?content-desc="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)]
    .map(([, text, desc, x1, y1, x2, y2]) => ({ text: text!, desc: desc!, x: (Number(x1) + Number(x2)) / 2, y: (Number(y1) + Number(y2)) / 2 }));
}
/**
 * Tap by text; release builds run ambient loops, so uiautomator often never goes idle and finds nothing.
 * `at` is the position on the 1080×2400 emulator (px); when given it's tapped directly.
 */
async function tap(q: string, at?: [number, number], timeoutMs = 15000) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    // uiautomator dumps can block for many seconds in release (never idle): with a known spot, skip them.
    if (at) { adb("shell", "input", "tap", String(at[0]), String(at[1])); return; }
    const n = dump().find((d) => d.text === q || d.desc === q || d.desc.startsWith(`${q},`) || d.text.split("&#10;").includes(q));
    if (n) { adb("shell", "input", "tap", String(Math.round(n.x)), String(Math.round(n.y))); return; }
    if (Date.now() > end) throw new Error(`not found: ${q}`);
    await sleep(500);
  }
}

function frameStats() {
  const g = adb("shell", "dumpsys", "gfxinfo", PKG);
  const num = (re: RegExp) => Number(g.match(re)?.[1] ?? NaN);
  return {
    frames: num(/Total frames rendered: (\d+)/),
    janky: num(/Janky frames: (\d+)/),
    jankyPct: num(/Janky frames: \d+ \(([\d.]+)%\)/),
    p50: num(/50th percentile: (\d+)ms/),
    p90: num(/90th percentile: (\d+)ms/),
    p95: num(/95th percentile: (\d+)ms/),
    p99: num(/99th percentile: (\d+)ms/),
  };
}

const TAB_NAMES = ["Today", "Oaths", "Bounties", "Profile"];
/** Centre of tab i while tab `active` is open: bar 20…(W−96) dp, padding 6, gap 2, active flex 1.7 (2.625 px/dp). */
function tabAt(i: number, active: number): [number, number] {
  const dp = 2.625, w = 1080 / dp, inner = w - 20 - 96 - 12 - 6, unit = inner / 4.7;
  let x = 20 + 6;
  for (let k = 0; k < i; k++) x += (k === active ? 1.7 : 1) * unit + 2;
  x += ((i === active ? 1.7 : 1) * unit) / 2;
  return [Math.round(x * dp), 2208];
}

let phaseCounts: { syncFailures: number } | null = null;
/** Sync-props failures since the last call (per phase). */
let lastSync = 0;
function syncSince(): number { const n = phaseCounts ? phaseCounts.syncFailures - lastSync : 0; lastSync += n; return n; }

async function measure(name: string, act: () => Promise<void>) {
  adb("shell", "dumpsys", "gfxinfo", PKG, "reset");
  syncSince();
  await act();
  const s = { ...frameStats(), syncFailures: syncSince() };
  console.log(name.padEnd(16), JSON.stringify(s));
  return s;
}

async function main() {
  if (apk) adb("install", "-r", "-d", apk);
  const log = watchLogcat();
  phaseCounts = log.counts;
  const W = Number(adb("shell", "wm", "size").match(/(\d+)x(\d+)/)![1]);
  const H = Number(adb("shell", "wm", "size").match(/(\d+)x(\d+)/)![2]);
  for (const k of ["window_animation_scale", "transition_animation_scale", "animator_duration_scale"]) adb("shell", "settings", "put", "global", k, "1");
  // Cold start ×3 on a cleared app.
  adb("shell", "pm", "clear", PKG);
  const cold: number[] = [];
  for (let i = 0; i < 3; i++) {
    adb("shell", "am", "force-stop", PKG);
    await sleep(1500);
    const r = adb("shell", "am", "start", "-W", "-n", `${PKG}/.MainActivity`);
    cold.push(Number(r.match(/TotalTime: (\d+)/)?.[1] ?? NaN));
    await sleep(3500);
  }
  console.log("cold start (ms)", cold, "sync-props failures", syncSince());
  // Onboard on the mock wallet: A1 → A2 → A2·s → A3 → A4 → Today.
  await tap("Get started", [540, 2046]);
  await sleep(2500);
  await tap("Seeker Wallet", [540, 775]);
  await sleep(6000);
  await tap("Continue", [540, 2205]);
  await sleep(2500);
  await tap("Looks like me", [540, 2081]);
  await sleep(4000);
  console.log("onboarding       sync-props failures", syncSince());
  let active = 0;
  const tab = async (i: number) => { await tap(TAB_NAMES[i]!, tabAt(i, active)); active = i; };
  const tabs = await measure("tab switches", async () => {
    for (const i of [1, 2, 3, 0, 1, 2, 3, 0]) { await tab(i); await sleep(900); }
  });
  await tab(2);
  await sleep(2500);
  const scroll = await measure("Bounties scroll", async () => {
    for (let i = 0; i < 4; i++) { adb("shell", "input", "swipe", String(W / 2), String(H * 0.8), String(W / 2), String(H * 0.3), "250"); await sleep(700); }
    for (let i = 0; i < 4; i++) { adb("shell", "input", "swipe", String(W / 2), String(H * 0.3), String(W / 2), String(H * 0.8), "250"); await sleep(700); }
  });
  await tab(0);
  await sleep(2000);
  const push = await measure("push / back ×4", async () => {
    for (let i = 0; i < 4; i++) {
      adb("shell", "input", "tap", String(W * 0.5), String(H * 0.35)); // the main card / first block on Today
      await sleep(1500);
      adb("shell", "input", "keyevent", "KEYCODE_BACK");
      await sleep(1500);
    }
  });
  await sleep(1500);
  log.stop();
  const { syncFailures, anrs } = log.counts;
  console.log("sync-props failures", syncFailures, "ANRs", anrs);
  const res = { apk, date: new Date().toISOString(), coldStartMs: cold, tabs, scroll, push, syncFailures, anrs };
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(`wrote ${out}`);
  if (anrs > 0 || syncFailures > MAX_SYNC_FAILURES) {
    console.error(`FAIL: ${anrs} ANR(s), ${syncFailures} sync-props failures (max ${MAX_SYNC_FAILURES}); see docs/notes/FIDELITY_AUDIT.md › P-6`);
    process.exitCode = 1;
  }
}

void main();
