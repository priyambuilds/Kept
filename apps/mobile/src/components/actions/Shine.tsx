import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { duration, gradient } from "@/theme";
import { Gradient } from "../primitives";

/** The shine sweep (motion.md `shine`): a 40 % white strip, −120 % → 320 % by 55 % of the cycle, then rest. */
export function Shine({ period = duration.shine, delay = 1000, widthPct = 0.4 }: { period?: number; delay?: number; widthPct?: number }) {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const p = useSharedValue(0);
  useEffect(() => {
    if (reduce || !w) return;
    p.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: period * 0.55, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: period * 0.45 }), withTiming(0, { duration: 0 })), -1));
    return () => cancelAnimation(p);
  }, [reduce, w, period, delay, p]);
  const strip = w * widthPct;
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: -1.2 * strip + p.value * 4.4 * strip }] }));
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, left: 0, width: strip }, a]}>
        <Gradient g={gradient("shine")} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}
