import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import type { KeeperMood } from "@/copy";
import { t } from "@/copy";
import { color, metrics, shadow, space, svgStop } from "@/theme";
import { CheckK, Loop, Pop, Text } from "../primitives";
import { Chip } from "../content/Basics";
import type { ChipTone } from "../content/Basics";
import type { IconName } from "../primitives";
import { Keeper } from "./Keeper";
import type { KeeperAnim, KeeperProp } from "./Keeper";

/** A soft radial glow (closest-side to transparent), used for mood glows and ambient orbs. */
export function RadialGlow({ size, colour, id }: { size: number; colour: string; id: string }) {
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" {...svgStop(colour)} />
          <Stop offset="1" {...svgStop(colour, 0)} />
        </RadialGradient>
      </Defs>
      <Rect width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}

// ── KeeperPlacement (`kp`) ── big in-content Keeper with floor shadow, mood glow, speech bubble, floating chips.
export interface KeeperPlacementProps {
  mood: KeeperMood;
  line?: string;
  /** Tap cycles through these lines; the bubble shows "k/n ›". */
  lines?: string[];
  prop?: KeeperProp;
  anim?: KeeperAnim;
  size?: number;
  side?: "l" | "r" | "c";
  height?: number;
  chips?: { text: string; icon: IconName; x: number; y: number; tilt?: number; tone?: ChipTone }[];
}

export function KeeperPlacement({ mood, line, lines, prop = "none", anim = "idle", size = metrics.keeperPlacement.defaultSize, side = "l", height, chips = [] }: KeeperPlacementProps) {
  const [i, setI] = useState(0);
  const W = metrics.contentWidth;
  const kh = Math.round(size * 1.14);
  const h = height ?? kh + 12;
  const ky = h - kh - 2;
  const kx = side === "l" ? 0 : side === "r" ? W - size : Math.round((W - size) / 2);
  const shown = lines?.length ? lines[i % lines.length] : line;
  const gs = Math.round(size * 1.55);
  const glow = color.keeperGlow[mood];
  const left = side === "l";
  const cycle = lines && lines.length > 1;
  const poseAnim: KeeperAnim = i ? (["point", "wave", "thumbs", "shrug"] as const)[i % 4]! : anim;
  return (
    <View style={{ height, position: "relative" }}>
      <View pointerEvents="none" style={{ position: "absolute", left: Math.round(kx + size / 2 - gs / 2), top: Math.round(ky + size * 0.55 - gs / 2) }}>
        <RadialGlow size={gs} colour={glow} id={`kglow-${mood}`} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", left: Math.round(kx + size * 0.15), top: h - metrics.keeperPlacement.shadowH, width: Math.round(size * 0.7), height: metrics.keeperPlacement.shadowH, borderRadius: size, backgroundColor: color.extra.keeperShadow, filter: [{ blur: 9 }] }} />
      <Pressable
        onPress={cycle ? () => setI((n) => n + 1) : undefined}
        disabled={!cycle}
        accessibilityRole={cycle ? "button" : "image"}
        accessibilityLabel={`${t("additions.a11y.keeper")}: ${shown ?? ""}`}
        style={{ position: "absolute", left: kx, top: ky }}
      >
        <Keeper mood={mood} prop={prop} anim={poseAnim} size={size} />
      </Pressable>
      {chips.map((c, k) => (
        <View key={c.text} style={{ position: "absolute", left: c.x, top: c.y, zIndex: 4 }}>
          <Loop kind="float" period={metrics.keeperNote.holdMs - 300} delay={k * 700}>
            <Chip text={c.text} icon={c.icon} {...(c.tone ? { tone: c.tone } : {})} tilt={c.tilt ?? 0} />
          </Loop>
        </View>
      ))}
      {shown ? (
        <View style={{
          position: "absolute", zIndex: 5, maxWidth: side === "c" ? metrics.keeperPlacement.centreBubbleMax : W - size - 2,
          top: side === "c" ? Math.max(0, ky - 4) : Math.max(0, ky + Math.round(size * 0.1)),
          ...(side === "l" ? { left: size - 6 } : side === "r" ? { right: size - 6 } : { left: Math.round((W - metrics.keeperPlacement.centreBubbleMax) / 2) }),
        }}>
          <Pop delay={450} ms={500}>
            <View style={{
              paddingHorizontal: metrics.keeperPlacement.bubblePadX, paddingVertical: metrics.keeperPlacement.bubblePadY,
              borderTopLeftRadius: 17, borderTopRightRadius: 17, borderBottomRightRadius: left || side === "c" ? 17 : 4, borderBottomLeftRadius: left || side === "c" ? 4 : 17,
              backgroundColor: color.text.primary, transform: [{ rotate: `${left ? -3 : 2}deg` }], ...shadow("float"),
            }}>
              <Text variant="keeperLine" color={color.text.onLime}>
                {shown}
                {cycle ? <Text variant="monoMicro" color={color.text.secondary}>{`  ${(i % lines.length) + 1}/${lines.length} ›`}</Text> : null}
              </Text>
            </View>
          </Pop>
        </View>
      ) : null}
    </View>
  );
}

