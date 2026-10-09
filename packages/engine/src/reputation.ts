// Kept rate and odds: display-only (rules.md §7–8, DECISIONS D-12, D-13). Never used for money.

import { KEPT_RATE, ODDS } from "@kept/config";

export interface DayOutcome {
  /** Days between that day and today (0 = today). */
  ageDays: number;
  kept: boolean;
}

export interface KeptRate {
  /** 0..1, or null while "New". */
  rate: number | null;
  /** Real days counted (the "64 days" in "92% · 64 days"). */
  days: number;
  isNew: boolean;
}

/**
 * Recency-weighted kept rate with a neutral prior. Each outcome weighs decayPerDay^age; each clean
 * finish adds cleanFinishPseudoDays kept days at its age; the prior adds priorDays at priorRate.
 */
export function keptRate(outcomes: readonly DayOutcome[], cleanFinishAges: readonly number[] = []): KeptRate {
  const days = outcomes.length;
  let kept = KEPT_RATE.priorDays * KEPT_RATE.priorRate;
  let total = KEPT_RATE.priorDays;
  for (const o of outcomes) {
    const w = KEPT_RATE.decayPerDay ** Math.max(0, o.ageDays);
    total += w;
    if (o.kept) kept += w;
  }
  for (const age of cleanFinishAges) {
    const w = KEPT_RATE.cleanFinishPseudoDays * KEPT_RATE.decayPerDay ** Math.max(0, age);
    total += w;
    kept += w;
  }
  const isNew = days < KEPT_RATE.newUnderDays;
  return { rate: isNew ? null : kept / total, days, isNew };
}

/** Whole percent for display ("92%"). */
export const keptRatePercent = (r: KeptRate): number | null => (r.rate === null ? null : Math.round(r.rate * 100));

export type TodayStatus = "none" | "photo1" | "kept" | "review";

export type Odds =
  | { kind: "keep"; against: number }
  | { kind: "miss"; for: number }
  | { kind: "review" }
  | { kind: "none" };

/**
 * Bookie odds for D2's OddsChips. p(keep) = kept rate, +0.10 with photo 1 in, −0.15 when under the
 * deadline threshold with nothing in; clamped. "1-to-9" when likely to keep, "3-to-1 to miss" when not.
 */
export function odds(rate: number | null, today: TodayStatus, deadlineClose: boolean): Odds {
  if (today === "kept") return { kind: "none" };
  if (today === "review") return { kind: "review" };
  let p = rate ?? KEPT_RATE.priorRate;
  if (today === "photo1") p += ODDS.photoOneBoost;
  if (today === "none" && deadlineClose) p -= ODDS.lateNothingPenalty;
  p = Math.min(ODDS.max, Math.max(ODDS.min, p));
  if (p >= 0.5) return { kind: "keep", against: Math.max(1, Math.round(p / (1 - p))) };
  return { kind: "miss", for: Math.max(1, Math.round((1 - p) / p)) };
}
