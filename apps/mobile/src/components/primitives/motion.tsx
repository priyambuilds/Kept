// Motion building blocks (design/motion.md). Every one honours Reduce Motion: it renders the end state
// and starts no loop. Full screen choreography arrives in Phase 5; these cover component-level states.
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pressable } from "react-native";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from "react-native-reanimated";
import { duration, easing, metrics } from "@/theme";

export { useReducedMotion };

/** kPop: scale .4 → 1.08 (65 %) → 1, opacity 0 → 1. */
export function Pop({ children, delay = 0, ms = duration.pop, style }: { children: ReactNode; delay?: number; ms?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    p.value = withDelay(delay, withTiming(1, { duration: ms, easing: easing("spring") }));
  }, [reduce, delay, ms, p]);
  const a = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.6), transform: [{ scale: 0.4 + 0.6 * p.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** kInA: opacity 0→1, translateY 16→0, scale .98→1 over 500 ms `enter` (block i waits 40 + 65·i ms). */
export function Enter({ children, index = 0, delay, style }: { children: ReactNode; index?: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  const wait = delay ?? 40 + 65 * index;
  useEffect(() => {
    if (reduce) return;
    p.value = withDelay(wait, withTiming(1, { duration: duration.enter, easing: easing("enter") }));
  }, [reduce, wait, p]);
  const a = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: 16 * (1 - p.value) }, { scale: 0.98 + 0.02 * p.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

export type LoopKind = "beat" | "breath" | "float" | "spin" | "pulse";
/** Infinite ambient loops: beat (opacity 1→.4), breath (−4 dp), float (−9 dp), spin (360°), pulse (skeleton .5↔1). */
export function Loop({ kind, period, delay = 0, children, style }: { kind: LoopKind; period?: number; delay?: number; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0);
  const ms = period ?? { beat: duration.beat, breath: duration.breath, float: duration.float, spin: duration.spin, pulse: metrics.skeletonPulseMs }[kind];
  useEffect(() => {
    if (reduce) return;
    if (kind === "spin") {
      v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1, false));
    } else {
      const half = { duration: ms / 2, easing: Easing.inOut(Easing.ease) };
      v.value = withDelay(delay, withRepeat(withSequence(withTiming(1, half), withTiming(0, half)), -1, false));
    }
    return () => cancelAnimation(v);
  }, [reduce, kind, ms, delay, v]);
  const a = useAnimatedStyle(() => {
    switch (kind) {
      case "beat": return { opacity: 1 - 0.6 * v.value };
      case "pulse": return { opacity: 1 - 0.5 * v.value };
      case "breath": return { transform: [{ translateY: -4 * v.value }] };
      case "float": return { transform: [{ translateY: -9 * v.value }] };
      case "spin": return { transform: [{ rotate: `${360 * v.value}deg` }] };
    }
  });
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** countUp: 0 → target over 900 ms, ease-out cubic. Returns the number to show. */
export function useCountUp(target: number, ms = 900): number {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = Date.now();
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduce]);
  return reduce ? target : n;
}

/** Counts up the number inside a display string, keeping prefix/suffix ("+186", "1,186", "−1,000"). */
export function useCountUpText(text: string): string {
  const m = text.match(/^([^\d]*)([\d,]+)(.*)$/);
  const target = m ? parseInt(m[2]!.replace(/,/g, ""), 10) : 0;
  const n = useCountUp(target);
  if (!m || /:/.test(text)) return text;
  return m[1] + n.toLocaleString("en-US") + m[3];
}

export interface PressScaleProps extends Omit<PressableProps, "style" | "children"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed (.98 buttons, .92–.95 round icon buttons). */
  scale?: number;
  /** Layout height/width, used to pad the hit area up to 48 dp. */
  hit?: { w: number; h: number };
}

/** Pressable that scales down while pressed and never has a hit area under 48 dp. */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressScale({ children, style, scale = metrics.button.pressScale, hit, disabled, ...rest }: PressScaleProps) {
  const reduce = useReducedMotion();
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const min = metrics.minTouch;
  const slop = hit ? { top: Math.max(0, (min - hit.h) / 2), bottom: Math.max(0, (min - hit.h) / 2), left: Math.max(0, (min - hit.w) / 2), right: Math.max(0, (min - hit.w) / 2) } : undefined;
  // The style goes on the pressable itself: on an inner view, layout styles like `flex: 1` would size
  // the child while the Pressable (the row item) shrank to its content.
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...(slop ? { hitSlop: slop } : {})}
      onPressIn={() => { if (!reduce) s.set(withTiming(scale, { duration: metrics.press.inMs })); }}
      onPressOut={() => { s.set(withTiming(1, { duration: metrics.press.outMs })); }}
      {...rest}
      style={[style, a]}
    >
      {children}
    </AnimatedPressable>
  );
}
