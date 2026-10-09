import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stakeUnits } from "@kept/config";
import {
  applyDay, initialState, missCost, nextMissBreaks, nextMissCost, previewMiss, rematchRecovery, settlement, simulate,
  bountyFunding, bountySplit, marksFromBitmasks,
} from "./oath";
import { keptRate, keptRatePercent, odds } from "./reputation";
import { dayPhase, localDay, nextMidnight, DAY_SECONDS } from "./time";
import { hpFilledSegments, hpLostSegments, hpTone } from "./hp";
import { oathNameParts } from "./names";
import { SCENARIOS, parseMarks, vectorOf } from "./vectors";

const SKR = stakeUnits(1);
/** Base units → SKR rounded half-up to 2 decimals, as rules.md displays them. */
const skr2 = (u: bigint) => (Number((u * 100n + SKR / 2n) / SKR) / 100).toFixed(2);

test("worked example (rules.md §3): 4 × 1,000 SKR over 3 days", () => {
  const s = simulate({ stake: stakeUnits(1000), days: 3, members: 4, solo: false }, parseMarks(["kmkm", "kkkk", "kkkm"]));
  assert.deepEqual(s.balances.map(skr2), ["1468.75", "779.17", "1468.75", "166.67"]);
  assert.equal(skr2(s.feeTotal), "116.67");
  // Exact base units: nothing is created or lost.
  assert.deepEqual(s.balances, [1_468_750_000n, 779_166_667n, 1_468_750_000n, 166_666_667n]);
  assert.equal(s.feeTotal, 116_666_666n);
  assert.equal(s.balances.reduce((a, b) => a + b, 0n) + s.feeTotal, 4_000_000_000n);
  // Day by day, as in the rules.md table.
  const [d1, d2, d3] = s.dayResults;
  assert.equal(skr2(d1!.lostTotal), "666.67");
  assert.equal(skr2(d1!.fee), "66.67");
  assert.deepEqual(d1!.won.map(skr2), ["300.00", "0.00", "300.00", "0.00"]);
  assert.equal(d1!.hpAfter, 70);
  assert.equal(d2!.lostTotal, 0n);
  assert.equal(d2!.hpAfter, 80);
  assert.equal(skr2(d3!.lostTotal), "500.00");
  assert.equal(skr2(d3!.fee), "50.00");
  assert.deepEqual(d3!.keptSoFar, [3, 2, 3, 1]);
  assert.deepEqual(d3!.won.map(skr2), ["168.75", "112.50", "168.75", "0.00"]);
  assert.equal(d3!.hpAfter, 70);
  // Per-member breakdown (J1/D4 rows).
  const b = settlement(s);
  assert.deepEqual(b.map((m) => [skr2(m.lost), skr2(m.won)]), [["0.00", "468.75"], ["333.33", "112.50"], ["0.00", "468.75"], ["833.33", "0.00"]]);
});

test("cost of a miss: 1,000/7 → 143, 214, 321; 1,000/3 → 333.33, 500, 750", () => {
  assert.deepEqual([0, 1, 2].map((k) => Math.round(Number(missCost(stakeUnits(1000), 7, k)) / 1e6)), [143, 214, 321]);
  assert.deepEqual([0, 1, 2].map((k) => skr2(missCost(stakeUnits(1000), 3, k))), ["333.33", "500.00", "750.00"]);
});

test("a miss is capped at the remaining balance (D-3)", () => {
  const s = simulate({ stake: stakeUnits(1000), days: 3, members: 2, solo: false }, parseMarks(["km", "km", "km"]));
  assert.equal(s.balances[1], 0n);
  assert.equal(s.dayResults[2]!.lost[1], 166_666_667n); // 750 due, 166.67 left
  assert.equal(s.misses[1], 3);
});

