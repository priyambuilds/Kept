// Storage for zustand `persist`. Values are JSON; bigint is never stored.
// Demo and Live keep separate data (session, settings, drafts, device Oath facts): every store made with
// `scopedPersist` lives under `kept.<scope>.<name>`, where the scope is the app mode (state/mode.ts).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";
import type { PersistOptions } from "zustand/middleware";

/** Unscoped: the mode itself and the Dev menu. */
export const persistStorage = createJSONStorage(() => AsyncStorage);

export type StorageScope = "demo" | "live" | "none";
let scope: StorageScope = "none";
let markReady: () => void = () => {};
/** Scoped reads and writes wait until the mode has loaded, so nothing lands under the wrong scope. */
const ready = new Promise<void>((r) => { markReady = r; });

export function setStorageScope(s: StorageScope): void { scope = s; markReady(); }
export const storageScope = (): StorageScope => scope;
/** `kept.session` → `kept.demo.session`. */
export const scopedKey = (name: string, s: StorageScope = scope): string => name.replace(/^kept\./, `kept.${s}.`);

const scopedAsync = {
  getItem: async (name: string) => { await ready; return AsyncStorage.getItem(scopedKey(name)); },
  setItem: async (name: string, value: string) => { await ready; await AsyncStorage.setItem(scopedKey(name), value); },
  removeItem: async (name: string) => { await ready; await AsyncStorage.removeItem(scopedKey(name)); },
};
const scopedStorage = createJSONStorage(() => scopedAsync);

interface Rehydratable { persist: { rehydrate(): Promise<void> | void } }
const scopedStores: Rehydratable[] = [];

/**
 * Persist options for a store whose data belongs to one mode. `initial` is the store's data with nothing
 * saved: loading another scope starts from it, so nothing carries over from the previous mode.
 */
export function scopedPersist<S>(name: string, initial: Partial<S>): PersistOptions<S, S> {
  return {
    name,
    storage: scopedStorage as PersistOptions<S, S>["storage"],
    merge: (saved, current) => ({ ...current, ...initial, ...(saved as Partial<S> | undefined) }),
  };
}
/** Stores made with `scopedPersist` register here so a mode change can reload them all. */
export function registerScoped(store: Rehydratable): void { scopedStores.push(store); }
export async function rehydrateScoped(): Promise<void> { await Promise.all(scopedStores.map((s) => s.persist.rehydrate())); }

/** Removes everything saved under a scope (leaving Demo wipes it). */
export async function clearScope(s: StorageScope): Promise<void> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`kept.${s}.`));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}
