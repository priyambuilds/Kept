// createApi composes one implementation per slice from the flags (docs/ARCHITECTURE.md §6).
// useApi() rebuilds it when the Dev menu changes a flag or the scenario.
import { useMemo } from "react";
import { useDev, flags as currentFlags } from "@/state/dev";
import { useSession } from "@/state/session";
import { createHttpClient } from "./http/client";
import { httpAuth, httpBounties, httpInbox, httpInvites, httpNotify, httpProfile, httpRematch, httpReviews, httpWallet } from "./http/slices";
import { mockBountiesApi, mockRematchApi, mockReviewsApi } from "./mock/phase4";
import { httpOaths, httpProof } from "./http/oaths";
import { mockOathsApi, mockProofApi } from "./mock/oaths";
import { mockAuth, mockInbox, mockInvites, mockNotify, mockProfile, mockWallet } from "./mock/slices";
import type { MockContext } from "./mock/slices";
import type { KeptApi, Slice, SliceMode } from "./types";

export * from "./types";
export { ApiError, isApiError } from "./errors";

const MOCK_LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 450;

/** The mock backend. Built once per context so its state (done inbox items, faucet use) survives flag changes. */
export function createMockApi(ctx: MockContext): KeptApi {
  return { oaths: mockOathsApi(ctx), proof: mockProofApi(ctx), bounties: mockBountiesApi(ctx), rematch: mockRematchApi(ctx), reviews: mockReviewsApi(ctx), auth: mockAuth(ctx), wallet: mockWallet(ctx), inbox: mockInbox(ctx), invites: mockInvites(ctx), notify: mockNotify(ctx), profile: mockProfile(ctx) };
}

export function createApi(f: Record<Slice, SliceMode>, mock: KeptApi, getToken: () => string | null): KeptApi {
  const http = createHttpClient(getToken);
  return {
    oaths: f.oaths === "http" ? httpOaths(http) : mock.oaths,
    // Real proof still uses the mock for photo 1 and for Oaths that live on the mock.
    proof: f.proof === "http" ? httpProof(http, mock.proof) : mock.proof,
    bounties: f.bounties === "http" ? httpBounties() : mock.bounties,
    rematch: f.rematch === "http" ? httpRematch() : mock.rematch,
    reviews: f.reviews === "http" ? httpReviews() : mock.reviews,
    auth: f.auth === "http" ? httpAuth(http) : mock.auth,
    wallet: f.wallet === "http" ? httpWallet(http) : mock.wallet,
    inbox: f.inbox === "http" ? httpInbox() : mock.inbox,
    invites: f.invites === "http" ? httpInvites(http) : mock.invites,
    notify: f.notify === "http" ? httpNotify(http) : mock.notify,
    profile: f.profile === "http" ? httpProfile() : mock.profile,
  };
}

const mockContext = {
  scenario: () => useDev.getState().scenario,
  wallet: () => useSession.getState().wallet,
  latencyMs: MOCK_LATENCY_MS,
};
let mockApi = createMockApi(mockContext);
/** A fresh mock backend (faucet unused, nothing swapped, inbox unread): the dev deep link. */
export function resetMockApi() { mockApi = createMockApi(mockContext); }
const getToken = () => useSession.getState().token;

/** The API for non-React callers (sign-in flow, query functions). */
export function getApi(): KeptApi {
  return createApi(currentFlags(), mockApi, getToken);
}

/** The API as a hook; a new instance whenever the Dev menu changes a flag (QueryProvider then resets queries). */
export function useApi(): KeptApi {
  const overrides = useDev((s) => s.overrides);
  return useMemo(() => createApi(currentFlags({ overrides }), mockApi, getToken), [overrides]);
}
