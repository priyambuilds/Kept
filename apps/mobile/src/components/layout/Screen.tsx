// The common screen frame (screens.md › Common layout): safe area, the DEVNET row under the system
// status bar, a NavBar (flows) or AppHeader (tabs) bar, a scroll column 20 from the edges with gap 14,
// and pinned actions 34 from the bottom. Each screen hosts its own Keeper (ScreenKeeper): the note drops
// under the bar and closes when the screen loses focus, so it can never leak onto another screen.
import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardHeight } from "@/lib/keyboard";
import { env } from "@/config/env";
import { color, metrics } from "@/theme";
import { useUi } from "@/state/ui";
import { useContext } from "react";
import { NavigationContext, NavigationRouteContext } from "@react-navigation/native";
import { layoutOf } from "@/app/layout";
import { designIdOf, presentation } from "@/app/routes";
import type { KeeperLine } from "@/copy";
import { isNoteOnlyKeeper, useKeeperHost } from "../keeper/ScreenKeeper";
import { Enter, flattenBlocks } from "../primitives";
import { Ambient } from "../chrome/Ambient";
import { Spacer } from "../content/Basics";
import { DevnetBadge } from "../chrome/Header";
import { PinnedActions } from "../actions";

export interface ScreenProps {
  /** NavBar or AppHeader element; omitted for Plain layouts (A0, A1). */
  bar?: ReactNode;
  children?: ReactNode;
  /** Buttons pinned to the bottom (PinnedActions). */
  pinned?: ReactNode;
  /** Bottom space the content must leave for pinned actions or the tab bar. */
  bottomInset?: number;
  scroll?: boolean;
  /** Content fills the screen (no scroll column), e.g. the splash. */
  bare?: boolean;
  /**
   * The design id whose ambient light and hero offset to use (app/layout.gen.json). Defaults to the
   * route; set it where one route shows several designed states (Today B1–B4, D2 / D2·low / D3).
   */
  layout?: string;
  /** Tab screens: the tab's idle line, opened from the mark when the screen has no line of its own. */
  keeperIdle?: KeeperLine;
}


const PINNED_ENTER = 200;

/** A counter that bumps each time the screen regains focus (after the first), when `on`. */
function useFocusReplay(on: boolean): number {
  const nav = useContext(NavigationContext);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on || !nav) return;
    let first = true;
    return nav.addListener("focus", () => { if (first) { first = false; return; } setN((x) => x + 1); });
  }, [on, nav]);
  return n;
}

/** The route's design id, or none outside a navigator (tests, the Gallery). */
function useDesignId(): string | undefined {
  const route = useContext(NavigationRouteContext);
  return route ? designIdOf(route.name) : undefined;
}

export function Screen({ bar, children, pinned, bottomInset = 0, scroll = true, bare, layout, keeperIdle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  // Pinned actions ride above the keyboard (E1 "Find Oath", C1/K1 "Next"); the scroll column follows.
  const kb = useKeyboardHeight();
  const bottom = Math.max(insets.bottom, kb);
  const routeId = useDesignId();
  const l = layoutOf(layout ?? routeId);
  const top = l?.top ? <Spacer h={l.top} /> : null;
  const openDev = useUi((s) => s.setDevMenu);
  const m = metrics.screen;
  const devnet = env.cluster === "devnet";
  const kind = routeId && presentation(routeId) === "tab" ? "tab" : "flow";
  const keeper = useKeeperHost(routeId, kind, keeperIdle ?? null);
  // The note drops from just under the bar (components.md › KeeperNote: top 106 header / 104 nav, bar at 56).
  const k = metrics.keeperNote;
  // motion.md › Screen-level choreography: block i enters at 40 + 65·i ms (a Keeper that moved into the
  // mark takes no slot); pinned actions at 200 ms. Tab screens stay mounted, so they replay on focus.
  const replay = useFocusReplay(kind === "tab");
  const all = flattenBlocks(children);
  const blocks = all.filter((c) => !isNoteOnlyKeeper(c, kind));
  // A Keeper that moved into the mark still mounts (it registers its line) but takes no slot or gap.
  const noteOnly = all.filter((c) => isNoteOnlyKeeper(c, kind));
  const entered = blocks.map((c, i) => <Enter key={c.key ?? `b${i}`} index={i} replay={replay}>{c}</Enter>);
  const pinnedBlocks = pinned ? flattenBlocks(pinned).map((c, i) => <Enter key={c.key ?? `p${i}`} delay={PINNED_ENTER + 65 * i} replay={replay}>{c}</Enter>) : null;
  const noteTop = insets.top + (devnet ? metrics.statusBar.badgeRow : 0) + m.barGap + (kind === "tab" ? k.topHeader : k.topNav) - metrics.header.top;
  return (
    <keeper.Provider value={keeper.value}>
    <View style={{ flex: 1, backgroundColor: color.bg.app, paddingTop: insets.top }}>
      {l ? <Ambient tone={l.tone} ambient={l.ambient} beam={l.beam} decor={l.decor} /> : null}
      {devnet ? (
        <View style={{ height: metrics.statusBar.badgeRow, paddingHorizontal: m.padX, justifyContent: "center" }}>
          <DevnetBadge {...(__DEV__ ? { onLongPress: () => openDev(true) } : {})} />
        </View>
      ) : null}
      {bar ? <View style={{ paddingHorizontal: m.padX, marginTop: m.barGap }}>{bar}</View> : null}
      {bare ? <View style={{ flex: 1 }}>{children}</View> : scroll ? (
        // With pinned actions the column ends 14 above them, like the prototype, so content is clipped
        // there instead of scrolling behind (and showing between) the buttons.
        <ScrollView style={pinned ? { marginBottom: bottom + bottomInset + m.gap } : undefined} keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: m.padX, paddingTop: bar ? m.contentTop : m.plainTop, paddingBottom: pinned ? m.contentBottom : insets.bottom + bottomInset + m.gap, gap: m.gap }}>
          {top}
          {entered}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: m.padX, paddingTop: bar ? m.contentTop : m.plainTop, gap: m.gap }}>{top}{blocks.map((c, i) => <Fragment key={c.key ?? `b${i}`}>{c}</Fragment>)}</View>
      )}
      {pinned ? <PinnedActions bottomInset={kb ? kb - metrics.pinned.bottom + m.gap : insets.bottom}>{pinnedBlocks}</PinnedActions> : null}
      {bare ? null : noteOnly.map((c, i) => <Fragment key={c.key ?? `k${i}`}>{c}</Fragment>)}
      {keeper.note ? <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: noteTop, zIndex: 45 }}>{keeper.note}</View> : null}
    </View>
    </keeper.Provider>
  );
}
