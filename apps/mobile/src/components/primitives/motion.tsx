// Motion building blocks (design/motion.md), all on the UI thread with Reanimated. Every one honours
// Reduce Motion: it renders the end state and starts no loop.
// - keyframes: Pop (kPop), Enter (kInA), FadeIn (kIn), Bubble (kBub / kBubR), NoteDrop (kDrop),
//   Knock (kKnock), Shake (proof fail), Loop (beat, breath, float, spin, pulse, ping, glow)
// - CountText: the 900 ms ease-out-cubic count-up as a leaf Text, so only the number re-renders
// - PressScale: pressed scale with a 48 dp hit area
import { Children, Fragment, isValidElement, useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Pressable } from "react-native";
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from "react-native";
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from "react-native-reanimated";
import { duration, easing, metrics } from "@/theme";
import type { EasingName } from "@/theme";
import { groupDigits } from "@/lib/format";
import { Text } from "./Text";
import type { TextProps } from "./Text";

export { useReducedMotion };

const inOut = Easing.inOut(Easing.ease);

/** kPop: scale .4 → 1.08 (65 %) → 1, opacity 0 → 1 (65 %). `ease`: spring (default) or springHard. */
export function Pop({ children, delay = 0, ms = duration.pop, ease = "spring", style }: { children: ReactNode; delay?: number; ms?: number; ease?: EasingName; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    // Two segments like the CSS keyframes, each with the token's curve.
    const e = easing(ease);
    p.value = withDelay(delay, withSequence(withTiming(0.65, { duration: ms * 0.65, easing: e }), withTiming(1, { duration: ms * 0.35, easing: e })));
  }, [reduce, delay, ms, ease, p]);
  const a = useAnimatedStyle(() => {
    const v = p.value;
    const scale = v <= 0.65 ? 0.4 + (0.68 * v) / 0.65 : 1.08 - (0.08 * (v - 0.65)) / 0.35;
    return { opacity: Math.min(1, v / 0.65), transform: [{ scale }] };
  });
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** kInA: opacity 0 → 1, translateY 16 → 0, scale .98 → 1 over 500 ms `enter` (block i waits 40 + 65·i ms). */
export function Enter({ children, index = 0, delay, replay = 0, style }: { children: ReactNode; index?: number; delay?: number; replay?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  const wait = delay ?? enterDelay(index);
  useEffect(() => {
    if (reduce) return;
    p.value = 0;
    p.value = withDelay(wait, withTiming(1, { duration: duration.enter, easing: easing("enter") }));
  }, [reduce, wait, p, replay]);
  const a = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: 16 * (1 - p.value) }, { scale: 0.98 + 0.02 * p.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}
/** motion.md › Screen-level choreography: block i enters at 40 + 65·i ms. */
export const enterDelay = (i: number) => 40 + 65 * i;

/** kIn: opacity 0 → 1, translateY 10 → 0 (250–400 ms ease-out). */
export function FadeIn({ children, delay = 0, ms = 300, style }: { children: ReactNode; delay?: number; ms?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    p.value = withDelay(delay, withTiming(1, { duration: ms, easing: Easing.out(Easing.ease) }));
  }, [reduce, delay, ms, p]);
  const a = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: 10 * (1 - p.value) }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** kBub (scale .6 + translateY 8 → none) or kBubR (scale .6 rotate −6° → rotate 4°); springHard. */
export function Bubble({ children, delay = 0, ms = duration.bubble, tilted, style }: { children: ReactNode; delay?: number; ms?: number; tilted?: boolean; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    p.value = withDelay(delay, withTiming(1, { duration: ms, easing: easing("springHard") }));
  }, [reduce, delay, ms, p]);
  const a = useAnimatedStyle(() => {
    const v = p.value;
    return tilted
      ? { opacity: Math.min(1, v), transform: [{ scale: 0.6 + 0.4 * v }, { rotate: `${-6 + 10 * v}deg` }] }
      : { opacity: Math.min(1, v), transform: [{ translateY: 8 * (1 - v) }, { scale: 0.6 + 0.4 * v }] };
  });
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** kDrop (the KeeperNote): translateY −16, scale .72, opacity 0 → none, 420 ms springSoft from `origin`. */
export function NoteDrop({ children, origin, style }: { children: ReactNode; origin: string; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    p.value = withTiming(1, { duration: duration.note, easing: easing("springSoft") });
  }, [reduce, p]);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, p.value),
    transform: [{ translateY: -16 * (1 - p.value) }, { scale: 0.72 + 0.28 * p.value }],
  }));
  return <Animated.View style={[{ transformOrigin: origin }, style, a]}>{children}</Animated.View>;
}

/**
 * kKnock: rotate 0 → −14° (6 %) → 11° (12 %) → −6° (18 %) → 0 (24 %, hold), 2.6 s ease-in-out,
 * ×3 after .8 s, around 50 % 90 % (the KeeperMark with an unread line).
 */
