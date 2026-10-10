// The real backend (docs/API.md). Live (D-80) uses only these: a feature the backend lacks rejects with
// NOT_FOUND ("no backend route yet"), and the app hides its entry points or shows its empty state.
import {
  Address, FaucetResponse, InboxDoneResponse, InboxItem, InboxLiveResponse, InviteCreateResponse, InviteResolveResponse, MeResponse, NonceResponse, NudgeResponse,
  PriceResponse, Profile, ReputationResponse, VerifyResponse,
} from "@kept/shared";
import type { Reputation } from "@kept/shared";
import { avatarFor } from "@/components/avatar/palette";
import { shortWallet } from "@/features/oaths/names";
import { useSession } from "@/state/session";
import { SKR_UNIT } from "@kept/config";
import { readBalances } from "@/chain/connection";
import { programEnv } from "@/chain/program";
import { ApiError, isApiError } from "../errors";
import type { AuthApi, BountiesApi, InboxApi, InvitesApi, MyStats, NotifyApi, ProfileApi, RematchApi, ReviewsApi, WalletApi } from "../types";
import type { HttpClient } from "./client";

export const httpAuth = (c: HttpClient): AuthApi => ({
  nonce: async (wallet) => (await c.post("/api/auth/nonce", { wallet }, NonceResponse)).message,
  verify: (req) => c.post("/api/auth/verify", req, VerifyResponse),
  me: () => c.get("/api/me", MeResponse),
});

export const httpWallet = (c: HttpClient): WalletApi => ({
  balances: async (wallet) => {
    try {
      // The stake mint comes from the program's Config; the env value is only a fallback.
      const mint = await programEnv().then((e) => e.stakeMint.toBase58()).catch(() => undefined);
      return await readBalances(wallet, mint);
    } catch (e) {
      throw new ApiError("OFFLINE", e instanceof Error ? e.message : String(e), 0, true);
    }
  },
  price: () => c.get("/api/price", PriceResponse),
  faucet: async () => {
    const r = await c.post("/api/faucet", {}, FaucetResponse);
    return { signature: r.signature, amount: BigInt(r.amount) * SKR_UNIT };
  },
  // Swap is a mock on Devnet (DECISIONS D-21); there's no exchange route.
  swap: missing("Swap"),
  quote: missing("Swap"),
});

export const httpInvites = (c: HttpClient): InvitesApi => ({
  create: (oath) => c.post("/api/invites", { oath }, InviteCreateResponse),
  resolve: (code) => c.get(`/api/invites/${encodeURIComponent(code)}`, InviteResolveResponse),
});

export const httpNotify = (c: HttpClient): NotifyApi => ({
  registerPushToken: (token) => c.send("/api/push-token", { token }),
  nudge: async (req) => { await c.post("/api/nudges", req, NudgeResponse); },
});

const missing = (what: string) => () => Promise.reject(new ApiError("NOT_FOUND", `${what} has no backend route yet (see docs/BACKEND_GAPS.md)`));

/** GET /api/inbox, PUT /api/inbox/:id. Items of a type the app doesn't know are left out (BACKEND_GAPS P1-11). */
export const httpInbox = (c: HttpClient): InboxApi => ({
  list: async () => {
    // The backend's Genesis gate covers /api/inbox: a non-Seeker (solo only, D-18) just has no inbox.
    const r = await c.get("/api/inbox", InboxLiveResponse).catch((e: unknown) => {
      if (isApiError(e) && e.code === "NOT_ELIGIBLE") return { items: [], unread: 0 };
      throw e;
    });
    const items = r.items.flatMap((i) => {
      const type = InboxItem.shape.type.safeParse(i.type);
      if (!type.success) return [];
      return [{ ...i, type: type.data, actor: i.actor && Address.safeParse(i.actor).success ? i.actor : null }];
    });
    return { items, unread: items.filter((i) => !i.done).length };
  },
  markDone: async (ids) => { await Promise.all(ids.map((id) => c.put(`/api/inbox/${encodeURIComponent(id)}`, {}, InboxDoneResponse))); },
});

const toStats = (r: Reputation): MyStats => ({
  streak: r.streak.current, bestStreak: r.streak.best,
  keptRate: r.keptRate.percentage === null ? null : r.keptRate.percentage / 100, rateDays: r.keptRate.sampleSize,
  oaths: { kept: r.oathsKept, broken: r.oathsBroken },
  bounties: { survived: r.bounties.completed, out: r.bounties.out },
});

/**
 * Profiles: the backend has kept rates (GET /reputation/:wallet) but no names, avatars or bios
 * (BACKEND_GAPS P1-9). My avatar is the one picked on A4 (on this device); other people get a stable
 * avatar from their wallet and their short address as the name.
 */
export const httpProfile = (c: HttpClient): ProfileApi => {
  const reputation = (wallet: string) => c.get(`/reputation/${encodeURIComponent(wallet)}`, ReputationResponse);
  const profileOf = async (wallet: string, mine: boolean) => {
    const r = await reputation(wallet);
    const s = useSession.getState();
    return Profile.parse({
      wallet, name: mine ? "" : shortWallet(wallet), handle: shortWallet(wallet), avatar: (mine ? s.avatar : null) ?? avatarFor(wallet), banner: 0, bio: "", socials: [],
      verifiedSeeker: mine ? s.genesis : true, keptRate: { rate: r.keptRate.percentage === null ? null : r.keptRate.percentage / 100, days: r.keptRate.sampleSize }, visibility: "members",
    });
  };
  const me = () => useSession.getState().wallet ?? "";
  return {
    mine: () => profileOf(me(), true),
    // Only the avatar can be kept, on this device (session.avatar); the rest has nowhere to go yet.
    save: () => profileOf(me(), true),
    get: (wallet) => profileOf(wallet, wallet === me()),
    stats: async () => toStats(await reputation(me())),
    activity: async () => [],
    creator: missing("Creator pages"),
  };
};
/**
 * Bounties: the backend runs one admin-made Bounty at a time (GET /bounty/current) with no creators,
 * categories or user funding, and its proof needs the on-device check (LIVE_DEMO_PLAN Q1, Q3). Until
 * that's settled Live lists none (H1's empty state). Rematch has no route (P1-2). Group review exists
 * (GET /api/oaths/:oath/reviews) but only after failed on-device checks, so Live has none open.
 */
export const httpBounties = (): BountiesApi => ({ list: async () => [], get: missing("Bounties"), join: missing("Bounties"), mine: async () => null, create: missing("Bounties") });
export const httpRematch = (): RematchApi => ({ offer: missing("Rematch"), join: missing("Rematch") });
export const httpReviews = (): ReviewsApi => ({ request: missing("Group review"), get: missing("Group review"), mine: async () => null, openFor: async () => [], vote: missing("Group review") });
