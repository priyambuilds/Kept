import { View } from "react-native";
import { color, fontFamily, metrics, shadow, tileForIcon, tile as tileFor } from "@/theme";
import type { PaletteName } from "@/theme";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { Surface } from "./Surface";
import { Text } from "./Text";

/**
 * The 3D icon tile (DESIGN.md §6 tile3d): 150° palette gradient, 1.5 dp top highlight, 3 dp bottom
 * shade, drop shadow, rotated −4°. Palette defaults to the icon's mapping in color.objectTile.
 */
export function Tile({ icon, size = metrics.card.tile, iconSize = metrics.card.tileIcon, radius = metrics.card.tileRadius, palette, tilt = metrics.card.tileTilt }: {
  icon: IconName; size?: number; iconSize?: number; radius?: number; palette?: PaletteName; tilt?: number;
}) {
  const p = palette ? tileFor(palette) : tileForIcon(icon);
  return (
    <View style={{ transform: [{ rotate: `${tilt}deg` }] }}>
      <Surface radius={radius} gradient={p.gradient} shadow={shadow("tile3d").boxShadow} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={iconSize} color={p.ink} />
      </Surface>
    </View>
  );
}

/** Initial tile for people without an avatar (member colour, ink initial). */
export function InitialTile({ initial, bg, size, radius, textSize }: { initial: string; bg: string; size: number; radius: number; textSize: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <InitialText initial={initial} size={textSize} />
    </View>
  );
}

function InitialText({ initial, size }: { initial: string; size: number }) {
  return <Text color={color.text.onLime} style={{ fontSize: size, lineHeight: size + 2, fontFamily: fontFamily("sans", 700) }}>{initial}</Text>;
}
