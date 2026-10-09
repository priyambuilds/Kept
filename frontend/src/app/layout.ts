// Per-screen layout from the design (app/layout.gen.json, scripts/gen-layout.mjs): ambient light,
// hero offset and the Keeper's placement (size, side, pose, prop, orbs, chip spots).
import type { KeeperAnim, KeeperProp } from "@/components/keeper/Keeper";
import type { KeeperChip, KeeperOrb } from "@/components/keeper/KeeperUI";
import { chipTone } from "@/components/keeper/KeeperUI";
import type { IconName } from "@/components/primitives";
import { metrics } from "@/theme";
import table from "./layout.gen.json";

export type Tone = "lime" | "red" | "ember" | "grey" | "lock";
export type AmbientColor = "lime" | "red" | "ember" | "vio" | "sky";
interface ChipSpot { icon: string; x: number; y: number; rotate: number; tone: string }
interface KeeperLayout { size: number; side: "l" | "r" | "c"; height: number; anim: string | null; prop: string | null; orbs?: KeeperOrb[]; chips?: ChipSpot[] }
export interface ScreenLayout { tone: Tone | null; ambient: AmbientColor | null; beam: boolean; decor: string[]; top: number; keeper: KeeperLayout | null }

const LAYOUTS = table as Record<string, ScreenLayout>;
export const layoutOf = (id: string | undefined): ScreenLayout | undefined => (id ? LAYOUTS[id] : undefined);

/**
 * KeeperPlacement props for a screen, as the prototype draws it. `chipTexts` fills the design's chip
 * spots in order (the text is data or copy; the position, icon and tone are the design's).
 */
export function keeperAt(id: string, chipTexts: string[] = []): {
  size: number; side: KeeperLayout["side"]; height?: number; anim?: KeeperAnim; prop?: KeeperProp; orbs?: KeeperOrb[]; chips?: KeeperChip[];
} {
  const k = LAYOUTS[id]?.keeper;
  if (!k) return { size: metrics.keeperPlacement.defaultSize, side: "r" };
  const chips = (k.chips ?? []).flatMap((c, i): KeeperChip[] => (chipTexts[i] ? [{ text: chipTexts[i]!, icon: c.icon as IconName, x: c.x, y: c.y, tilt: c.rotate, tone: chipTone(c.tone) }] : []));
  return {
    size: k.size, side: k.side, height: k.height,
    ...(k.anim ? { anim: k.anim as KeeperAnim } : {}),
    ...(k.prop ? { prop: k.prop as KeeperProp } : {}),
    ...(k.orbs?.length ? { orbs: k.orbs } : {}),
    ...(chips.length ? { chips } : {}),
  };
}
