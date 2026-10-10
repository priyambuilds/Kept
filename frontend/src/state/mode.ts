// The app mode, picked at first launch (A1 → A1·m): Demo runs on the mock backend, wallet and chain with
// no network; Live is the real wallet, backend and program. Not chosen yet = null. Persisted outside the
// mode scopes; the scoped stores (state/storage.ts) follow it.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage, setStorageScope } from "./storage";

export type AppMode = "demo" | "live";

export const useMode = create<{ mode: AppMode | null }>()(persist(() => ({ mode: null as AppMode | null }), {
  name: "kept.mode",
  storage: persistStorage,
  // Scoped stores wait for this, so it runs even when nothing was saved or reading failed.
  onRehydrateStorage: () => (s) => setStorageScope(s?.mode ?? "none"),
}));

export const appMode = (): AppMode | null => useMode.getState().mode;
export const isDemo = (): boolean => appMode() === "demo";
export const useIsDemo = (): boolean => useMode((s) => s.mode === "demo");
