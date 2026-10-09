// The common screen frame (screens.md › Common layout): safe area, the DEVNET row under the system
// status bar, a NavBar (flows) or AppHeader (tabs) bar, a scroll column 20 from the edges with gap 14,
// and pinned actions 34 from the bottom.
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { env } from "@/config/env";
import { color, metrics } from "@/theme";
import { useUi } from "@/state/ui";
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
}

export function Screen({ bar, children, pinned, bottomInset = 0, scroll = true, bare }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const openDev = useUi((s) => s.setDevMenu);
  const m = metrics.screen;
  const devnet = env.cluster === "devnet";
  return (
    <View style={{ flex: 1, backgroundColor: color.bg.app, paddingTop: insets.top }}>
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
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: m.padX, paddingTop: bar ? m.contentTop : m.plainTop, gap: m.gap }}>{children}</View>
      )}
      {pinned ? <PinnedActions bottomInset={insets.bottom}>{pinned}</PinnedActions> : null}
    </View>
  );
}
