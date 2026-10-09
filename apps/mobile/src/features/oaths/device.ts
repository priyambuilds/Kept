// Oath facts the backend can't store yet, kept on this device (BACKEND_GAPS P1-1, P1-7, P0-2):
// names, review mode and goal for Oaths created here, photo 1 progress, and which result screens and
// recaps were already shown (D-8, D-29).
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/state/storage";
import type { ReviewMode } from "./model";

export interface DeviceOathState {
  names: Record<string, string>;
  reviewModes: Record<string, ReviewMode>;
  goals: Record<string, string>;
  /** Invite codes for Oaths created here (the backend can look them up, but not list them). */
  codes: Record<string, string>;
  /** Oath id → day index on which photo 1 passed. */
  photo1: Record<string, number>;
  /** Oath id → failed photo-2 checks today: [dayIndex, count]. */
  fails: Record<string, [number, number]>;
  /** `${oathId}:${outcome}` keys of result screens already shown (D-29). */
  shownResults: string[];
  /** Local date ("2026-10-09") the daily recap was last shown (D-8). */
  recapShownOn: string | null;
  /** Oaths created or joined on this device, so they list even if an RPC index query misses them. */
  known: string[];
  remember(id: string, extra?: { name?: string; reviewMode?: ReviewMode; goal?: string; code?: string }): void;
  rename(id: string, name: string): void;
  passPhoto1(id: string, day: number): void;
  failPhoto2(id: string, day: number): number;
  markShown(key: string): void;
  markRecap(date: string): void;
}

export const useDeviceOaths = create<DeviceOathState>()(persist((set, get) => ({
  names: {}, reviewModes: {}, goals: {}, codes: {}, photo1: {}, fails: {}, shownResults: [], recapShownOn: null, known: [],
  remember: (id, extra = {}) => set((s) => ({
    known: s.known.includes(id) ? s.known : [...s.known, id],
    ...(extra.name ? { names: { ...s.names, [id]: extra.name } } : {}),
    ...(extra.reviewMode ? { reviewModes: { ...s.reviewModes, [id]: extra.reviewMode } } : {}),
    ...(extra.goal ? { goals: { ...s.goals, [id]: extra.goal } } : {}),
    ...(extra.code ? { codes: { ...s.codes, [id]: extra.code } } : {}),
  })),
  rename: (id, name) => set((s) => ({ names: { ...s.names, [id]: name } })),
  passPhoto1: (id, day) => set((s) => ({ photo1: { ...s.photo1, [id]: day } })),
  failPhoto2: (id, day) => {
    const prev = get().fails[id];
    const count = prev && prev[0] === day ? prev[1] + 1 : 1;
    set((s) => ({ fails: { ...s.fails, [id]: [day, count] } }));
    return count;
  },
  markShown: (key) => set((s) => ({ shownResults: s.shownResults.includes(key) ? s.shownResults : [...s.shownResults, key] })),
  markRecap: (date) => set({ recapShownOn: date }),
}), { name: "kept.oaths.device", storage: persistStorage }));