test("HP: −20 per missed member, +10 heal, capped at 100; −35 solo", () => {
  let s = initialState({ stake: stakeUnits(1000), days: 7, members: 4, solo: false });
  s = applyDay(s, ["k", "k", "k", "m"]);
  assert.equal(s.hp, 90); // rules.md §2 example: 100 − 20 → 80 → +10 → 90
  s = applyDay(s, ["k", "k", "k", "k"]);
  assert.equal(s.hp, 100);
  s = applyDay(s, ["k", "k", "k", "k"]);
  assert.equal(s.hp, 100);
  const solo = applyDay(initialState({ stake: stakeUnits(500), days: 3, members: 1, solo: true }), ["m"]);
  assert.equal(solo.hp, 75);
});

test("breaking day: no heal, no payout, no fee; half held, half to the treasury (amendment 2)", () => {
  const terms = { stake: stakeUnits(1000), days: 7, members: 4, solo: false } as const;
  const s = simulate(terms, parseMarks(["kmmm", "kmmm", "kkkk"]));
  assert.equal(s.broken, true);
  assert.equal(s.brokeOnDay, 1);
  assert.equal(s.dayResults.length, 2, "days after the break are not applied");
  const d = s.dayResults[1]!;
  assert.equal(d.fee, 0n);
  assert.deepEqual(d.won, [0n, 0n, 0n, 0n]);
  assert.equal(d.hpAfter, 0);
  const before = simulate(terms, parseMarks(["kmmm"])).balances;
  assert.deepEqual(s.held, before.map((x) => x / 2n));
  assert.deepEqual(s.balances, [0n, 0n, 0n, 0n]);
  assert.equal(nextMissBreaks(simulate(terms, parseMarks(["kmmm"]))), false);
});

test("solo: losses go to the treasury; breaks on the 4th straight miss", () => {
  const some = simulate({ stake: stakeUnits(1000), days: 7, members: 1, solo: true }, parseMarks(["k", "m", "k", "k", "m", "k", "k"]));
  assert.equal(some.feeTotal, 0n);
  assert.equal(some.toTreasuryTotal, missCost(stakeUnits(1000), 7, 0) + missCost(stakeUnits(1000), 7, 1));
  const broke = simulate({ stake: stakeUnits(1000), days: 7, members: 1, solo: true }, parseMarks(["m", "m", "m", "m"]));
  assert.deepEqual(broke.dayResults.map((d) => d.hpAfter), [75, 50, 25, 0]);
  assert.equal(broke.brokeOnDay, 3);
});

test("nobody keeps: the day's losses go to the treasury, no fee (D-15)", () => {
  const s = simulate({ stake: stakeUnits(500), days: 3, members: 2, solo: false }, parseMarks(["mm"]));
  assert.equal(s.feeTotal, 0n);
  assert.equal(s.toTreasuryTotal, 2n * missCost(stakeUnits(500), 3, 0));
});

test("conservation: balances + fee + treasury + held = total staked, in every scenario", () => {
  for (const sc of SCENARIOS) {
    const s = simulate(sc.terms, parseMarks(sc.marks));
    const total = s.balances.reduce((a, b) => a + b, 0n) + s.feeTotal + s.toTreasuryTotal + s.held.reduce((a, b) => a + b, 0n);
    assert.equal(total, sc.terms.stake * BigInt(sc.terms.members), sc.name);
  }
});

test("test vectors on disk match the engine (regenerate with `pnpm --filter @kept/engine vectors`)", () => {
  const file = JSON.parse(readFileSync(new URL("../test-vectors/oath-vectors.json", import.meta.url), "utf8"));
  assert.deepEqual(file.vectors, SCENARIOS.map(vectorOf));
});

test("live-view helpers: next miss cost, preview, bitmasks", () => {
  const s = simulate({ stake: stakeUnits(1000), days: 3, members: 4, solo: false }, parseMarks(["kmkm"]));
  assert.equal(nextMissCost(s, 3), 500_000_000n);
  const p = previewMiss(s, 3);
  assert.equal(p.lostTotal, 500_000_000n);
  assert.equal(p.won[3], 0n);
  assert.deepEqual(marksFromBitmasks([0b101, 0b110], 3), [["k", "m"], ["m", "k"], ["k", "k"]]);
});

