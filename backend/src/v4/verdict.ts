// The photo-check verdict returned by the vision model, and the rule for passing it.

export type PhotoVerdict = {
  objectPresent: boolean;
  objectConfidence: number;
  gestureSeen: string;
  gestureMatches: boolean;
  looksLikeScreenOrPrintout: boolean;
  reason: string;
};

export const MIN_OBJECT_CONFIDENCE = 0.6;

/** Thrown when the vision model gives no usable answer; the API maps it to `check_unavailable`. */
export class CheckUnavailableError extends Error {}

export function verdictPasses(v: PhotoVerdict): boolean {
  return v.objectPresent && v.objectConfidence >= MIN_OBJECT_CONFIDENCE && v.gestureMatches && !v.looksLikeScreenOrPrintout;
}

/** Validates the model's JSON text; null if any field is missing or the wrong type. */
export function parseVerdict(text: string): PhotoVerdict | null {
  let raw: any;
  try { raw = JSON.parse(text); } catch { return null; }
  if (!raw || typeof raw !== "object") return null;
  const { objectPresent, objectConfidence, gestureSeen, gestureMatches, looksLikeScreenOrPrintout, reason } = raw;
  if (typeof objectPresent !== "boolean" || typeof gestureMatches !== "boolean" || typeof looksLikeScreenOrPrintout !== "boolean") return null;
  if (typeof objectConfidence !== "number" || !Number.isFinite(objectConfidence) || typeof gestureSeen !== "string" || typeof reason !== "string") return null;
  return { objectPresent, objectConfidence: Math.min(1, Math.max(0, objectConfidence)), gestureSeen: gestureSeen.slice(0, 60), gestureMatches, looksLikeScreenOrPrintout, reason: reason.slice(0, 200) };
}
