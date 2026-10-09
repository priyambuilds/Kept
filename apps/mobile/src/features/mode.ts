// Switching the app mode (state/mode.ts): each mode keeps its own saved data, so a switch reloads every
// scoped store from the new mode's storage and drops cached queries. Leaving Demo wipes it.
import { resetMockApi } from "@/api";
import { queryClient } from "@/api/queries";
import { clock } from "@/api/mock/clock";
import { MOCK_WALLET } from "@/api/mock/slices";
import { mockOaths } from "@/features/oaths/mockStore";
import { mockReviews } from "@/features/reviews/mockStore";
import { useMode } from "@/state/mode";
import type { AppMode } from "@/state/mode";
import { useSession } from "@/state/session";
import { clearScope, rehydrateScoped, setStorageScope } from "@/state/storage";

/** A fresh mock world: Oaths, Bounties and reviews reseeded on next read, the clock back to real time. */
function resetDemoWorld(): void {
  clock.reset();
  mockOaths.reset();
  mockReviews.reset();
  resetMockApi();
}

export async function setAppMode(mode: AppMode | null): Promise<void> {
  if (useMode.getState().mode === mode) return;
  queryClient.clear();
  useMode.setState({ mode });
  setStorageScope(mode ?? "none");
  await rehydrateScoped();
}

/** A1·m › Try the demo: a clean Demo, signed in on the sample account (no wallet); A4 comes next. */
export async function startDemo(): Promise<void> {
  await clearScope("demo");
  resetDemoWorld();
  await setAppMode("demo");
  await rehydrateScoped();
  useSession.getState().signIn({ token: `mock.${MOCK_WALLET}`, wallet: MOCK_WALLET, genesis: true });
}

/** A1·m › Use my wallet (and invite links): Live; A2 signs in. */
export async function startLive(): Promise<void> {
  await setAppMode("live");
}

/** Profile › Restart demo: the sample account as it was at the start, still signed in. */
export async function restartDemo(): Promise<void> {
  const avatar = useSession.getState().avatar;
  await clearScope("demo");
  resetDemoWorld();
  queryClient.clear();
  await rehydrateScoped();
  useSession.getState().signIn({ token: `mock.${MOCK_WALLET}`, wallet: MOCK_WALLET, genesis: true });
  if (avatar) useSession.getState().finishOnboarding(avatar);
}

/** Profile › Exit demo: everything from Demo is wiped and the mode is picked again on A1. */
export async function exitDemo(): Promise<void> {
  await setAppMode(null);
  await clearScope("demo");
  resetDemoWorld();
}
