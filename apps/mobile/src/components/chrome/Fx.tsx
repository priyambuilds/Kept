// FX layer (components.md › FX layer): full-screen, pointer-events none, z 50. Remount it (new `key`) on
// navigation so it replays on entry. Positions are the prototype's 390-wide frame, scaled to the screen.
// Reduce Motion: embers are skipped, value pills render in place.
import { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { color, duration, easing, fontFamily, gradient, metrics, shadow, z } from "@/theme";
import { Gradient, Icon, Text, useAnimationLifecycle } from "../primitives";
import type { IconName } from "../primitives";

/** The coin splash (burst + falling coins) was removed at the owner's request (D-78); embers remain. */
export type FxKind = "embers";
export interface FxPill { text: string; icon: IconName }

export function FxLayer({ kind, pills = [] }: { kind?: FxKind; pills?: FxPill[] }) {
  const reduce = useReducedMotion();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: z.fx }]}>
      {!reduce && kind === "embers" ? <Embers /> : null}
      {pills.slice(0, 3).map((p, i) => <ValuePill key={p.text} pill={p} index={i} still={reduce} />)}
    </View>
  );
}

/** Deterministic pseudo-random in [0,1) so a replay looks the same. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function useScale() {
  const { width, height } = useWindowDimensions();
  return { sx: width / metrics.frameWidth, width, height };
}


// ── embers ── 22 particles rising from the bottom; 2 of 3 orange with a glow, the rest grey.
function Embers() {
  const { width, height } = useScale();
  const list = useMemo(() => Array.from({ length: metrics.fx.embers }, (_, i) => ({
    x: rand(i, 5) * width, size: metrics.fx.emberSizes[i % 3]!, hot: i % 3 !== 2, ms: 3000 + rand(i, 6) * 2100, delay: rand(i, 7) * 2400,
  })), [width]);
  return <>{list.map((e, i) => <Ember key={i} {...e} height={height} />)}</>;
}

function Ember({ x, size, hot, ms, delay, height }: { x: number; size: number; hot: boolean; ms: number; delay: number; height: number }) {
  const p = useSharedValue(0);
  const onLayout = useAnimationLifecycle([p], () => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: easing("rise") }), -1, false));
  }, [ms, delay]);
  const a = useAnimatedStyle(() => ({ opacity: p.value < 0.15 ? p.value / 0.15 : 1 - p.value, transform: [{ translateY: -height * 0.7 * p.value }] }));
  const c = hot ? color.orange.base : color.text.tertiary;
  return <Animated.View onLayout={onLayout} style={[{ position: "absolute", left: x, top: height - 20, width: size, height: size, borderRadius: size / 2, backgroundColor: c }, hot ? { boxShadow: `0 0 8px ${c}` } : null, a]} />;
}

// ── pops ── up to 3 lime value pills drifting up (`kUp` 2.8 s) at fixed spots, rotated ±4°.
const PILL_SPOTS = [{ x: 34, y: 500, r: -4 }, { x: 206, y: 450, r: 4 }, { x: 120, y: 580, r: -4 }] as const;
export const PILL_DELAYS = [600, 1100, 1600] as const;

function ValuePill({ pill, index, still }: { pill: FxPill; index: number; still: boolean }) {
  const { sx } = useScale();
  const spot = PILL_SPOTS[index]!;
  const p = useSharedValue(still ? 0.5 : 0);
  const onLayout = useAnimationLifecycle([p], () => {
    if (still) return;
    p.value = withDelay(PILL_DELAYS[index]!, withTiming(1, { duration: duration.kUp, easing: easing("enter") }));
  }, [index, still]);
  const a = useAnimatedStyle(() => ({ opacity: still ? 1 : p.value < 0.2 ? p.value * 5 : p.value > 0.75 ? (1 - p.value) * 4 : 1, transform: [{ translateY: -metrics.fx.pill.rise * p.value }, { rotate: `${spot.r}deg` }] }));
  return (
    <Animated.View onLayout={onLayout} style={[{ position: "absolute", left: spot.x * sx, top: spot.y * sx }, a]}>
      <Gradient g={gradient("moneyPill")} style={{ height: metrics.fx.pill.h, paddingLeft: metrics.fx.pill.padL, paddingRight: metrics.fx.pill.padR, borderRadius: metrics.fx.pill.h / 2, flexDirection: "row", alignItems: "center", gap: metrics.fx.pill.gap, ...shadow("moneyPill") }}>
        <Icon name={pill.icon} size={metrics.fx.pill.icon} color={color.text.onLimeDeep} />
        <Text variant="chipMd" color={color.text.onLimeDeep} style={{ fontSize: 16, fontFamily: fontFamily("sans", 700) }}>{pill.text}</Text>
      </Gradient>
    </Animated.View>
  );
}