test("Rematch recovery and Bounty money", () => {
  assert.equal(rematchRecovery(250n, true, false), 250n);
  assert.equal(rematchRecovery(250n, false, false), 0n);
  assert.equal(rematchRecovery(250n, true, true), 0n);
  assert.deepEqual(bountyFunding(stakeUnits(50_000)), { pool: stakeUnits(50_000), fee: stakeUnits(5_000), total: stakeUnits(55_000) });
  assert.deepEqual(bountySplit(100n, 3), { each: 33n, dust: 1n, returnedToCreator: 0n });
  assert.deepEqual(bountySplit(100n, 0), { each: 0n, dust: 0n, returnedToCreator: 100n });
});

test("kept rate: New under 10 days, recency-weighted after", () => {
  assert.equal(keptRate(Array.from({ length: 9 }, (_, i) => ({ ageDays: i, kept: true }))).isNew, true);
  const good = keptRate(Array.from({ length: 64 }, (_, i) => ({ ageDays: i, kept: i % 12 !== 0 })));
  assert.equal(good.days, 64);
  assert.ok(keptRatePercent(good)! >= 85 && keptRatePercent(good)! <= 95);
  const recentMisses = keptRate(Array.from({ length: 30 }, (_, i) => ({ ageDays: i, kept: i > 3 })));
  const oldMisses = keptRate(Array.from({ length: 30 }, (_, i) => ({ ageDays: i, kept: i < 26 })));
  assert.ok(recentMisses.rate! < oldMisses.rate!, "recent days count more");
});

test("odds: 1-to-n when likely to keep, n-to-1 to miss when not", () => {
  assert.deepEqual(odds(0.9, "none", false), { kind: "keep", against: 9 });
  assert.deepEqual(odds(0.4, "none", true), { kind: "miss", for: 3 });
  assert.deepEqual(odds(0.9, "kept", false), { kind: "none" });
  assert.deepEqual(odds(0.9, "review", false), { kind: "review" });
});

test("day boundaries: day 1 at the first midnight after Start, in the creator's time zone", () => {
  const ist = 330; // UTC+5:30
  const midnightUtc = 10 * DAY_SECONDS - ist * 60; // local midnight starting local day 10
  assert.equal(localDay(midnightUtc - 1, ist), 9);
  assert.equal(localDay(midnightUtc, ist), 10);
  const start = midnightUtc - 3 * 3600; // pressed Start at 21:00 local
  assert.equal(nextMidnight(start, ist), midnightUtc);
  assert.deepEqual(dayPhase(midnightUtc, 3, start), { phase: "waiting", startsAt: midnightUtc, secondsToStart: 3 * 3600 });
  const p = dayPhase(midnightUtc, 3, midnightUtc + DAY_SECONDS + 23 * 3600);
  assert.equal(p.phase, "day");
  if (p.phase === "day") {
    assert.equal(p.dayIndex, 1);
    assert.equal(p.secondsToReset, 3600);
    assert.equal(p.deadlineClose, true);
  }
  assert.equal(dayPhase(midnightUtc, 3, midnightUtc + 3 * DAY_SECONDS).phase, "over");
  assert.equal(nextMidnight(0, -300), 5 * 3600); // UTC−5: local midnight is 05:00 UTC
});

test("HP display helpers and generated names", () => {
  assert.deepEqual([100, 41, 40, 21, 20, 1, 0].map(hpTone), ["full", "full", "warn", "warn", "danger", "danger", "danger"]);
  assert.deepEqual([100, 90, 70, 1, 0].map(hpFilledSegments), [20, 18, 14, 1, 0]);
  assert.equal(hpLostSegments(80, 20), 4);
  assert.deepEqual(oathNameParts(0, 7), { word: "iron", length: "week" });
  assert.deepEqual(oathNameParts(1, 14), { word: "page", length: 14 });
});
