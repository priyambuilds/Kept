// The Keeper: the parametric rig from design/reference/Keeper.dc.html (KeeperSvg: moods × props × anims,
// blink and breathing on the UI thread). The supplied PNG exports stay as the fallback (DECISIONS D-33):
// `png` forces them, e.g. where an SVG can't render (notifications, share cards).
import { Image, View } from "react-native";
import type { KeeperMood } from "@/copy";
import { t } from "@/copy";
import { KEEPER_BODY, KEEPER_BUST, KEEPER_POSE, KEEPER_PROP } from "./assets";
import { KeeperSvg } from "./KeeperSvg";
import type { KeeperAnimName, KeeperPropName } from "./rig";

export type KeeperProp = KeeperPropName;
export type KeeperAnim = KeeperAnimName;

export interface KeeperProps {
  mood: KeeperMood;
  prop?: KeeperProp;
  anim?: KeeperAnim;
  /** Character width in dp; full-body height is size × 1.125 (components.md › Keeper). */
  size: number;
  bust?: boolean;
  /** Hold the still pose (no blink, breathing or gestures). */
  animate?: boolean;
  /** Use the PNG exports instead of the vector rig. */
  png?: boolean;
}

/** Full-body exports use viewBox −16 −16 192 212 (160×180 character + 16 dp padding). */
const PAD = 16 / 160;
const FULL_W = 192 / 160;
const FULL_H = 212 / 160;

export function Keeper({ mood, prop = "none", anim = "idle", size, bust, animate = true, png }: KeeperProps) {
  if (!png) {
    return (
      <View accessible accessibilityRole="image" accessibilityLabel={t("additions.a11y.keeper")}>
        <KeeperSvg mood={mood} prop={prop} anim={anim} size={size} bust={!!bust} animate={animate} />
      </View>
    );
  }
  if (bust) {
    return <Image source={KEEPER_BUST[mood]} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel={t("additions.a11y.keeper")} />;
  }
  // The PNGs are single exports: a pose reads strongest (A1 waves, L1 jumps), then a prop, then the mood.
  const src = anim in KEEPER_POSE ? KEEPER_POSE[anim as keyof typeof KEEPER_POSE] : prop in KEEPER_PROP ? KEEPER_PROP[prop as keyof typeof KEEPER_PROP] : KEEPER_BODY[mood];
  return (
    <View style={{ width: size, height: size * 1.125 }} accessible accessibilityLabel={t("additions.a11y.keeper")}>
      <Image source={src} style={{ position: "absolute", left: -size * PAD, top: -size * PAD, width: size * FULL_W, height: size * FULL_H }} resizeMode="contain" />
    </View>
  );
}
