// The create-Oath draft (C1–C6), kept across steps and restarts.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReviewMode } from "@/features/oaths/model";
import { persistStorage } from "./storage";

export interface OathDraft {
  goal: string;
  objectId: number;
  numDays: 3 | 7 | 14;
  isSolo: boolean;
  /** Whole SKR per member: 500 | 1000 | 2500. */
  stakeSkr: number;
  reviewMode: ReviewMode;
}

export const EMPTY_DRAFT: OathDraft = { goal: "", objectId: 0, numDays: 7, isSolo: false, stakeSkr: 1000, reviewMode: "ai_group" };

export const useDraft = create<{ draft: OathDraft; set(p: Partial<OathDraft>): void; reset(): void }>()(persist((set) => ({
  draft: EMPTY_DRAFT,
  set: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
  reset: () => set({ draft: EMPTY_DRAFT }),
}), { name: "kept.draft", storage: persistStorage }));
