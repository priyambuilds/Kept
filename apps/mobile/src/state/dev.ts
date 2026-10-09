// Dev menu settings: per-slice API mode overrides and the mock scenario. Persisted across restarts.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { env } from "@/config/env";
import type { ApiMode } from "@/config/env";
import { BACKEND_HAS, SLICES } from "@/api/types";
import type { Slice, SliceMode } from "@/api/types";
import { DEFAULT_SCENARIO } from "@/api/mock/scenarios";
import type { Scenario } from "@/api/mock/scenarios";
import { persistStorage } from "./storage";

/** The default mode for each slice under a global API mode. */
export function defaultFlags(mode: ApiMode): Record<Slice, SliceMode> {
  return Object.fromEntries(SLICES.map((s) => [s, mode === "mock" ? "mock" : mode === "http" ? "http" : BACKEND_HAS[s] ? "http" : "mock"])) as Record<Slice, SliceMode>;
}

export interface DevState {
  overrides: Partial<Record<Slice, SliceMode>>;
  scenario: Scenario;
  /** Mock wallet instead of MWA (for emulators without a wallet app). */
  mockWallet: boolean;
  setSlice(slice: Slice, mode: SliceMode | null): void;
  setAll(mode: ApiMode): void;
  setScenario(s: Scenario): void;
  setMockWallet(on: boolean): void;
}

export const useDev = create<DevState>()(persist((set) => ({
  overrides: {}, scenario: DEFAULT_SCENARIO, mockWallet: env.apiMode === "mock",
  setSlice: (slice, mode) => set((s) => {
    const overrides = { ...s.overrides };
    if (mode) overrides[slice] = mode; else delete overrides[slice];
    return { overrides };
  }),
  setAll: (mode) => set({ overrides: defaultFlags(mode), mockWallet: mode === "mock" }),
  setScenario: (scenario) => set({ scenario }),
  setMockWallet: (mockWallet) => set({ mockWallet }),
}), { name: "kept.dev", storage: persistStorage }));

/** Effective mode per slice: Dev menu override, else the build default. */
export function flags(state: Pick<DevState, "overrides"> = useDev.getState()): Record<Slice, SliceMode> {
  return { ...defaultFlags(env.apiMode), ...state.overrides };
}

/**
 * Dev deep link (`kept://dev/open/…&hold=1`): mock signatures and proof checks never finish, so the
 * pending screens (A2·s, C7, F2, …) can be looked at. Not persisted.
 */
export const useDevHold = create<{ hold: boolean; still: boolean; setHold(hold: boolean): void }>()((set) => ({
  hold: false,
  /** `still=1`: countdowns stop ticking, so uiautomator can read the screen (scripts/drive.mts). */
  still: false,
  setHold: (hold) => set({ hold }),
}));
/** Waits `ms`, or forever while the dev hold is on. */
export const devWait = (ms: number) => new Promise<void>((r) => { if (!useDevHold.getState().hold) setTimeout(r, ms); });
