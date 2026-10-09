// Who is signed in, and onboarding progress. Persisted so a restart skips onboarding.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "./storage";

export interface SessionState {
  /** Backend bearer token (7 days) or a mock token. */
  token: string | null;
  wallet: string | null;
  /** Seeker Genesis verified (GET /api/me). */
  genesis: boolean;
  /** Finished A4 at least once. */
  onboarded: boolean;
  /** 8-digit avatar config picked on A4 (kept on the device until profiles exist, BACKEND_GAPS P1-9). */
  avatar: string | null;
  /** Invite code from `kept://join/<code>` or A1 "I have an invite"; consumed by the `cont:` rule. */
  invite: string | null;
  signIn(s: { token: string; wallet: string; genesis: boolean }): void;
  setGenesis(genesis: boolean): void;
  finishOnboarding(avatar: string): void;
  setInvite(code: string | null): void;
  signOut(): void;
}

export const useSession = create<SessionState>()(persist((set) => ({
  token: null, wallet: null, genesis: false, onboarded: false, avatar: null, invite: null,
  signIn: ({ token, wallet, genesis }) => set({ token, wallet, genesis }),
  setGenesis: (genesis) => set({ genesis }),
  finishOnboarding: (avatar) => set({ onboarded: true, avatar }),
  setInvite: (invite) => set({ invite }),
  signOut: () => set({ token: null, wallet: null, genesis: false }),
}), { name: "kept.session", storage: persistStorage }));
