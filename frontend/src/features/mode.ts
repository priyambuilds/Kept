// Switching the app mode (state/mode.ts): each mode keeps its own saved data, so a switch reloads every
// scoped store from the new mode's storage and drops cached queries. Leaving Demo wipes it.
import { resetMockApi } from "@/api";
import { queryClient } from "@/api/queries";
import { clock } from "@/lib/clock";
import { MOCK_WALLET } from "@/api/mock/slices";
import { mockOaths } from "@/features/oaths/mockStore";
import { mockReviews } from "@/features/reviews/mockStore";
import { RESULT_SCREENS, useDeviceOaths } from "@/features/oaths/device";
import { mockScenario } from "@/state/dev";
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

/**
 * The sample account opens on a calm Today: its finished and broken Oaths' result screens and today's
 * recap count as seen (they're one tap away: the claim banner, D3 in the Oaths tab).
 */
function seedDemo(): void {
  mockOaths.ensureSeeded(mockScenario(), MOCK_WALLET);
  const ids = mockOaths.list(MOCK_WALLET).map((o) => o.id);
  useDeviceOaths.setState({ shownResults: ids.flatMap((id) => RESULT_SCREENS.map((k) => `${id}:${k}`)), recapShownOn: new Date(clock.now()).toDateString() });
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
  seedDemo();
}

/** A1·m › Use my wallet (and invite links): Live; A2 signs in. */
export async function startLive(): Promise<void> {
  await setAppMode("live");
}

/**
 * "I have an invite" and `kept://join/<code>`: always Live. Leaving Demo this way wipes it, like Exit demo.
 * The code is kept in the Live session for onboarding's cont: rule (or E1 when already signed in).
 */
export async function startLiveWithInvite(code: string): Promise<void> {
  const fromDemo = useMode.getState().mode === "demo";
  await setAppMode("live");
  if (fromDemo) { await clearScope("demo"); resetDemoWorld(); }
  useSession.getState().setInvite(code);
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
  seedDemo();
}

const DAY_MS = 86_400_000;

/**
 * Profile › Skip to tomorrow (Demo only, owner Q6): the virtual clock moves forward 24 h, so every Oath
 * crosses exactly one day boundary (the demo's days don't end at midnight), the mock settles that day
 * with the engine (a miss costs HP and stake and is paid to the keepers; a kept day heals), and every
 * query refetches so Today shows the new day (and its B5 recap).
 */
export async function skipToTomorrow(): Promise<void> {
  if (useMode.getState().mode !== "demo") return;
  clock.set(clock.now() + DAY_MS);
  await queryClient.invalidateQueries();
}

/** Profile › Exit demo: everything from Demo is wiped and the mode is picked again on A1. */
export async function exitDemo(): Promise<void> {
  await setAppMode(null);
  await clearScope("demo");
  resetDemoWorld();
}
