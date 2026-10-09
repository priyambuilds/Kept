// Transient UI driven from anywhere: FX bursts, the Dev menu. (The Keeper's note lives in its screen:
// components/keeper/ScreenKeeper.)
import { create } from "zustand";
import type { FxKind, FxPill } from "@/components/chrome";

/**
 * The haptic of an FX moment (motion.md §5–8): kept = success at 0 (F5), payout = success at 200,
 * broken = error then heavy, comeback = success then medium (L6). Defaults from the kind.
 */
export type FxFeel = "kept" | "payout" | "broken" | "comeback" | "none";

export interface UiState {
  fx: { kind?: FxKind; pills: FxPill[]; feel: FxFeel; id: number } | null;
  devMenu: boolean;
  playFx(kind: FxKind | undefined, pills?: FxPill[], feel?: FxFeel): void;
  clearFx(): void;
  setDevMenu(open: boolean): void;
}

export const useUi = create<UiState>()((set) => ({
  fx: null, devMenu: false,
  playFx: (kind, pills = [], feel) => set((s) => ({
    fx: { ...(kind ? { kind } : {}), pills, feel: feel ?? (kind === "coins" ? "payout" : kind === "embers" ? "broken" : "none"), id: (s.fx?.id ?? 0) + 1 },
  })),
  clearFx: () => set({ fx: null }),
  setDevMenu: (devMenu) => set({ devMenu }),
}));
