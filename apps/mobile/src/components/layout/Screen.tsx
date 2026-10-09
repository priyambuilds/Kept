// The common screen frame (screens.md › Common layout): safe area, the DEVNET row under the system
// status bar, a NavBar (flows) or AppHeader (tabs) bar, a scroll column 20 from the edges with gap 14,
// and pinned actions 34 from the bottom.
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { env } from "@/config/env";
import { color, metrics } from "@/theme";
import { useUi } from "@/state/ui";
import { useContext } from "react";
import { NavigationRouteContext } from "@react-navigation/native";
import { layoutOf } from "@/app/layout";
import { designIdOf } from "@/app/routes";
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
}


/** The route's design id, or none outside a navigator (tests, the Gallery). */
function useDesignId(): string | undefined {
  const route = useContext(NavigationRouteContext);
  return route ? designIdOf(route.name) : undefined;
}

export function Screen({ bar, children, pinned, bottomInset = 0, scroll = true, bare, layout }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const routeId = useDesignId();
  const l = layoutOf(layout ?? routeId);
  const top = l?.top ? <Spacer h={l.top} /> : null;
  const openDev = useUi((s) => s.setDevMenu);
  const m = metrics.screen;
  const devnet = env.cluster === "devnet";
  return (
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
        <ScrollView style={pinned ? { marginBottom: insets.bottom + bottomInset + m.gap } : undefined} keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: m.padX, paddingTop: bar ? m.contentTop : m.plainTop, paddingBottom: pinned ? m.contentBottom : insets.bottom + bottomInset + m.gap, gap: m.gap }}>
          {top}
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: m.padX, paddingTop: bar ? m.contentTop : m.plainTop, gap: m.gap }}>{top}{children}</View>
      )}
      {pinned ? <PinnedActions bottomInset={insets.bottom}>{pinned}</PinnedActions> : null}
    </View>
  );
}
