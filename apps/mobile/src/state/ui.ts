// Transient UI driven from anywhere: FX bursts, the Dev menu. (The Keeper's note lives in its screen:
// components/keeper/ScreenKeeper.)
import { create } from "zustand";
import type { FxKind, FxPill } from "@/components/chrome";

export interface UiState {
  fx: { kind?: FxKind; pills: FxPill[]; id: number } | null;
  devMenu: boolean;
  playFx(kind: FxKind | undefined, pills?: FxPill[]): void;
  clearFx(): void;
  setDevMenu(open: boolean): void;
}

export const useUi = create<UiState>()((set) => ({
  fx: null, devMenu: false,
  playFx: (kind, pills = []) => set((s) => ({ fx: { ...(kind ? { kind } : {}), pills, id: (s.fx?.id ?? 0) + 1 } })),
  clearFx: () => set({ fx: null }),
  setDevMenu: (devMenu) => set({ devMenu }),
}));
