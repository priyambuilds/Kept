// The Oath money and HP rules: design/rules.md §2–4 plus docs/DECISIONS.md › Rules amendments.
// Pure and deterministic. All amounts are bigint base units; no floats touch money.

import { BOUNTY_FEE_BPS, BPS, FEE_BPS, HP, MISS_GROWTH, REMATCH } from "@kept/config";

/** One member's outcome for one finished day: kept or missed. */
export type DayMark = "k" | "m";

export interface OathTerms {
  /** Stake per member, base units. */
  stake: bigint;
  /** Oath length in days (3, 7 or 14 in the product; any positive integer here). */
  days: number;
  /** Number of members (1 for solo). */
  members: number;
  /** Solo Oaths take heavier damage (−35) and have no keepers to pay. */
  solo: boolean;
  /** Fee on each day's lost money; defaults to 10 %. */
  feeBps?: bigint;
}

export interface DayResult {
  /** 0-based day index. */
  day: number;
  hpBefore: number;
  damage: number;
  /** HP after damage and heal (0 if the Oath broke this day). */
  hpAfter: number;
  healed: number;
  broken: boolean;
  /** What each member lost to misses today (capped at their balance). */
  lost: bigint[];
  lostTotal: bigint;
  /** Fee kept by KEPT today, including rounding dust. */
  fee: bigint;
  /** What each member won today. */
  won: bigint[];
  /** Money sent to the KEPT treasury today without a fee: solo losses, days with no keepers, and on a break the non-held half. */
  toTreasury: bigint;
  /** Only on the breaking day: per member, half of their balance, held for the Rematch. */
  held: bigint[];
  /** Days kept so far by each member, including today. */
  keptSoFar: number[];
}

export interface OathState {
  terms: OathTerms;
  dayResults: DayResult[];
  hp: number;
  broken: boolean;
  /** 0-based day the Oath broke on, or null. */
  brokeOnDay: number | null;
  /** Each member's live balance, base units. 0 for everyone once broken. */
  balances: bigint[];
  /** How many times each member has missed (drives the next miss cost). */
  misses: number[];
  keptDays: number[];
  /** Per-member totals across all days. */
  lost: bigint[];
  won: bigint[];
  feeTotal: bigint;
  toTreasuryTotal: bigint;
  /** Per-member Rematch hold (non-zero only once broken). */
  held: bigint[];
}

const feeOf = (terms: OathTerms) => terms.feeBps ?? FEE_BPS;

/**
 * Cost of a member's k-th miss (k from 0): stake / days × 1.5^k, rounded down.
 * Computed as floor(stake·3^k / (days·2^k)) so there's a single rounding step.
 */
export function missCost(stake: bigint, days: number, k: number): bigint {
  if (days <= 0 || !Number.isInteger(days)) throw new RangeError("days must be a positive integer");
  if (k < 0 || !Number.isInteger(k)) throw new RangeError("k must be a non-negative integer");
  const kk = BigInt(k);
  return (stake * MISS_GROWTH.num ** kk) / (BigInt(days) * MISS_GROWTH.den ** kk);
}

/** HP lost per missed member: −20 in a group, −35 solo (rules.md §2, D-1). */
export const damagePerMiss = (solo: boolean): number => (solo ? HP.missSolo : HP.missGroup);

export function initialState(terms: OathTerms): OathState {
  if (terms.members < 1) throw new RangeError("an Oath needs at least one member");
  if (terms.solo && terms.members !== 1) throw new RangeError("a solo Oath has exactly one member");
  if (terms.stake < 0n) throw new RangeError("stake must be non-negative");
  const n = terms.members;
  return {
    terms,
    dayResults: [],
    hp: HP.start,
    broken: false,
    brokeOnDay: null,
    balances: Array.from({ length: n }, () => terms.stake),
    misses: Array(n).fill(0),
    keptDays: Array(n).fill(0),
    lost: Array(n).fill(0n),
    won: Array(n).fill(0n),
    feeTotal: 0n,
    toTreasuryTotal: 0n,
    held: Array(n).fill(0n),
  };
}

