// The real backend (docs/API.md). Only routes that exist today; everything else stays on the mock.
import {
  FaucetResponse, InviteCreateResponse, InviteResolveResponse, MeResponse, NonceResponse, NudgeResponse, PriceResponse, VerifyResponse,
} from "@kept/shared";
import { SKR_UNIT } from "@kept/config";
import { readBalances } from "@/chain/connection";
import { programEnv } from "@/chain/program";
import { ApiError } from "../errors";
import type { AuthApi, BountiesApi, InboxApi, InvitesApi, NotifyApi, ProfileApi, RematchApi, ReviewsApi, WalletApi } from "../types";
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
});

export const httpInvites = (c: HttpClient): InvitesApi => ({
  create: (oath) => c.post("/api/invites", { oath }, InviteCreateResponse),
  resolve: (code) => c.get(`/api/invites/${encodeURIComponent(code)}`, InviteResolveResponse),
});

export const httpNotify = (c: HttpClient): NotifyApi => ({
  registerPushToken: (token) => c.send("/api/push-token", { token }),
  nudge: async (req) => { await c.post("/api/nudges", req, NudgeResponse); },
});

/** No backend routes yet (BACKEND_GAPS P1-11 inbox, P1-9 profiles). Selecting http fails loudly. */
const missing = (what: string) => () => Promise.reject(new ApiError("NOT_FOUND", `${what} has no backend route yet (see docs/BACKEND_GAPS.md)`));
export const httpInbox = (): InboxApi => ({ list: missing("Inbox"), markDone: missing("Inbox") });
export const httpProfile = (): ProfileApi => ({
  mine: missing("Profiles"), save: missing("Profiles"), get: missing("Profiles"), stats: missing("Stats"), activity: missing("Activity"), creator: missing("Creator pages"),
});
/** Bounties, Rematch and group review have no backend or program support yet (BACKEND_GAPS P1-10, P1-2, P1-1). */
export const httpBounties = (): BountiesApi => ({ list: missing("Bounties"), get: missing("Bounties"), join: missing("Bounties"), mine: missing("Bounties"), create: missing("Bounties") });
export const httpRematch = (): RematchApi => ({ offer: missing("Rematch"), join: missing("Rematch") });
export const httpReviews = (): ReviewsApi => ({ request: missing("Group review"), get: missing("Group review"), mine: missing("Group review"), openFor: missing("Group review"), vote: missing("Group review") });