export function Knock({ active, children, style }: { active: boolean; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const r = useSharedValue(0);
  useEffect(() => {
    if (!active || reduce) { cancelAnimation(r); r.value = 0; return; }
    const seg = (duration.glow * 0.06);
    const t = (to: number) => withTiming(to, { duration: seg, easing: inOut });
    const once = withSequence(t(-14), t(11), t(-6), t(0), withTiming(0, { duration: duration.glow - 4 * seg }));
    r.value = withDelay(800, withRepeat(once, 3, false));
    return () => cancelAnimation(r);
  }, [active, reduce, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[{ transformOrigin: "50% 90%" }, style, a]}>{children}</Animated.View>;
}

/** Proof fail: translateX 0 → −6 → 6 → −3 → 0 over 300 ms, each time `trigger` changes (not on mount at 0). */
export function Shake({ trigger, children, style }: { trigger: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const x = useSharedValue(0);
  useEffect(() => {
    if (!trigger || reduce) return;
    const t = (to: number) => withTiming(to, { duration: 75 });
    x.value = withSequence(t(-6), t(6), t(-3), t(0));
  }, [trigger, reduce, x]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

export type LoopKind = "beat" | "breath" | "float" | "spin" | "pulse" | "ping" | "glow";
/**
 * Infinite ambient loops: beat (opacity 1 → .4), breath (−4 dp), float (−9 dp), spin (360°), pulse
 * (skeleton .5 ↔ 1), ping (scale 1 → 1.7, opacity .7 → 0), glow (scale out, fading).
 */
export function Loop({ kind, period, delay = 0, children, style, paused }: { kind: LoopKind; period?: number; delay?: number; children?: ReactNode; style?: StyleProp<ViewStyle>; paused?: boolean }) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0);
  const ms = period ?? { beat: duration.beat, breath: duration.breath, float: duration.float, spin: duration.spin, pulse: metrics.skeletonPulseMs, ping: duration.ping, glow: duration.glow }[kind];
  useEffect(() => {
    if (reduce || paused) { cancelAnimation(v); return; }
    if (kind === "spin") {
      v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1, false));
    } else if (kind === "ping") {
      v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.out(Easing.ease) }), -1, false));
    } else {
      const half = { duration: ms / 2, easing: inOut };
      v.value = withDelay(delay, withRepeat(withSequence(withTiming(1, half), withTiming(0, half)), -1, false));
    }
    return () => cancelAnimation(v);
  }, [reduce, paused, kind, ms, delay, v]);
  const a = useAnimatedStyle(() => {
    switch (kind) {
      case "beat": return { opacity: 1 - 0.6 * v.value };
      case "pulse": return { opacity: 1 - 0.5 * v.value };
      case "breath": return { transform: [{ translateY: -4 * v.value }] };
      case "float": return { transform: [{ translateY: -9 * v.value }] };
      case "spin": return { transform: [{ rotate: `${360 * v.value}deg` }] };
      case "ping": return { opacity: 0.7 * (1 - v.value), transform: [{ scale: 1 + 0.7 * v.value }] };
      case "glow": return { opacity: 0.14 * (1 - Math.abs(2 * v.value - 1)), transform: [{ scale: 1 + 0.28 * v.value }] };
    }
  });
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** countUp: from → target over 900 ms, ease-out cubic `1 − (1 − t)³`. Returns the number to show. */
export function useCountUp(target: number, ms = 900, from = 0, delay = 0): number {
  const reduce = useReducedMotion();
  const [n, setN] = useState(from);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now + delay;
      const p = Math.max(0, Math.min(1, (now - start) / ms));
      setN(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, from, delay, reduce]);
  return reduce ? target : n;
}

/** A view that eases to a rotation (option select: ±2° over 250 ms `spring`). Carries its own style. */
export function Tilt({ deg, children, style, ms = duration.optionTilt, ease = "spring" }: { deg: number; children?: ReactNode; style?: StyleProp<ViewStyle>; ms?: number; ease?: EasingName }) {
  const reduce = useReducedMotion();
  const r = useSharedValue(deg);
  useEffect(() => { r.value = reduce ? deg : withTiming(deg, { duration: ms, easing: easing(ease) }); }, [deg, reduce, ms, ease, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Counts up the number inside a display string, keeping prefix/suffix ("+186", "1,186", "−1,000"). */
export function useCountUpText(text: string, from?: string): string {
  const m = text.match(/^([^\d]*)([\d,]+)(.*)$/);
  const target = m ? parseInt(m[2]!.replace(/,/g, ""), 10) : 0;
  const start = from ? parseInt(from.replace(/[^\d]/g, "") || "0", 10) : 0;
  const n = useCountUp(target, 900, start);
  if (!m || /:/.test(text)) return text;
  return m[1] + groupDigits(String(n)) + m[3];
}

/**
 * A count-up as a leaf Text: only this node re-renders while the number runs (the HP panel, money
 * moments and rings no longer re-render their whole block 60 times a second).
 */
export function CountText({ text, from, ...rest }: { text: string; from?: string } & Omit<TextProps, "children">) {
  const shown = useCountUpText(text, from);
  return <Text {...rest} style={[{ fontVariant: ["tabular-nums"] } as TextStyle, ...(Array.isArray(rest.style) ? rest.style : rest.style ? [rest.style] : [])]}>{shown}</Text>;
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

/** Children with fragments expanded and empty slots dropped: each entry is one block of a column. */
export function flattenBlocks(children: ReactNode): ReactElement[] {
  const out: ReactElement[] = [];
  Children.forEach(children, (c) => {
    if (!isValidElement(c)) return;
    if (c.type === Fragment) out.push(...flattenBlocks((c.props as { children?: ReactNode }).children));
    else out.push(c);
  });
  return out;
}
