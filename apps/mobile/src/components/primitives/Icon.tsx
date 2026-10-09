import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { color as colors } from "@/theme";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

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
