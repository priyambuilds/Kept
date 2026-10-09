// Reading the on-chain Keeper account (see state.rs `Keeper`): 8-byte discriminator, authority (32),
// current_streak u16 @40, best_streak u16 @42, oaths_kept u32 @44, oaths_missed u32 @48,
// last_kept_day i64 @52, bump @60, version_tag [u8; 8] @61, reserved.

const V4_TAG = "KEPTV4!!";

export type KeeperStats = { currentStreak: number; bestStreak: number; oathsKept: number; oathsMissed: number };

/** V4 Keeper stats; "legacy" for an unmigrated pre-V4 account; null when there is no account. */
export function parseKeeper(data: Buffer | null): KeeperStats | "legacy" | null {
  if (!data) return null;
  if (data.length < 69 || data.subarray(61, 69).toString("latin1") !== V4_TAG) return "legacy";
  return { currentStreak: data.readUInt16LE(40), bestStreak: data.readUInt16LE(42), oathsKept: data.readUInt32LE(44), oathsMissed: data.readUInt32LE(48) };
}

/** Flat identity fields: `verifiedSeeker` is true for a Genesis Token holder or a Devnet-allowlisted wallet. */
export function identityFields(identity: { genesis: boolean; source: string | null }) {
  return { verifiedSeeker: identity.genesis, method: identity.source ?? "none" };
}

/** Flat reputation fields: days kept/missed, and Oaths kept/broken (an Oath is broken when any day was missed). */
export function reputationFields(days: { kept: number; missed: number }, oaths: { kept: number; missed: number }) {
  return { kept: days.kept, missed: days.missed, oathsKept: oaths.kept, oathsBroken: oaths.missed };
}

/**
 * A task-weighted Oath kept rate: each recorded Oath day counts once, whether kept or missed.
 * Unclosed days are not in either count yet; callers should display the sample size with the rate.
 */
export function keptRateFields(days: { kept: number; missed: number }) {
  const sampleSize = days.kept + days.missed;
  return {
    keptRate: {
      percentage: sampleSize === 0 ? null : Math.round((days.kept / sampleSize) * 1000) / 10,
      keptDays: days.kept,
      missedDays: days.missed,
      sampleSize,
    },
  };
}
