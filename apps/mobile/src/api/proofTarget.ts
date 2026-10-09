// Mirror of the backend's daily target (apps/api/src/routes/v4.ts:21-22, 226-229) so the camera can
// tell the user what to show before the photo is checked: object from the Oath, gesture from
// sha256("<oathId>:<day>") read as a little-endian u32, modulo the five gestures.
import { sha256 } from "@noble/hashes/sha2";
import type { GestureLabel } from "./types";

export const BACKEND_GESTURES: readonly GestureLabel[] = ["thumbs_up", "victory", "open_palm", "closed_fist", "pointing_up"];
export const BACKEND_OBJECTS = ["dumbbell", "book", "water_bottle", "guitar", "running_shoe", "plant", "skipping_rope", "yoga_mat"] as const;

export function dailyTarget(oathId: string, day: number, objectId: number): { object: string; gesture: GestureLabel } {
  const d = sha256(new TextEncoder().encode(`${oathId}:${day}`));
  const n = (d[0]! | (d[1]! << 8) | (d[2]! << 16) | (d[3]! << 24)) >>> 0;
  return { object: BACKEND_OBJECTS[objectId] ?? BACKEND_OBJECTS[0], gesture: BACKEND_GESTURES[n % BACKEND_GESTURES.length]! };
}
