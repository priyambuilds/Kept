// The real backend (docs/API.md). Only routes that exist today; everything else stays on the mock.
import {
  FaucetResponse, InviteCreateResponse, InviteResolveResponse, MeResponse, NonceResponse, NudgeResponse, PriceResponse, VerifyResponse,
} from "@kept/shared";
import { SKR_UNIT } from "@kept/config";
import { readBalances } from "@/chain/connection";
import { ApiError } from "../errors";
import type { AuthApi, InboxApi, InvitesApi, NotifyApi, ProfileApi, WalletApi } from "../types";
import type { HttpClient } from "./client";

export const httpAuth = (c: HttpClient): AuthApi => ({
  nonce: async (wallet) => (await c.post("/api/auth/nonce", { wallet }, NonceResponse)).message,
  verify: (req) => c.post("/api/auth/verify", req, VerifyResponse),
  me: () => c.get("/api/me", MeResponse),
});

export const httpWallet = (c: HttpClient): WalletApi => ({
  balances: async (wallet) => {
    try {
      return await readBalances(wallet);
    } catch (e) {
      throw new ApiError("OFFLINE", e instanceof Error ? e.message : String(e), 0, true);
    }
  },
  price: () => c.get("/api/price", PriceResponse),
  faucet: async () => {
    const r = await c.post("/api/faucet", {}, FaucetResponse);
    return { signature: r.signature, amount: BigInt(r.amount) * SKR_UNIT };
  },
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
export const httpProfile = (): ProfileApi => ({ mine: missing("Profiles"), save: missing("Profiles") });
