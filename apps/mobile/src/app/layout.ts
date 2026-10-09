// Per-screen layout from the design (app/layout.gen.json, scripts/gen-layout.mjs): ambient light,
// hero offset and the Keeper's placement.
import type { KeeperAnim, KeeperProp } from "@/components/keeper/Keeper";
import { KEEPER_POSE, KEEPER_PROP } from "@/components/keeper/assets";
import { metrics } from "@/theme";
import table from "./layout.gen.json";

export type Tone = "lime" | "red" | "ember" | "grey" | "lock";
export type AmbientColor = "lime" | "red" | "ember" | "vio" | "sky";
interface KeeperLayout { size: number; side: "l" | "r" | "c"; height: number; anim: string | null; prop: string | null }
export interface ScreenLayout { tone: Tone | null; ambient: AmbientColor | null; beam: boolean; decor: string[]; top: number; keeper: KeeperLayout | null }

const LAYOUTS = table as Record<string, ScreenLayout>;
export const layoutOf = (id: string | undefined): ScreenLayout | undefined => (id ? LAYOUTS[id] : undefined);

/**
 * KeeperPlacement props for a screen, as the prototype draws it: size, side, height, pose and prop.
 * Poses and props without a PNG (D-33) are left out until the parametric Keeper (Phase 5).
 */
export function keeperAt(id: string): { size: number; side: KeeperLayout["side"]; height?: number; anim?: KeeperAnim; prop?: KeeperProp } {
  const k = LAYOUTS[id]?.keeper;
  if (!k) return { size: metrics.keeperPlacement.defaultSize, side: "r" };
  return {
    size: k.size, side: k.side, height: k.height,
    ...(k.anim && k.anim in KEEPER_POSE ? { anim: k.anim as KeeperAnim } : {}),
    ...(k.prop && k.prop in KEEPER_PROP ? { prop: k.prop as KeeperProp } : {}),
  };
}
