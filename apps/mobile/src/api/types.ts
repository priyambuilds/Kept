// The app's single API surface (docs/ARCHITECTURE.md §6). Each slice has an `http` and a `mock`
// implementation; `api/flags.ts` picks one per slice. Phase 3+ adds today, oaths, proof, reviews,
// rematch and bounties.
import type { Balances, InboxItem, InviteResolve, Me, OathRead, Price, Profile } from "@kept/shared";

export interface AuthApi {
  /** The exact message the wallet must sign (POST /api/auth/nonce). */
  nonce(wallet: string): Promise<string>;
  verify(req: { wallet: string; message: string; signature: string }): Promise<{ token: string; wallet: string }>;
  me(): Promise<Me>;
}

export interface WalletApi {
  /** SKR and SOL in base units. http reads them from RPC until GET /api/balances exists (BACKEND_GAPS P0-10). */
  balances(wallet: string): Promise<Balances>;
  price(): Promise<Price>;
  /** Devnet faucet; `amount` in base units. */
  faucet(): Promise<{ signature: string; amount: bigint }>;
}

export interface InboxApi {
  list(): Promise<{ items: InboxItem[]; unread: number }>;
  markDone(ids: string[]): Promise<void>;
}

export interface InvitesApi {
  create(oath: string): Promise<{ code: string; deepLink: string; oath: OathRead }>;
  resolve(code: string): Promise<InviteResolve>;
}

export interface NotifyApi {
  registerPushToken(token: string): Promise<void>;
  nudge(req: { oath: string; recipient: string; dayIndex: number }): Promise<void>;
}

export interface ProfileApi {
  mine(): Promise<Profile>;
  save(patch: Partial<Pick<Profile, "name" | "avatar" | "banner" | "bio" | "socials" | "visibility">>): Promise<Profile>;
}

export interface KeptApi {
  auth: AuthApi;
  wallet: WalletApi;
  inbox: InboxApi;
  invites: InvitesApi;
  notify: NotifyApi;
  profile: ProfileApi;
}

export type Slice = keyof KeptApi;
export const SLICES: readonly Slice[] = ["auth", "wallet", "inbox", "invites", "notify", "profile"];
export type SliceMode = "http" | "mock";

/** Which slices the backend supports today (docs/API.md); `hybrid` uses http for these only. */
export const BACKEND_HAS: Record<Slice, boolean> = {
  auth: true,
  wallet: true,   // price + faucet routes; balances from RPC
  inbox: false,   // BACKEND_GAPS P1-11
  invites: true,
  notify: true,
  profile: false, // BACKEND_GAPS P1-9
};
