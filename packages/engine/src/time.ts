// Day boundaries (DECISIONS D-6 / amendment 1): midnight to midnight in the creator's time zone,
// fixed at creation. Day 1 begins at the first midnight after Start. Times are unix seconds.

import { DEADLINE_WARN_SECONDS } from "@kept/config";

export const DAY_SECONDS = 86_400;

/** Local calendar day number for a unix time at a fixed UTC offset (floor division). */
export function localDay(unix: number, tzOffsetMinutes: number): number {
  return Math.floor((unix + tzOffsetMinutes * 60) / DAY_SECONDS);
}

/** Unix time of the first local midnight strictly after `unix`. */
export function nextMidnight(unix: number, tzOffsetMinutes: number): number {
  return (localDay(unix, tzOffsetMinutes) + 1) * DAY_SECONDS - tzOffsetMinutes * 60;
}

export type DayPhase =
  | { phase: "waiting"; startsAt: number; secondsToStart: number }
  | { phase: "day"; dayIndex: number; dayEndsAt: number; secondsToReset: number; deadlineClose: boolean }
  | { phase: "over"; endedAt: number };

/**
 * Where an Oath is in time. `day1StartsAt` is the first midnight after Start (as the program will
 * store it once BACKEND_GAPS P0-4 lands; until then the app derives it with nextMidnight()).
 * `daySeconds` is 86,400 except on debug program builds (120 s days for testing); the deadline
 * warning scales with it so a short day still has a "deadline close" phase.
 */
export function dayPhase(day1StartsAt: number, numDays: number, now: number, daySeconds: number = DAY_SECONDS): DayPhase {
  if (now < day1StartsAt) return { phase: "waiting", startsAt: day1StartsAt, secondsToStart: day1StartsAt - now };
  const dayIndex = Math.floor((now - day1StartsAt) / daySeconds);
  if (dayIndex >= numDays) return { phase: "over", endedAt: day1StartsAt + numDays * daySeconds };
  const dayEndsAt = day1StartsAt + (dayIndex + 1) * daySeconds;
  const secondsToReset = dayEndsAt - now;
  const warn = (DEADLINE_WARN_SECONDS * daySeconds) / DAY_SECONDS;
  return { phase: "day", dayIndex, dayEndsAt, secondsToReset, deadlineClose: secondsToReset <= warn };
}
