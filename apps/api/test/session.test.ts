import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { combinedProofHash, endChallengeValid, sessionPhase, sessionWaitSeconds, validMinMinutes } from "../src/v4/session.js";
import { pickChallenge } from "../src/v4/rules.js";

const session = { startedAt: new Date(1_000_000), endAllowedAt: new Date(1_000_000 + 30 * 60_000), startGesture: "Victory" };

test("the end photo opens only after the minimum wait, by server time", () => {
  assert.equal(sessionPhase(null, 0), "start");
  assert.equal(sessionPhase(session, session.endAllowedAt.getTime() - 1), "wait");
  assert.equal(sessionPhase(session, session.endAllowedAt.getTime()), "end");
});

test("the wait is minMinutes, capped at half a day so 2-minute debug days still work", () => {
  assert.equal(sessionWaitSeconds(30, 86_400), 1_800);
  assert.equal(sessionWaitSeconds(30, 120), 60);
  assert.equal(sessionWaitSeconds(720, 86_400), 43_200);
  assert.equal(validMinMinutes(0), false);
  assert.equal(validMinMinutes(30), true);
  assert.equal(validMinMinutes(721), false);
  assert.equal(validMinMinutes(1.5), false);
});

test("the end challenge must be new (issued once the end photo opens) and a different gesture", () => {
  const at = session.endAllowedAt;
  assert.equal(endChallengeValid({ gesture: "Thumb_Up", issuedAt: at }, session), true);
  assert.equal(endChallengeValid({ gesture: "Victory", issuedAt: at }, session), false, "same gesture as the start photo");
  assert.equal(endChallengeValid({ gesture: "Thumb_Up", issuedAt: session.startedAt }, session), false, "issued before the wait ended");
  for (let i = 0; i < 20; i++) assert.notEqual(pickChallenge(session.startGesture, () => i / 20), session.startGesture);
});

test("the on-chain hash covers both photos in order", () => {
  const a = "11".repeat(32), b = "22".repeat(32);
  assert.equal(combinedProofHash(a, b), createHash("sha256").update(Buffer.from(a + b, "hex")).digest("hex"));
  assert.notEqual(combinedProofHash(a, b), combinedProofHash(b, a));
});
