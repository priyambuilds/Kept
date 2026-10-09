// Overlays mounted once above the navigator (docs/ARCHITECTURE.md §5): the FX layer and the offline
// watcher. (The Keeper's note lives in each Screen.) ToastHost wraps the app in App.tsx.
import { useEffect, useRef } from "react";
import { onlineManager } from "@tanstack/react-query";
import { FxLayer } from "@/components/chrome";
import { useUi } from "@/state/ui";
import { navigateTo, navigationRef } from "./nav";
import { designIdOf } from "./routes";

export function FxHost() {
  const fx = useUi((s) => s.fx);
  if (!fx) return null;
  return <FxLayer key={fx.id} {...(fx.kind ? { kind: fx.kind } : {})} pills={fx.pills} />;
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
