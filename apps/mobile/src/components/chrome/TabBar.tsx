// TabBar + PlusButton + the fade under them (components.md › TabBar + PlusButton).
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { t } from "@/copy";
import { color, duration, gradient, metrics, shadow, z } from "@/theme";
import { Gradient, Icon, PressScale, Text } from "../primitives";
import type { IconName } from "../primitives";

export type TabKey = "today" | "oaths" | "bounties" | "profile";
export const TABS: readonly { key: TabKey; icon: IconName }[] = [
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
  const a = useAnimatedStyle(() => ({ flex: withTiming(on ? m.activeFlex : 1, { duration: duration.flex }) }), [on]);
  const fg = on ? color.text.onLime : color.text.secondary;
  return (
    <Animated.View style={a}>
      <PressScale onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label}>
        <View style={{ height: m.item, borderRadius: m.itemRadius, backgroundColor: on ? color.text.primary : color.extra.transparent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: metrics.chip.gap }}>
          <Icon name={icon} size={m.icon} color={fg} />
          {on ? <Text variant="tab" color={fg} numberOfLines={1}>{label}</Text> : null}
        </View>
      </PressScale>
    </Animated.View>
  );
}

/** 64 round lime, ambient glow ring 0→9 dp at .14 every 2.6 s; pressed .95. Tap → `+` sheet. */
export function PlusButton({ onPress }: { onPress: () => void }) {
  const m = metrics.tabBar;
  const reduce = useReducedMotion();
  const g = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    g.value = withRepeat(withTiming(1, { duration: duration.glow }), -1, false);
    return () => cancelAnimation(g);
  }, [reduce, g]);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: 1 + (9 * 2 * g.value) / m.plus }], opacity: 0.14 * (1 - g.value) }));
  return (
    <PressScale onPress={onPress} scale={0.95} accessibilityLabel={t("additions.a11y.newMenu")}>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", width: m.plus, height: m.plus, borderRadius: m.plus / 2, backgroundColor: color.lime.base }, ring]} />
      <View style={{ width: m.plus, height: m.plus, borderRadius: m.plus / 2, backgroundColor: color.lime.base, alignItems: "center", justifyContent: "center", ...shadow("plus") }}>
        <Icon name="plus" size={m.plusIcon} color={color.text.onLime} />
      </View>
    </PressScale>
  );
}