/**
 * Applies one finished day. Order (rules.md §2–3, amendments 2):
 * 1. each missed member pays their next miss cost, capped at their balance (D-3)
 * 2. damage: −20 (−35 solo) per missed member
 * 3. if HP ≤ 0 the Oath breaks: no heal, no keeper payout, no fee. Each member's balance at the
 *    start of the day (their share of the remaining pot, today's miss costs included) splits:
 *    half held for the Rematch, the rest to the treasury. Balances become 0.
 * 4. otherwise: 10 % fee from the lost money, 90 % to today's keepers weighted by days kept so far
 *    (including today), each share rounded down, dust added to the fee. With no keepers (solo, or
 *    everyone missed) the lost money goes to the treasury with no fee (D-1, D-15).
 * 5. heal +10, capped at 100.
 */
export function applyDay(state: OathState, marks: readonly DayMark[]): OathState {
  const { terms } = state;
  const n = terms.members;
  if (state.broken) throw new Error("the Oath is already broken");
  if (state.dayResults.length >= terms.days) throw new Error("the Oath has no days left");
  if (marks.length !== n) throw new RangeError(`expected ${n} marks, got ${marks.length}`);

  const day = state.dayResults.length;
  const startBalances = [...state.balances];
  const balances = [...state.balances];
  const misses = [...state.misses];
  const keptDays = marks.map((m, i) => state.keptDays[i]! + (m === "k" ? 1 : 0));
  const lost: bigint[] = Array(n).fill(0n);

  marks.forEach((m, i) => {
    if (m !== "m") return;
    const due = missCost(terms.stake, terms.days, misses[i]!);
    const paid = due < balances[i]! ? due : balances[i]!;
    lost[i] = paid;
    balances[i] = balances[i]! - paid;
    misses[i] = misses[i]! + 1;
  });
  const lostTotal = sum(lost);
  const missed = marks.filter((m) => m === "m").length;
  const damage = missed * damagePerMiss(terms.solo);
  const hpBefore = state.hp;
  const afterDamage = hpBefore - damage;

  const base: Omit<DayResult, "hpAfter" | "healed" | "broken" | "fee" | "won" | "toTreasury" | "held"> = {
    day, hpBefore, damage, lost, lostTotal, keptSoFar: keptDays,
  };

  if (afterDamage <= 0) {
    const held = startBalances.map((b) => (b * REMATCH.holdBps) / BPS);
    const toTreasury = sum(startBalances) - sum(held);
    const result: DayResult = {
      ...base, hpAfter: 0, healed: 0, broken: true, fee: 0n, won: Array(n).fill(0n), toTreasury, held,
    };
    return {
      ...state,
      dayResults: [...state.dayResults, result],
      hp: 0,
      broken: true,
      brokeOnDay: day,
      balances: Array(n).fill(0n),
      misses,
      keptDays,
      // Everything a member had at the break counts as lost.
      lost: state.lost.map((l, i) => l + startBalances[i]!),
      toTreasuryTotal: state.toTreasuryTotal + toTreasury,
      held,
    };
  }

  const won: bigint[] = Array(n).fill(0n);
  let fee = 0n;
  let toTreasury = 0n;
  if (lostTotal > 0n) {
    const keepers = marks.map((m, i) => (m === "k" ? i : -1)).filter((i) => i >= 0);
    if (keepers.length === 0) {
      toTreasury = lostTotal;
    } else {
      fee = (lostTotal * feeOf(terms)) / BPS;
      const pool = lostTotal - fee;
      const weight = BigInt(keepers.reduce((s, i) => s + keptDays[i]!, 0));
      for (const i of keepers) won[i] = (pool * BigInt(keptDays[i]!)) / weight;
      fee += pool - sum(won);
      won.forEach((w, i) => (balances[i] = balances[i]! + w));
    }
  }
  const hpAfter = Math.min(HP.max, afterDamage + HP.heal);
  const result: DayResult = {
    ...base, hpAfter, healed: hpAfter - afterDamage, broken: false, fee, won, toTreasury, held: Array(n).fill(0n),
  };
  return {
    ...state,
    dayResults: [...state.dayResults, result],
    hp: hpAfter,
    balances,
    misses,
    keptDays,
    lost: state.lost.map((l, i) => l + lost[i]!),
    won: state.won.map((w, i) => w + won[i]!),
    feeTotal: state.feeTotal + fee,
    toTreasuryTotal: state.toTreasuryTotal + toTreasury,
  };
}

