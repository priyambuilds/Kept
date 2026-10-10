import createIconSet from "@expo/vector-icons/createIconSet";
import { color as colors } from "@/theme";
import { ICON_FONT } from "@/theme/fonts";
import glyphs from "./icons.gen.json";

/** The Material Design Icons the app uses, cut from ~7,000 (scripts/gen-icons.js). */
export type IconName = keyof typeof glyphs;
const MaterialCommunityIcons = createIconSet(glyphs as Record<IconName, number>, ICON_FONT, require("../../../assets/fonts/kept-icons.ttf"));

/** Material Design Icons, same names as the prototype's mdi-* classes (DESIGN.md §8). Decorative by default. */
export function Icon({ name, size, color = colors.text.primary, label }: { name: IconName; size: number; color?: string; label?: string }) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessible={!!label}
      importantForAccessibility={label ? "yes" : "no-hide-descendants"}
      {...(label ? { accessibilityLabel: label } : {})}
    />
  );
}
