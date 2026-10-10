// TabBar + PlusButton + the fade under them (components.md › TabBar + PlusButton).

import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { t } from "@/copy";
import { color, duration, gradient, metrics, shadow, z } from "@/theme";
import { Gradient, Icon, PressScale, Text, useAnimationLifecycle } from "../primitives";
import type { IconName } from "../primitives";

export type TabKey = "today" | "oaths" | "bounties" | "profile";
const TABS: readonly { key: TabKey; icon: IconName }[] = [
  { key: "today", icon: "white-balance-sunny" },
  { key: "oaths", icon: "cards-outline" },
  { key: "bounties", icon: "trophy-outline" },
  { key: "profile", icon: "account-circle-outline" },
];

export function TabBar({ active, onTab, onPlus, bottomInset = 0 }: { active: TabKey; onTab: (k: TabKey) => void; onPlus: () => void; bottomInset?: number }) {
  const m = metrics.tabBar;
  return (
    <>
      <Gradient g={gradient("tabFade")} pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: m.fade + bottomInset, zIndex: z.tabFade }} />
      <View accessibilityRole="tablist" style={{ position: "absolute", left: m.left, right: m.right, bottom: m.bottom + bottomInset, height: m.height, borderRadius: m.radius, backgroundColor: color.surface[1], padding: m.pad, gap: m.gap, flexDirection: "row", zIndex: z.tabBar, ...shadow("tabBar") }}>
        {TABS.map((tab) => <TabItem key={tab.key} icon={tab.icon} label={t(`common.tabs.${tab.key}`)} on={tab.key === active} onPress={() => onTab(tab.key)} />)}
      </View>
      <View style={{ position: "absolute", right: m.left, bottom: m.bottom + bottomInset, zIndex: z.tabBar }}>
        <PlusButton onPress={onPlus} />
      </View>
    </>
  );
}

function TabItem({ icon, label, on, onPress }: { icon: IconName; label: string; on: boolean; onPress: () => void }) {
  const m = metrics.tabBar;
  const reduce = useReducedMotion();
  // flex 1 ↔ 1.7 over 200 ms and the label fades in (motion.md › Tab change).
  const p = useSharedValue(on ? 1 : 0);
  const onLayout = useAnimationLifecycle([p], () => {
    p.value = reduce ? (on ? 1 : 0) : withTiming(on ? 1 : 0, { duration: duration.flex });
  }, [on, reduce]);
  const grow = useAnimatedStyle(() => ({ flex: 1 + (m.activeFlex - 1) * p.value }));
  const fill = useAnimatedStyle(() => ({ opacity: p.value }));
  const labelFade = useAnimatedStyle(() => ({ opacity: p.value }));
  const fg = on ? color.text.onLime : color.text.secondary;
  return (
    <Animated.View onLayout={onLayout} style={grow}>
      <PressScale onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label} style={{ flex: 1 }}>
        <View style={{ height: m.item, borderRadius: m.itemRadius, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: m.labelGap, overflow: "hidden" }}>
          <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: m.itemRadius, backgroundColor: color.text.primary }, fill]} />
          <Icon name={icon} size={m.icon} color={fg} />
          {/* The label mounts with the active state and fades in with the pill: it reads the tab's own value,
              so a label that mounts late starts where the pill already is instead of missing its fade. */}
          {on ? <Animated.View style={labelFade}><Text variant="tab" color={fg} numberOfLines={1}>{label}</Text></Animated.View> : null}
        </View>
      </PressScale>
    </Animated.View>
  );
}

/** 64 round lime, ambient glow ring 0→9 dp at .14 every 2.6 s; pressed .95. Tap → `+` sheet. */
function PlusButton({ onPress }: { onPress: () => void }) {
  const m = metrics.tabBar;
  const reduce = useReducedMotion();
  const g = useSharedValue(0);
  const onLayout = useAnimationLifecycle([g], () => {
    if (reduce) return;
    g.value = withRepeat(withTiming(1, { duration: duration.glow, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [reduce], { pauseOnBlur: true });
  // kGlow: box-shadow 0 0 0 0 → 0 0 0 9px rgba(lime,.14) at 50 % → 0: a ring growing out and back.
  const ring = useAnimatedStyle(() => { const k = 1 - Math.abs(2 * g.value - 1); return { transform: [{ scale: 1 + (9 * 2 * k) / m.plus }], opacity: 0.14 * k }; });
  return (
    <PressScale onPress={onPress} scale={0.95} accessibilityLabel={t("additions.a11y.newMenu")}>
      <Animated.View onLayout={onLayout} pointerEvents="none" style={[{ position: "absolute", width: m.plus, height: m.plus, borderRadius: m.plus / 2, backgroundColor: color.lime.base }, ring]} />
      <View style={{ width: m.plus, height: m.plus, borderRadius: m.plus / 2, backgroundColor: color.lime.base, alignItems: "center", justifyContent: "center", ...shadow("plus") }}>
        <Icon name="plus" size={m.plusIcon} color={color.text.onLime} />
      </View>
    </PressScale>
  );
}
