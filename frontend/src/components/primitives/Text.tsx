import type { ReactNode } from "react";
import { Text as RNText } from "react-native";
import type { TextProps as RNTextProps, TextStyle } from "react-native";
import { color, fontFamily, type as typeStyles } from "@/theme";
import type { TypeName } from "@/theme";

export interface TextProps extends Omit<RNTextProps, "style"> {
  /** A type token from tokens.json (default: body without its secondary colour). */
  variant?: TypeName;
  color?: string;
  align?: TextStyle["textAlign"];
  style?: TextStyle | TextStyle[];
  children?: ReactNode;
}

export function Text({ variant = "label", color: c, align, style, children, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[typeStyles[variant], c ? { color: c } : null, align ? { textAlign: align } : null, ...(Array.isArray(style) ? style : [style])]}
    >
      {children}
    </RNText>
  );
}

/**
 * Body text with inline mono spans: "2 of 3 left · resets in <m>09:18:42</m>" and <m class="r"> for red
 * (DESIGN.md §3, renderer `tx`). Plain parts use `baseColor`; spans render in Geist Mono.
 */
export function RichText({ text, variant = "body", baseColor, style }: { text: string; variant?: TypeName; baseColor?: string; style?: TextStyle }) {
  const parts = text.split(/(<m(?: class="r")?>.*?<\/m>)/).filter(Boolean);
  return (
    <Text variant={variant} {...(baseColor ? { color: baseColor } : {})} {...(style ? { style } : {})}>
      {parts.map((p, i) => {
        const m = p.match(/^<m( class="r")?>(.*)<\/m>$/);
        if (!m) return p;
        return (
          <RNText key={i} style={{ fontFamily: fontFamily("mono", 600), color: m[1] ? color.red.base : color.text.primary }}>
            {m[2]}
          </RNText>
        );
      })}
    </Text>
  );
}
