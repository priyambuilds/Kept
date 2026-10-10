import test from "node:test";
import assert from "node:assert/strict";
import { adminSecretMatches, lastClosedDay, missedDays } from "../src/v4/jobs.js";

const oath = { startTs: 1_000, daySeconds: 100, numDays: 3 };

test("a day closes only once its whole window has passed, and never past the last day", () => {
  assert.equal(lastClosedDay(oath, 999), -1);
  assert.equal(lastClosedDay(oath, 1_099), -1);
  assert.equal(lastClosedDay(oath, 1_100), 0);
  assert.equal(lastClosedDay(oath, 1_299), 1);
  assert.equal(lastClosedDay(oath, 1_300), 2);
  assert.equal(lastClosedDay(oath, 99_999), 2);
  assert.equal(lastClosedDay({ ...oath, startTs: 0 }, 99_999), -1, "not started");
});

test("missed days are the unset bits of closed days after the cursor", () => {
  const kept = { A: 0b101, B: 0b000 };
  assert.deepEqual(missedDays(kept, -1, 2), [
    { wallet: "B", dayIndex: 0 }, { wallet: "A", dayIndex: 1 }, { wallet: "B", dayIndex: 1 }, { wallet: "B", dayIndex: 2 },
  ]);
  assert.deepEqual(missedDays(kept, 1, 2), [{ wallet: "B", dayIndex: 2 }], "already-marked days are skipped");
  assert.deepEqual(missedDays(kept, 2, 2), [], "re-running is a no-op");
});

test("admin secret must be configured and match exactly", () => {
  assert.equal(adminSecretMatches("", ""), false);
  assert.equal(adminSecretMatches("s3cret", undefined), false);
  assert.equal(adminSecretMatches("s3cret", "s3cre"), false);
  assert.equal(adminSecretMatches("s3cret", "s3cret"), true);
});

test("settlement re-checks the fresh on-chain status and skips an Oath that is already settled", async () => {
  const { settleDecision } = await import("../src/v4/jobs.js");
  const oath = { status: 1, startTs: 1_000, numDays: 3, daySeconds: 100 };
  assert.equal(settleDecision(oath, 1_300), "settle");
  assert.equal(settleDecision({ ...oath, status: 2 }, 1_300), "skip_settled", "a member settled it meanwhile");
  assert.equal(settleDecision({ ...oath, status: 3 }, 1_300), "skip_not_active");
  assert.equal(settleDecision(null, 1_300), "skip_not_active", "account unreadable");
  assert.equal(settleDecision(oath, 1_299), "skip_not_due");
});
