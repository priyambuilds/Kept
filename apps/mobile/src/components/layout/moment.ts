// Moments (L1–L6, F5, C7·ok, …) have no back until they settle (flows.md). D-74: settled is where the
// screen's own choreography ends: the last content block and the last pinned action have entered, and
// the money count-up has landed. With Reduce Motion nothing animates, so back works at once.
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { duration } from "@/theme";
import { COUNT_UP_MS, enterDelay } from "../primitives/motion";
import { useScreenFocused } from "@/lib/focus";

/** Pinned actions enter 200 ms in, 65 ms apart (motion.md › Screen-level choreography). */
export const PINNED_ENTER = 200;
export const pinnedDelay = (i: number) => PINNED_ENTER + 65 * i;

/** When a moment with `blocks` content blocks and `pinned` pinned actions has settled, in ms from entry. */
export function momentSettleMs(blocks: number, pinned: number): number {
  const lastBlock = blocks > 0 ? enterDelay(blocks - 1) + duration.enter : 0;
  const lastPinned = pinned > 0 ? pinnedDelay(pinned - 1) + duration.enter : 0;
  return Math.max(lastBlock, lastPinned, COUNT_UP_MS);
}

/** While `on` and the screen is focused, hardware back does nothing for `ms`; after that it works as usual. */
export function useBackBlockedFor(ms: number, on: boolean): void {
  const focused = useScreenFocused();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!on || !focused || reduce) return;
    let settled = false;
    const id = setTimeout(() => { settled = true; }, ms);
    const sub = BackHandler.addEventListener("hardwareBackPress", () => !settled);
    return () => { clearTimeout(id); sub.remove(); };
  }, [ms, on, focused, reduce]);
}
