// Settlement math, mirroring `calculate_payouts` and settle_oath's success rule in
// kept-example/program/programs/kept_test/src/lib.rs. Keep the two in step: the program decides real
// payouts, this only previews them. Shared by the backend and the app (imported via Metro watchFolders),
// so it must stay dependency-free.

const U64_MAX = (1n << 64n) - 1n;

/** All amounts are mint base units. The treasury receives `fee + dust`. */
export type PayoutResult = { payouts: bigint[]; fee: bigint; dust: bigint };

/**
 * Per-member payouts for one Oath, in member order.
 * - Everyone kept (or no stake): everyone gets their stake back, no fee.
 * - Some missed: the fee is `feeBps` of the missed stakes; keepers get their stake plus an equal
 *   share of the rest. Integer-division remainder (dust) goes to the treasury.
 * - Everyone missed: each member pays `feeBps` of their own stake and gets the rest back.
 * Returns null where the program returns None (no members, fee over 100%, or u64 overflow).
 */
export function calculatePayouts(stake: bigint, feeBps: number, successes: boolean[]): PayoutResult | null {
  if (stake < 0n || stake > U64_MAX || !Number.isInteger(feeBps) || feeBps < 0 || feeBps > 0xffff) return null;
  if (successes.length === 0 || feeBps > 10_000) return null;
  const bps = BigInt(feeBps);
  const members = BigInt(successes.length);
  const keepers = BigInt(successes.filter(Boolean).length);
  const broken = members - keepers;
  const payouts = successes.map(() => 0n);

  if (stake === 0n || broken === 0n) {
    if (stake > 0n) payouts.fill(stake);
    return { payouts, fee: 0n, dust: 0n };
  }

  if (keepers === 0n) {
    const perFee = (stake * bps) / 10_000n;
    payouts.fill(stake - perFee);
    const fee = perFee * members;
    return fee > U64_MAX ? null : { payouts, fee, dust: 0n };
  }

  const lost = stake * broken;
  if (lost > U64_MAX) return null;
  const fee = (lost * bps) / 10_000n;
  const distributable = lost - fee;
  const share = distributable / keepers;
  for (let i = 0; i < successes.length; i++) {
    if (!successes[i]) continue;
    const payout = stake + share;
    if (payout > U64_MAX) return null;
    payouts[i] = payout;
  }
  return { payouts, fee, dust: distributable - share * keepers };
}

/** Bitmask a member's days_kept must equal to have kept every day (settle_oath's `full`). */
export function fullDaysMask(numDays: number): number {
  return numDays === 16 ? 0xffff : (1 << numDays) - 1;
}

// ---- Rules v2 (mirrors kept-example/program/programs/kept_test/src/economics.rs) ----
// Oaths created after `configure_economics` pay a fee on top of the stake at create/join, may buy one freeze
// credit per member, and a member with an uncovered missed day loses 50% of the stake once. Oaths created
// before that keep rules v1 (`calculatePayouts` above) for good.

export const RULES_LEGACY = 1;
export const RULES_V2 = 2;
export const SLASH_BPS = 5_000n;
const BPS = 10_000n;

/** Entry fee for one member's stake, rounded down. Null where the program's `fee_for_stake` returns None. */
export function feeForStake(stake: bigint, feeBps: number): bigint | null {
  if (stake < 0n || stake > U64_MAX || !Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10_000) return null;
  return (stake * BigInt(feeBps)) / BPS;
}

/** Amount slashed from an unsuccessful member under rules v2, rounded down (the member keeps the odd unit). */
export function slashAmount(stake: bigint): bigint {
  return (stake * SLASH_BPS) / BPS;
}

/** Days that count as kept: recorded proofs plus a freeze-covered day. */
export function effectiveDays(daysKept: number, frozenDays: number): number {
  return (daysKept | frozenDays) & 0xffff;
}

/** Earliest unix time settle_oath accepts. Rules v2 wait one more Oath day so the last day can be frozen. */
export function settleAt(oath: { startTs: number; numDays: number; daySeconds: number; rulesVersion: number }): number {
  const end = oath.startTs + oath.numDays * oath.daySeconds;
  return oath.rulesVersion === RULES_V2 ? end + oath.daySeconds : end;
}

/** All amounts are mint base units. The treasury receives `toTreasury` (fees + freeze proceeds + dust). */
export type SettlementV2 = { payouts: bigint[]; slashed: bigint; toTreasury: bigint; carryover: bigint; dust: bigint };

/**
 * Rules v2 settlement, in member order.
 * - Successful members (every day kept or frozen) get their stake back plus an equal share of the slashed stake.
 * - Unsuccessful members get their stake minus one 50% slash, however many days they missed.
 * - With no successful member the slashed stake is carryover for the reserve, not treasury.
 * - Fees and freeze proceeds go to treasury, with the integer remainder of the winners' share (dust).
 * Invariant: sum(payouts) + toTreasury + carryover = stake * members + feesCollected + freezeProceeds.
 * Returns null where the program returns None (no members, or a value outside u64).
 */
export function calculatePayoutsV2(stake: bigint, successes: boolean[], feesCollected: bigint, freezeProceeds: bigint): SettlementV2 | null {
  for (const v of [stake, feesCollected, freezeProceeds]) if (v < 0n || v > U64_MAX) return null;
  if (successes.length === 0) return null;
  const members = BigInt(successes.length);
  const keepers = BigInt(successes.filter(Boolean).length);
  const slash = slashAmount(stake);
  const slashed = slash * (members - keepers);
  const share = keepers === 0n ? 0n : slashed / keepers;
  const carryover = keepers === 0n ? slashed : 0n;
  const dust = keepers === 0n ? 0n : slashed - share * keepers;
  const payouts = successes.map((won) => (won ? stake + share : stake - slash));
  const toTreasury = feesCollected + freezeProceeds + dust;
  const collected = stake * members + feesCollected + freezeProceeds;
  // Every partial sum the program checks is bounded by one of these, so checking them matches its overflow cases.
  if (slashed > U64_MAX || toTreasury > U64_MAX || collected > U64_MAX || payouts.some((p) => p > U64_MAX)) return null;
  if (payouts.reduce((a, b) => a + b, 0n) + toTreasury + carryover !== collected) return null;
  return { payouts, slashed, toTreasury, carryover, dust };
}