// ── KeeperMark ── 36 tile with the Check-K; unread dot; knock when it has a new line.
export function KeeperMark({ hasNew, onPress }: { hasNew?: boolean; onPress?: () => void }) {
  const h = metrics.header;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={t("additions.a11y.keeper")} hitSlop={6}>
      <View style={{ width: h.markSize, height: h.markSize, borderRadius: h.markRadius, backgroundColor: color.surface[2], boxShadow: `inset 0 0 0 1px ${color.line.hairline2}`, alignItems: "center", justifyContent: "center" }}>
        <CheckK size={h.markIcon} stroke={16} />
        {hasNew ? <View style={{ position: "absolute", right: -3, top: -3, width: h.dot, height: h.dot, borderRadius: h.dot / 2, backgroundColor: color.lime.base, boxShadow: `0 0 0 ${h.dotRing}px ${color.bg.app}` }} /> : null}
      </View>
    </Pressable>
  );
}

// ── KeeperNote ── paper card dropping from the mark; flow screens auto-close after 4.8 s.
export function KeeperNote({ mood, line, onClose, action, autoHideMs, top = metrics.keeperNote.topHeader }: {
  mood: KeeperMood; line: string; onClose: () => void; action?: { label: string; onPress: () => void }; autoHideMs?: number; top?: number;
}) {
  const k = metrics.keeperNote;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!autoHideMs) return;
    timer.current = setTimeout(onClose, autoHideMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [autoHideMs, onClose, line]);
  return (
    <View style={{ position: "absolute", left: k.inset, right: k.inset, top, zIndex: 45 }} accessibilityLiveRegion="polite">
      <Pop ms={420}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={`${t("common.keeperNoteEyebrow")}: ${line}`}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: k.gap, paddingVertical: k.padY, paddingLeft: k.padL, paddingRight: k.padR, borderRadius: k.radius, backgroundColor: color.text.paper, ...shadow("note") }}>
            <View style={{ width: k.tile, height: k.tile, borderRadius: k.tileRadius, overflow: "hidden", alignItems: "center", justifyContent: "flex-end", backgroundColor: color.extra.keeperNoteTile[1] }}>
              <View style={{ position: "absolute", left: -k.tile * 0.25, top: -k.tile * 0.45 }}><RadialGlow size={k.tile * 1.5} colour={color.extra.keeperNoteTile[0]} id="knote" /></View>
              <Keeper mood={mood} bust size={k.tile} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space[5] }}>
                <CheckK size={k.eyebrowMark} variant="ink" stroke={18} />
                <Text variant="monoMicro" color={color.text.tertiary} style={{ letterSpacing: 1.2 }}>{t("common.keeperNoteEyebrow")}</Text>
              </View>
              <Text variant="keeperNote" color={color.text.onLime} style={{ marginTop: 3 }}>{line}</Text>
            </View>
            {action ? (
              <Pressable onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} hitSlop={7}>
                <View style={{ height: k.actionH, paddingHorizontal: k.actionPadX, borderRadius: k.actionH / 2, backgroundColor: color.bg.app, justifyContent: "center" }}>
                  <Text variant="chip" color={color.lime.base}>{action.label}</Text>
                </View>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pop>
    </View>
  );
}
