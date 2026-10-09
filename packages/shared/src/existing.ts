// Routes that exist today in backend (docs/API.md). Shapes match backend/src/routes/v4.ts exactly.
import { z } from "zod";
import { Address, Amount } from "./primitives";

// POST /api/auth/nonce
export const NonceRequest = z.object({ wallet: Address });
export const NonceResponse = z.object({ message: z.string().min(1) });
// POST /api/auth/verify
export const VerifyRequest = z.object({ wallet: Address, message: z.string(), signature: z.string() });
export const VerifyResponse = z.object({ token: z.string().min(1), wallet: Address });
// GET /api/me
export const MeResponse = z.object({
  wallet: Address,
  genesis: z.boolean(),
  mocked: z.boolean(),
  genesisMint: z.string().nullable(),
});
export type Me = z.infer<typeof MeResponse>;

/** On-chain Oath status byte (state.rs:39). */
export const OathStatusCode = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export const OATH_STATUS = { open: 0, active: 1, settled: 2, cancelled: 3 } as const;

/** `OathRead` as the API returns it (v4.ts:362). */
export const OathRead = z.object({
  oathId: z.string(),
  creator: Address,
  goalHash: z.string().regex(/^[0-9a-f]{64}$/),
  status: OathStatusCode,
  startTs: z.number().int(),
  daySeconds: z.number().int().positive(),
  numDays: z.number().int().positive(),
  objectId: z.number().int().min(0).max(7),
  members: z.array(Address).min(1).max(4),
  daysKept: z.record(z.string(), z.number().int().nonnegative()),
});
export type OathRead = z.infer<typeof OathRead>;

// POST /api/oaths/watch → 204 (no body)
export const WatchRequest = z.object({ oath: Address });
// POST /api/oaths/details
export const DetailsRequest = z.object({ oath: Address, goalText: z.string().min(1).max(120) });
export const DetailsResponse = z.object({ oath: Address, goalText: z.string() });
// GET /api/oaths/:oath/details
export const GoalResponse = z.object({ goalText: z.string().nullable() });
// POST /api/invites
export const InviteCreateRequest = z.object({ oath: Address });
export const InviteCreateResponse = z.object({ code: z.string().min(1), deepLink: z.string().startsWith("kept://join/"), oath: OathRead });
// GET /api/invites/:code
export const InviteResolveResponse = z.object({ oath: OathRead, goalText: z.string().nullable(), alreadyStarted: z.boolean() });
export type InviteResolve = z.infer<typeof InviteResolveResponse>;
// POST /api/push-token → 204
export const PushTokenRequest = z.object({ token: z.string().min(1).max(4096) });
// POST /api/nudges
export const NudgeRequest = z.object({ oath: Address, recipient: Address, dayIndex: z.number().int().nonnegative() });
export const NudgeResponse = z.object({ ok: z.literal(true) });
// GET /api/price
export const PriceResponse = z.object({ usdPerSkr: z.number().positive(), skrForUsd10: z.number(), devnet: z.boolean(), label: z.string() });
export type Price = z.infer<typeof PriceResponse>;
// POST /api/faucet  (amount is whole SKR as a string, e.g. "5000")
export const FaucetResponse = z.object({ signature: z.string(), amount: z.string().regex(/^\d+$/), mint: Address });
// POST /api/proof (today's single-photo route; detection is client-supplied, BACKEND_GAPS P0-1)
export const LegacyProofRequest = z.object({
  oath: Address,
  dayIndex: z.number().int().nonnegative(),
  photo: z.string().min(1),
  detection: z.object({
    object: z.object({ label: z.string(), confidence: z.number() }),
    gesture: z.object({ label: z.string(), confidence: z.number() }),
    target: z.object({ object: z.string(), gesture: z.string() }),
  }),
});
export const LegacyProofResponse = z.object({
  signature: z.string(),
  proofHash: z.string(),
  target: z.object({ object: z.string(), gesture: z.string() }),
  recovered: z.boolean().optional(),
});

export { Amount };
