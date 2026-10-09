// Transient UI driven from anywhere: the Keeper's note, FX bursts, the Dev menu.
import { create } from "zustand";
import type { KeeperMood } from "@/copy";
import type { FxKind, FxPill } from "@/components/chrome";

export interface KeeperNoteState { mood: KeeperMood; line: string; autoHide: boolean }

export interface UiState {
  keeperNote: KeeperNoteState | null;
  fx: { kind?: FxKind; pills: FxPill[]; id: number } | null;
  devMenu: boolean;
  showKeeperNote(n: KeeperNoteState): void;
  hideKeeperNote(): void;
  playFx(kind: FxKind | undefined, pills?: FxPill[]): void;
  clearFx(): void;
  setDevMenu(open: boolean): void;
}

export const useUi = create<UiState>()((set) => ({
  keeperNote: null, fx: null, devMenu: false,
  showKeeperNote: (keeperNote) => set({ keeperNote }),
  hideKeeperNote: () => set({ keeperNote: null }),
  playFx: (kind, pills = []) => set((s) => ({ fx: { ...(kind ? { kind } : {}), pills, id: (s.fx?.id ?? 0) + 1 } })),
  clearFx: () => set({ fx: null }),
  setDevMenu: (devMenu) => set({ devMenu }),
}));
