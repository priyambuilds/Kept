// Pure bounty rules. Bounties are off-chain: entries and check-ins live in the database, and the pool is
// paid by SPL transfer from the configured payer wallet when the bounty ends.

export type BountyTiming = { startTs: number; daySeconds: number; numDays: number };

export const BOUNTY_DAYS = [3, 7, 14] as const;
export const MIN_BOUNTY_DAY_SECONDS = 60;
export const MAX_BOUNTY_DAY_SECONDS = 86_400;

export function bountyEndTs(b: BountyTiming): number { return b.startTs + b.numDays * b.daySeconds; }

/** Current day index (may be < 0 before the start or ≥ numDays after the end). */
export function bountyDay(b: BountyTiming, now: number): number { return Math.floor((now - b.startTs) / b.daySeconds); }

/** Joining is open until day 1 (index 0) ends. */
export function bountyJoinOpen(b: BountyTiming, now: number): boolean { return now < b.startTs + b.daySeconds; }

/** Entries still in that did not keep a closed day after `from` up to `through`; each goes out on its first miss. */
export function bountyKnockouts(entries: Array<{ wallet: string; daysKept: number; out: boolean }>, from: number, through: number): Array<{ wallet: string; outDay: number }> {
  const out: Array<{ wallet: string; outDay: number }> = [];
  for (const e of entries) {
    if (e.out) continue;
    for (let day = Math.max(0, from + 1); day <= through; day++) {
      if ((e.daysKept & (1 << day)) === 0) { out.push({ wallet: e.wallet, outDay: day }); break; }
    }
  }
  return out;
}

/** Even split in base units; the remainder stays with the payer. */
export function splitPool(pool: bigint, winners: number): { share: bigint; remainder: bigint } {
  if (winners <= 0) return { share: 0n, remainder: pool };
  const share = pool / BigInt(winners);
  return { share, remainder: pool - share * BigInt(winners) };
}

/** "1234.5" SKR → base units, exactly. Null for malformed input or more decimals than the mint has. */
export function parseTokenAmount(value: unknown, decimals: number): bigint | null {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^\d+(\.\d+)?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  if (fraction.length > decimals) return null;
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
}

export type SavedPayout = { signature: string; validHeight: number | null };
export type ChainStatus = { err: unknown; confirmationStatus?: string | null } | null;

/**
 * What to do with a winner whose payout may already have been sent:
 * "send" (nothing sent, or the last transfer failed / expired unlanded), "paid" (confirmed), or "wait".
 */
export function payoutAction(saved: SavedPayout, status: ChainStatus, blockHeight: number | null): "send" | "paid" | "wait" {
  if (!saved.signature) return "send";
  if (status && !status.err) return status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized" ? "paid" : "wait";
  if (status?.err) return "send";
  // Not seen on-chain: resend only once its blockhash can no longer be used.
  if (saved.validHeight == null || blockHeight == null || blockHeight <= saved.validHeight) return "wait";
  return "send";
}

/** Bounty ids are positive Postgres INTEGERs; anything else (or out of range) is treated as not found. */
export function parseBountyId(raw: unknown): number | null {
  if (typeof raw !== "string" || !/^[1-9]\d{0,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id <= 2_147_483_647 ? id : null;
}

export const RECENTLY_OUT_DEFAULT_LIMIT = 20;
export const RECENTLY_OUT_MAX_LIMIT = 100;

/** `?limit=` for recently-out: default 20, 1–100; null when malformed. */
export function parseRecentlyOutLimit(raw: unknown): number | null {
  if (raw === undefined) return RECENTLY_OUT_DEFAULT_LIMIT;
  if (typeof raw !== "string" || !/^\d{1,3}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= RECENTLY_OUT_MAX_LIMIT ? n : null;
}

export type OutEntry = { wallet: string; outDay: number | null; outAt: Date | null };

/**
 * Newest knockouts first: outAt descending, entries without outAt (knocked out before it was recorded)
 * after all timed ones, then outDay descending, then wallet ascending so ties are stable.
 */
export function sortRecentlyOut(entries: OutEntry[]): OutEntry[] {
  return [...entries].sort((a, b) => {
    const at = (b.outAt?.getTime() ?? -Infinity) - (a.outAt?.getTime() ?? -Infinity);
    if (at !== 0 && Number.isFinite(at)) return at;
    if (!a.outAt !== !b.outAt) return a.outAt ? -1 : 1;
    const day = (b.outDay ?? -1) - (a.outDay ?? -1);
    if (day !== 0) return day;
    return a.wallet < b.wallet ? -1 : a.wallet > b.wallet ? 1 : 0;
  });
}
