// "Now" for screens: the virtual clock in mock mode (it equals real time unless the Dev menu moved it),
// re-rendering every `everyMs` so countdowns tick.
import { useEffect, useState } from "react";
import { clock } from "@/lib/clock";
import { useDevHold } from "@/state/dev";
import { useScreenFocused } from "@/lib/focus";

export const nowSeconds = () => Math.floor(clock.now() / 1000);

export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(nowSeconds);
  // Tabs and covered screens stay mounted: their clocks stop until they're focused again (audit L-2).
  const focused = useScreenFocused();
  useEffect(() => {
    if (!focused) return;
    const tick = () => setNow(nowSeconds());
    // Catch up at once on refocus (setState in a timer, not in the effect body).
    const first = setTimeout(tick, 0);
    // The dev deep link's `still=1` (scripts/drive.mts) stops the tick: uiautomator never sees a
    // per-second countdown as idle.
    const id = setInterval(() => { if (!useDevHold.getState().still) tick(); }, everyMs);
    const unsub = clock.subscribe(tick);
    return () => { clearTimeout(first); clearInterval(id); unsub(); };
  }, [everyMs, focused]);
  return now;
}

