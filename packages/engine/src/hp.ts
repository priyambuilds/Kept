// HP display helpers (DESIGN.md §2.7, rules.md §2 thresholds). Colours live in the app theme.

import { HP } from "@kept/config";

export type HpTone = "full" | "warn" | "danger";

export function hpTone(hp: number): HpTone {
  if (hp <= HP.dangerAtOrBelow) return "danger";
  if (hp <= HP.warnAtOrBelow) return "warn";
  return "full";
}

/** Filled segments out of 20 (5 HP each); any HP above 0 shows at least one. */
export const hpFilledSegments = (hp: number): number => Math.min(HP.segments, Math.ceil(Math.max(0, hp) / (HP.max / HP.segments)));

/** Segments lost today: the damage, in segments, right after the filled ones. */
export const hpLostSegments = (hpNow: number, lostToday: number): number =>
  Math.min(HP.segments - hpFilledSegments(hpNow), Math.ceil(Math.max(0, lostToday) / (HP.max / HP.segments)));
