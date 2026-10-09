// The Keeper. Phases 1–4 use the supplied PNG exports (DECISIONS D-33); Phase 5 ports the parametric
// rig from design/reference/Keeper.dc.html to react-native-svg with these as the Reduce Motion fallback.
import { Image, View } from "react-native";
import type { KeeperMood } from "@/copy";
import { t } from "@/copy";
import { KEEPER_BODY, KEEPER_BUST, KEEPER_POSE, KEEPER_PROP } from "./assets";

export type KeeperProp = keyof typeof KEEPER_PROP | "none";
export type KeeperAnim = keyof typeof KEEPER_POSE | "idle" | "none";

export interface KeeperProps {
  mood: KeeperMood;
  prop?: KeeperProp;
  anim?: KeeperAnim;
  /** Character width in dp; full-body height is size × 1.125 (components.md › Keeper). */
  size: number;
  bust?: boolean;
}

/** Full-body exports use viewBox −16 −16 192 212 (160×180 character + 16 dp padding). */
const PAD = 16 / 160;
const FULL_W = 192 / 160;
const FULL_H = 212 / 160;

export function Keeper({ mood, prop = "none", anim = "idle", size, bust }: KeeperProps) {
  if (bust) {
    return <Image source={KEEPER_BUST[mood]} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel={t("additions.a11y.keeper")} />;
  }
  // PNG fallback (D-33) shows one image: a pose reads strongest in the prototype (A1 waves, L1 jumps),
  // then a prop, then the mood's body.
  const src = anim !== "idle" && anim !== "none" ? KEEPER_POSE[anim] : prop !== "none" ? KEEPER_PROP[prop] : KEEPER_BODY[mood];
  return (
    <View style={{ width: size, height: size * 1.125 }} accessible accessibilityLabel={t("additions.a11y.keeper")}>
      <Image source={src} style={{ position: "absolute", left: -size * PAD, top: -size * PAD, width: size * FULL_W, height: size * FULL_H }} resizeMode="contain" />
    </View>
  );
}