/** Replays finished days. `days[d][i]` is member i's mark on day d. Stops at a break. */
export function simulate(terms: OathTerms, days: readonly (readonly DayMark[])[]): OathState {
  let s = initialState(terms);
  for (const marks of days) {
    if (s.broken) break;
    s = applyDay(s, marks);
  }
  return s;
}

/** Days kept → bitmask per member (the program's `days_kept`), and back. */
export function marksFromBitmasks(bitmasks: readonly number[], finishedDays: number): DayMark[][] {
  return Array.from({ length: finishedDays }, (_, d) => bitmasks.map((b) => ((b >> d) & 1 ? "k" : "m")));
}

/** What a member's next miss would cost now (capped at their balance). */
export function nextMissCost(state: OathState, member: number): bigint {
  const due = missCost(state.terms.stake, state.terms.days, state.misses[member]!);
  const bal = state.balances[member]!;
  return due < bal ? due : bal;
}

/** True if one more miss today (with everyone else keeping) would break the Oath. */
export function nextMissBreaks(state: OathState): boolean {
  return state.hp - damagePerMiss(state.terms.solo) <= 0;
}

/**
 * "If X misses today": the day's result assuming only `member` misses and everyone else keeps.
 * Used by D2's preview ("You +43 · Riya +43 · Dev +43 · fee 14 SKR").
 */
export function previewMiss(state: OathState, member: number): DayResult {
  const marks: DayMark[] = Array.from({ length: state.terms.members }, (_, i) => (i === member ? "m" : "k"));
  const next = applyDay(state, marks);
  return next.dayResults[next.dayResults.length - 1]!;
}

export interface MemberSettlement {
  start: bigint;
  lost: bigint;
  won: bigint;
  final: bigint;
  held: bigint;
}

/** Per-member breakdown (D4, L1, L2, J1) from a finished or broken simulation. */
export function settlement(state: OathState): MemberSettlement[] {
  return state.balances.map((final, i) => ({
    start: state.terms.stake,
    lost: state.lost[i]!,
    won: state.won[i]!,
    final,
    held: state.held[i]!,
  }));
}

/**
 * Rematch recovery (amendment 3): a member who kept every day of a Rematch that didn't break gets
 * back exactly what was held for them at the original break; otherwise nothing.
 */
export function rematchRecovery(held: bigint, keptEveryDay: boolean, rematchBroke: boolean): bigint {
  return keptEveryDay && !rematchBroke ? held : 0n;
}

/** Amounts a Bounty creator pays: pool + 10 % fee (rules.md §6). */
export function bountyFunding(pool: bigint, feeBps: bigint = BOUNTY_FEE_BPS) {
  const fee = (pool * feeBps) / BPS;
  return { pool, fee, total: pool + fee };
}

/** Equal split of a Bounty pool among survivors, dust to the fee (D-19). */
export function bountySplit(pool: bigint, survivors: number) {
  if (survivors <= 0) return { each: 0n, dust: 0n, returnedToCreator: pool };
  const each = pool / BigInt(survivors);
  return { each, dust: pool - each * BigInt(survivors), returnedToCreator: 0n };
}

function sum(xs: readonly bigint[]): bigint {
  return xs.reduce((a, b) => a + b, 0n);
}
