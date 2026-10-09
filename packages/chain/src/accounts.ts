import type { PublicKey } from "@solana/web3.js";
import { accountsCoder } from "./idl";

export const OATH_STATUS = ["open", "active", "settled", "cancelled"] as const;
export type OathChainStatus = (typeof OATH_STATUS)[number];

export interface OathMember {
  wallet: string;
  staked: boolean;
  /** Bitmask: bit d set = day d kept. */
  daysKept: number;
  claimed: boolean;
  payout: bigint;
}

export interface OathAccount {
  creator: string;
  oathId: bigint;
  stake: bigint;
  mint: string;
  goalHash: string;
  objectId: number;
  numDays: number;
  daySeconds: number;
  startTs: number;
  tzOffsetMinutes: number;
  status: OathChainStatus;
  isSolo: boolean;
  members: OathMember[];
}

export interface ConfigAccount {
  admin: string;
  verifier: string;
  treasury: string;
  feeBps: number;
  stakeMint: string;
}

type Raw = Record<string, any>;
const big = (v: { toString(): string }) => BigInt(v.toString());
const key = (v: PublicKey) => v.toBase58();
const hex = (bytes: number[]) => bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

function statusOf(raw: Raw): OathChainStatus {
  const k = Object.keys(raw)[0]?.toLowerCase();
  const s = OATH_STATUS.find((x) => x === k);
  if (!s) throw new Error(`unknown Oath status ${JSON.stringify(raw)}`);
  return s;
}

/** Decodes an Oath account (state.rs:43-59) with the IDL coder. Throws on a wrong discriminator. */
export function decodeOath(data: Uint8Array): OathAccount {
  const r: Raw = accountsCoder.decode("Oath", Buffer.from(data));
  const count = Number(r.member_count);
  return {
    creator: key(r.creator),
    oathId: big(r.oath_id),
    stake: big(r.stake_amount),
    mint: key(r.mint),
    goalHash: hex(r.goal_hash),
    objectId: r.object_id,
    numDays: r.num_days,
    daySeconds: r.day_seconds,
    startTs: Number(big(r.start_ts)),
    tzOffsetMinutes: r.tz_offset_minutes,
    status: statusOf(r.status),
    isSolo: r.is_solo,
    members: (r.members as Raw[]).slice(0, count).map((m) => ({
      wallet: key(m.authority), staked: m.staked, daysKept: m.days_kept, claimed: m.claimed, payout: big(m.payout),
    })),
  };
}

export function decodeConfig(data: Uint8Array): ConfigAccount {
  const r: Raw = accountsCoder.decode("Config", Buffer.from(data));
  return { admin: key(r.admin), verifier: key(r.verifier), treasury: key(r.treasury), feeBps: r.fee_bps, stakeMint: key(r.stake_mint) };
}

/** Anchor account discriminator for Oath (first 8 bytes), for getProgramAccounts filters. */
export const oathDiscriminator = (): Uint8Array => accountsCoder.accountDiscriminator("Oath");
/** Byte offset of member slot i's wallet inside an Oath account (for memcmp filters). */
export const memberSlotOffset = (i: number) => 139 + 44 * i;
