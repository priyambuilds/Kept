// FX layer (components.md › FX layer): full-screen, pointer-events none, z 50. Remount it (new `key`) on
// navigation so it replays on entry. Positions are the prototype's 390-wide frame, scaled to the screen.
// Reduce Motion: embers are skipped. The coin splash and the value pills were removed (D-78).
import { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { color, easing, metrics, z } from "@/theme";
import { useAnimationLifecycle } from "../primitives";

/** The coin splash and the floating value pills were removed at the owner's request (D-78); embers remain. */
export type FxKind = "embers";

export function FxLayer({ kind }: { kind?: FxKind }) {
  const reduce = useReducedMotion();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: z.fx }]}>
      {!reduce && kind === "embers" ? <Embers /> : null}
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

