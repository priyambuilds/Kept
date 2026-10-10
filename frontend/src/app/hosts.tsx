// Overlays mounted once above the navigator (docs/ARCHITECTURE.md §5): the FX layer and the offline
// watcher. (The Keeper's note lives in each Screen.) ToastHost wraps the app in App.tsx.
import { useEffect, useRef } from "react";
import { onlineManager } from "@tanstack/react-query";
import { queryClient } from "@/api/queries";
import { isApiError } from "@/api/errors";
import { FxLayer } from "@/components/chrome";
import { haptic } from "@/lib/haptics";
import { useUi } from "@/state/ui";
import { navigateTo, navigationRef } from "./nav";
import { designIdOf } from "./routes";

export function FxHost() {
  const fx = useUi((s) => s.fx);
  const id = fx?.id;
  // FX belong to the screen that played them: leaving it (navigation, back, a tab change) clears the
  // layer, so falling coins and embers never loop on the next screen.
  useEffect(() => navigationRef.addListener("state", () => {
      const cur = useUi.getState().fx;
      if (cur?.route && navigationRef.getCurrentRoute()?.key !== cur.route) useUi.getState().clearFx();
  }), []);
  // One haptic sequence per moment, plus impactLight per value pill as it rises.
  useEffect(() => {
    const cur = useUi.getState().fx;
    if (!cur || cur.id !== id) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) => { timers.push(setTimeout(f, ms)); };
    if (cur.feel === "kept") haptic.success();
    else if (cur.feel === "payout") at(200, haptic.success);
    else if (cur.feel === "broken") haptic.broken();
    else if (cur.feel === "comeback") haptic.comeback();
    return () => timers.forEach(clearTimeout);
  }, [id]);
  if (!fx) return null;
  return <FxLayer key={fx.id} {...(fx.kind ? { kind: fx.kind } : {})} />;
}

/** M2: when a call fails for lack of network, show "You're offline." once per outage. */
export function OfflineHost() {
  const shown = useRef(false);
  useEffect(() => onlineManager.subscribe((online) => {
    if (online) { shown.current = false; return; }
    const current = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
    if (shown.current || (current && designIdOf(current) === "M2")) return;
    shown.current = true;
    navigateTo("M2");
  }), []);
  return null;
}

/** Failures a screen can be stuck on with nothing to show; OFFLINE goes through OfflineHost instead. */
const STUCK = new Set(["SERVER", "RATE_LIMITED", "NOT_FOUND"]);

/**
 * A screen whose data never loaded (server error, rate limit, gone) would sit on its skeleton forever.
 * When such a load fails for good (after its retries) while a screen is showing it, open M2 with the
 * "load" copy and its Retry (D-89). Once per screen, so a polling query doesn't reopen it.
 */
export function LoadFailHost() {
  const openedFor = useRef(new Set<string>());
  useEffect(() => queryClient.getQueryCache().subscribe((ev) => {
    if (ev.type !== "updated" || ev.action.type !== "error") return;
    const q = ev.query;
    if (q.state.data !== undefined || q.getObserversCount() === 0) return;
    const e = ev.action.error;
    if (!isApiError(e) || !STUCK.has(e.code)) return;
    const current = navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined;
    if (!current || designIdOf(current.name) === "M2" || openedFor.current.has(current.key)) return;
    openedFor.current.add(current.key);
    navigateTo("M2", { cause: "load" });
  }), []);
  return null;
}
