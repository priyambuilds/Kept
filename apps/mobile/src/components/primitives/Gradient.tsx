import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { GradientProps } from "@/theme";

export function Gradient({ g, style, children, pointerEvents }: { g: GradientProps; style?: StyleProp<ViewStyle>; children?: ReactNode; pointerEvents?: "none" | "auto" | "box-none" }) {
  return (
    <LinearGradient
      colors={g.colors}
      {...(g.locations ? { locations: g.locations } : {})}
      start={g.start}
      end={g.end}
      style={style}
      {...(pointerEvents ? { pointerEvents } : {})}
    >
      {children}
    </LinearGradient>
  );
}
