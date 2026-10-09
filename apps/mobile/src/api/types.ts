// The app's single API surface (docs/ARCHITECTURE.md §6). Each slice has an `http` and a `mock`
// implementation; `api/flags.ts` picks one per slice. Phase 3+ adds today, oaths, proof, reviews,
// rematch and bounties.
import type { Balances, InboxItem, InviteResolve, Me, OathRead, Price, Profile } from "@kept/shared";
import type { OathFacts } from "@/features/oaths/model";

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

export interface OathsApi {
  /** Every Oath the wallet is in (chain index by member slot until GET /api/me/oaths, BACKEND_GAPS P0-10). */
  list(wallet: string): Promise<OathFacts[]>;
  get(id: string): Promise<OathFacts>;
  /** E1: the Oath behind an invite code. */
  byInvite(code: string, wallet: string): Promise<{ oath: OathFacts; alreadyStarted: boolean }>;
  /**
   * After a confirmed create: store the goal text, make an invite (group), and register the Oath
   * with the settlement scheduler (docs/ARCHITECTURE.md §7, BACKEND_GAPS P0-9). Returns the code.
   */
  register(oath: OathFacts, goal: string): Promise<string | null>;
  /** After a confirmed join: register for settlement and reminders. */
  watch(oath: OathFacts): Promise<void>;
}

/** A gesture the backend may ask for. The design has three; the backend draws from five (BACKEND_GAPS P0-3). */
export type GestureLabel = "thumbs_up" | "victory" | "open_palm" | "closed_fist" | "pointing_up";
export interface Challenge { photo: 1 | 2; dayIndex: number; objectId: number; gesture: GestureLabel; expiresAt: number }
export type ProofOutcome =
  | { status: "pass" }
  | { status: "fail"; attempts: number }
  | { status: "unavailable" }
  | { status: "expired" };

export interface ProofApi {
  challenge(oath: OathFacts, photo: 1 | 2, dayIndex: number, avoid?: GestureLabel): Promise<Challenge>;
  /** `image` is base64 JPEG from the camera. */
  submit(oath: OathFacts, c: Challenge, image: string): Promise<ProofOutcome>;
}

export interface KeptApi {
  oaths: OathsApi;
  proof: ProofApi;
  auth: AuthApi;
  wallet: WalletApi;
  inbox: InboxApi;
  invites: InvitesApi;
  notify: NotifyApi;
  profile: ProfileApi;
}

export type Slice = keyof KeptApi;
export const SLICES: readonly Slice[] = ["oaths", "proof", "auth", "wallet", "inbox", "invites", "notify", "profile"];
export type SliceMode = "http" | "mock";

/** Which slices the backend supports today (docs/API.md); `hybrid` uses http for these only. */
export const BACKEND_HAS: Record<Slice, boolean> = {
  oaths: true,    // program accounts over RPC + /api/oaths/:oath/details
  proof: true,    // photo 2 via POST /api/proof; photo 1 is always mocked (D-23)
  auth: true,
  wallet: true,   // price + faucet routes; balances from RPC
  inbox: false,   // BACKEND_GAPS P1-11
  invites: true,
  notify: true,
  profile: false, // BACKEND_GAPS P1-9
};
