// Routes PROPOSED in docs/BACKEND_GAPS.md. None exists in apps/api yet; the app reaches them through
// the mock until the backend developer adds them. Keep these in sync with BACKEND_GAPS.
import { z } from "zod";
import { Address, Amount, IsoTime } from "./primitives";
import { OathRead } from "./existing";

const ObjectIndex = z.number().int().min(0).max(7);
const Gesture = z.enum(["thumbs_up", "victory", "open_palm"]);
export const ReviewMode = z.enum(["ai", "ai_group"]);
export const ProofStatus = z.enum(["none", "photo1", "kept", "review", "missed"]);
export const LifeStatus = z.enum(["open", "waiting", "active", "settled", "cancelled", "broken"]);

// ── P0-10 ── GET /api/me/oaths
export const MyOathsResponse = z.object({
  oaths: z.array(z.object({
    oath: Address,
    role: z.enum(["creator", "member"]),
    status: LifeStatus,
    isSolo: z.boolean(),
    name: z.string().nullable(),
    goalText: z.string().nullable(),
    objectId: ObjectIndex,
    numDays: z.number().int().positive(),
    stake: Amount,
    startsAt: IsoTime.nullable(),
    rematchOf: Address.nullable().optional(),
  })),
});
export type MyOaths = z.infer<typeof MyOathsResponse>;

// ── P0-10 ── GET /api/oaths/:oath (facts only; the app computes HP, grid and balances with the engine)
export const OathFactsResponse = z.object({
  oath: OathRead.extend({
    tzOffsetMinutes: z.number().int().min(-720).max(840),
    stake: Amount,
    isSolo: z.boolean(),
    /** On-chain payout per member once settled or cancelled (D-14). */
    payouts: z.record(z.string(), Amount).optional(),
    claimed: z.record(z.string(), z.boolean()).optional(),
  }),
  details: z.object({ goalText: z.string().nullable(), name: z.string().nullable(), reviewMode: ReviewMode }),
  today: z.object({
    dayIndex: z.number().int(),
    dayEndsAt: IsoTime,
    proof: z.record(z.string(), ProofStatus),
    keptAt: z.record(z.string(), IsoTime).optional(),
  }).nullable(),
  reviewRequests: z.array(z.object({ id: z.string(), by: Address, expiresAt: IsoTime, votedByMe: z.boolean() })).default([]),
});
export type OathFacts = z.infer<typeof OathFactsResponse>;

// ── P0-10 ── GET /api/balances
export const BalancesResponse = z.object({ skr: Amount, sol: Amount });
export type Balances = z.infer<typeof BalancesResponse>;

// ── P0-2 ── two-photo proof
export const ChallengeRequest = z.object({
  target: z.discriminatedUnion("kind", [z.object({ kind: z.literal("oath"), oath: Address }), z.object({ kind: z.literal("bounty"), bounty: z.string() })]),
  step: z.union([z.literal(1), z.literal(2)]),
});
export const ChallengeResponse = z.object({ challengeId: z.string(), object: ObjectIndex, gesture: Gesture, expiresAt: IsoTime });
export type Challenge = z.infer<typeof ChallengeResponse>;
export const SubmitResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pass"), step: z.union([z.literal(1), z.literal(2)]), signature: z.string().optional() }),
  z.object({ status: z.literal("fail"), reason: z.string(), attemptsLeft: z.number().int().nonnegative(), reviewAvailable: z.boolean() }),
  z.object({ status: z.literal("unavailable"), retryAfterSeconds: z.number().int().nonnegative() }),
  z.object({ status: z.literal("expired") }),
]);
export type SubmitResult = z.infer<typeof SubmitResponse>;
export const ProofStatusResponse = z.object({
  step: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  photo1At: IsoTime.nullable(),
  attemptsUsed: z.number().int().nonnegative(),
  dayEndsAt: IsoTime,
});

// ── P1-1 ── group review
export const ReviewRequestResponse = z.object({ id: z.string(), expiresAt: IsoTime });
export const ReviewDetailResponse = z.object({
  id: z.string(), oath: Address, by: Address, photoUrl: z.string(), object: ObjectIndex, gesture: Gesture,
  expiresAt: IsoTime, votes: z.object({ approve: z.number().int(), reject: z.number().int(), needed: z.number().int() }),
  status: z.enum(["pending", "approved", "rejected", "expired"]),
});
export const VoteRequest = z.object({ approve: z.boolean() });

// ── P1-2 ── Rematch
export const RematchResponse = z.object({
  original: Address,
  rematch: Address.nullable(),
  closesAt: IsoTime,
  stake: Amount,
  myHeld: Amount,
  joined: z.array(Address),
  canStart: z.boolean(),
});

// ── P1-7 ── rename while Open
export const RenameRequest = z.object({ name: z.string().min(1).max(24) });

// ── P1-9 ── profiles
export const Profile = z.object({
  wallet: Address,
  name: z.string(),
  handle: z.string(),
  avatar: z.string().regex(/^\d{8}$/),
  banner: z.number().int().min(0).max(4),
  bio: z.string(),
  socials: z.array(z.object({ kind: z.string(), handle: z.string() })),
  verifiedSeeker: z.boolean(),
  keptRate: z.object({ rate: z.number().min(0).max(1).nullable(), days: z.number().int() }),
  visibility: z.enum(["public", "members", "private"]),
});
export type Profile = z.infer<typeof Profile>;

// ── P1-10 ── Bounties
export const Bounty = z.object({
  id: z.string(),
  title: z.string().min(1),
  creator: Address,
  brand: z.object({ name: z.string(), verified: z.boolean(), gradient: z.number().int(), logo: z.string().nullable() }),
  message: z.string(),
  link: z.string().nullable(),
  objectId: ObjectIndex,
  numDays: z.number().int().positive(),
  pool: Amount,
  joinClosesAt: IsoTime,
  startsAt: IsoTime,
  joined: z.number().int(),
  remaining: z.number().int(),
  requirements: z.object({ minKeptRate: z.number().nullable(), tokenHeld: z.object({ mint: Address, amount: Amount }).nullable() }),
  myStatus: z.enum(["none", "joined", "out", "survived"]),
});
export type Bounty = z.infer<typeof Bounty>;
export const BountyFeedResponse = z.object({ bounties: z.array(Bounty), next: z.string().nullable() });

// ── P1-11 ── Inbox
export const InboxItem = z.object({
  id: z.string(),
  type: z.enum(["invite", "review", "claim", "rematch", "nudge", "recap", "started", "followed", "deadline", "broken", "bounty"]),
  actor: Address.nullable(),
  title: z.string(),
  body: z.string(),
  createdAt: IsoTime,
  needsAction: z.boolean(),
  done: z.boolean(),
  ref: z.object({ oath: Address.optional(), bounty: z.string().optional(), review: z.string().optional() }),
});
export type InboxItem = z.infer<typeof InboxItem>;
export const InboxResponse = z.object({ items: z.array(InboxItem), unread: z.number().int() });

// ── P1-16 ── GET /api/me/stats (B2, F5, L4 streak chips; kept rate)
export const MeStatsResponse = z.object({
  streak: z.number().int().nonnegative(),
  keptRate: z.number().min(0).max(1).nullable(),
  rateDays: z.number().int().nonnegative(),
});
export type MeStats = z.infer<typeof MeStatsResponse>;
