// Two-photo proof session: a start photo, then (after a minimum wait, by server time) an end photo with a
// different gesture. The day counts only when both pass; the on-chain proof hash covers both photos.
import { createHash } from "node:crypto";

export const DEFAULT_SESSION_MIN_MINUTES = 30;
export const MAX_SESSION_MIN_MINUTES = 720;

/** Seconds between the start and end photo. Capped at half a day so short (debug) days stay completable. */
export function sessionWaitSeconds(minMinutes: number, daySeconds: number): number {
  return Math.max(0, Math.min(minMinutes * 60, Math.floor(daySeconds / 2)));
}

export type SessionStart = { startedAt: Date; endAllowedAt: Date; startGesture: string };

/** "start" before the start photo, "wait" until the end photo is allowed, then "end". */
export function sessionPhase(session: SessionStart | null, nowMs: number): "start" | "wait" | "end" {
  if (!session) return "start";
  return nowMs < session.endAllowedAt.getTime() ? "wait" : "end";
}

/** An end-photo challenge must be issued after the start photo and use a different gesture. */
export function endChallengeValid(challenge: { gesture: string; issuedAt: Date }, session: SessionStart): boolean {
  return challenge.issuedAt.getTime() >= session.endAllowedAt.getTime() && challenge.gesture !== session.startGesture;
}

/** The hash recorded on-chain for a two-photo day: sha256(startHash ‖ endHash), both 32-byte hex. */
export function combinedProofHash(startHex: string, endHex: string): string {
  return createHash("sha256").update(Buffer.concat([Buffer.from(startHex, "hex"), Buffer.from(endHex, "hex")])).digest("hex");
}

export function validMinMinutes(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_SESSION_MIN_MINUTES;
}
