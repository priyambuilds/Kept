// Dev menu settings (development builds only): per-slice API overrides on top of the app mode, the mock
// scenario, and the mock wallet in Live. Release builds ignore all of it: the mode alone decides.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SLICES } from "@/api/types";
import type { Slice, SliceMode } from "@/api/types";
import { DEFAULT_SCENARIO } from "@/api/mock/scenarios";
import type { Scenario } from "@/api/mock/scenarios";
import { useMode } from "./mode";
import type { AppMode } from "./mode";
import { persistStorage } from "./storage";

/** Demo is the mock for every slice; Live (and not chosen yet) is http for every slice. */
export function defaultFlags(mode: AppMode | null): Record<Slice, SliceMode> {
  return Object.fromEntries(SLICES.map((s) => [s, mode === "demo" ? "mock" : "http"])) as Record<Slice, SliceMode>;
}

export interface DevState {
  overrides: Partial<Record<Slice, SliceMode>>;
  scenario: Scenario;
  /** Mock wallet instead of MWA (for emulators without a wallet app). */
  mockWallet: boolean;
  setSlice(slice: Slice, mode: SliceMode | null): void;
  setAll(mode: SliceMode): void;
  setScenario(s: Scenario): void;
  setMockWallet(on: boolean): void;
}

export const useDev = create<DevState>()(persist((set) => ({
  overrides: {}, scenario: DEFAULT_SCENARIO, mockWallet: false,
  setSlice: (slice, mode) => set((s) => {
    const overrides = { ...s.overrides };
    if (mode) overrides[slice] = mode; else delete overrides[slice];
    return { overrides };
  }),
  setAll: (mode) => set({ overrides: Object.fromEntries(SLICES.map((sl) => [sl, mode])), mockWallet: mode === "mock" }),
  setScenario: (scenario) => set({ scenario }),
  setMockWallet: (mockWallet) => set({ mockWallet }),
}), { name: "kept.dev", storage: persistStorage }));

/** Effective mode per slice: the app mode's, with the Dev menu's overrides in development builds. */
export function flags(state: Pick<DevState, "overrides"> = useDev.getState(), mode: AppMode | null = useMode.getState().mode): Record<Slice, SliceMode> {
  return __DEV__ ? { ...defaultFlags(mode), ...state.overrides } : defaultFlags(mode);
}

/** The mock's scenario: the Dev menu's pick in development builds; release Demo is always the judges' account. */
export const mockScenario = (): Scenario => (__DEV__ ? useDev.getState().scenario : DEFAULT_SCENARIO);

/** The mock wallet stands in for MWA in Demo, and in Live only when a development build asks for it. */
export const mockWalletOn = (mode: AppMode | null = useMode.getState().mode): boolean => mode === "demo" || (__DEV__ && useDev.getState().mockWallet);

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
