// Overlays mounted once above the navigator (docs/ARCHITECTURE.md §5): the Keeper's note, the FX
// layer and the offline watcher. ToastHost wraps the app in App.tsx.
import { useEffect, useRef } from "react";
import { onlineManager } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FxLayer } from "@/components/chrome";
import { KeeperNote } from "@/components/keeper/KeeperUI";
import { env } from "@/config/env";
import { metrics } from "@/theme";
import { useUi } from "@/state/ui";
import { navigateTo, navigationRef } from "./nav";
import { designIdOf } from "./routes";

export function KeeperNoteHost() {
  const note = useUi((s) => s.keeperNote);
  const hide = useUi((s) => s.hideKeeperNote);
  const insets = useSafeAreaInsets();
  if (!note) return null;
  const devnetRow = env.cluster === "devnet" ? metrics.statusBar.badgeRow : 0;
  // Drops from just under the bar: header bottom + 8 (components.md › KeeperNote).
  const top = insets.top + devnetRow + metrics.screen.barGap + metrics.header.height + metrics.screen.barGap;
  return <KeeperNote key={note.line} mood={note.mood} line={note.line} onClose={hide} top={top} {...(note.autoHide ? { autoHideMs: metrics.keeperNote.holdMs } : {})} />;
}

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
