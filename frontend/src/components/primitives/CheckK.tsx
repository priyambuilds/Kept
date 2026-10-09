import Svg, { Path } from "react-native-svg";
import { color } from "@/theme";

/**
 * The Check-K brand mark (DESIGN.md §10): stem M23 24V76, check M23 44L40 60L78 24, leg M54 45L78 76,
 * round caps. On dark: stem + leg paper, check lime. Ink: all #131313 (for lime tiles).
 */
export function CheckK({ size, variant = "dark", stroke }: { size: number; variant?: "dark" | "ink"; stroke?: number }) {
  const sw = stroke ?? (size <= 32 ? 16 : 15);
  const side = variant === "ink" ? color.text.onLime : color.text.paper;
  const check = variant === "ink" ? color.text.onLime : color.lime.base;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size} accessible={false}>
      <Path d="M54 45L78 76" fill="none" stroke={side} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M23 44L40 60L78 24" fill="none" stroke={check} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 24V76" fill="none" stroke={side} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}
