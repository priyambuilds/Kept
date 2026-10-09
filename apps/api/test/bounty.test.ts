import test from "node:test";
import assert from "node:assert/strict";
import { bountyDay, bountyEndTs, bountyJoinOpen, bountyKnockouts, parseTokenAmount, payoutAction, splitPool } from "../src/v4/bounty.js";

const b = { startTs: 1_000, daySeconds: 100, numDays: 3 };

test("bounty timing: day index, end, and join closing when day 1 ends", () => {
  assert.equal(bountyDay(b, 999), -1);
  assert.equal(bountyDay(b, 1_000), 0);
  assert.equal(bountyDay(b, 1_199), 1);
  assert.equal(bountyEndTs(b), 1_300);
  assert.equal(bountyJoinOpen(b, 500), true, "before the start");
  assert.equal(bountyJoinOpen(b, 1_099), true, "during day 1");
  assert.equal(bountyJoinOpen(b, 1_100), false, "day 1 has ended");
});

test("missing a day knocks an entrant out once, at the first missed day", () => {
  const entries = [
    { wallet: "kept-all", daysKept: 0b111, out: false },
    { wallet: "missed-day-2", daysKept: 0b001, out: false },
    { wallet: "missed-everything", daysKept: 0, out: false },
    { wallet: "already-out", daysKept: 0, out: true },
  ];
  assert.deepEqual(bountyKnockouts(entries, -1, 0), [{ wallet: "missed-everything", outDay: 0 }]);
  assert.deepEqual(bountyKnockouts(entries, -1, 2), [{ wallet: "missed-day-2", outDay: 1 }, { wallet: "missed-everything", outDay: 0 }]);
  assert.deepEqual(bountyKnockouts(entries, 2, 2), [], "re-running after the cursor is a no-op");
});

test("the pool splits evenly among those still in; the remainder stays with the payer", () => {
  assert.deepEqual(splitPool(1_000n, 3), { share: 333n, remainder: 1n });
  assert.deepEqual(splitPool(1_000n, 4), { share: 250n, remainder: 0n });
  assert.deepEqual(splitPool(1_000n, 0), { share: 0n, remainder: 1_000n });
  for (let n = 1; n <= 50; n++) {
    const { share, remainder } = splitPool(123_456_789n, n);
    assert.equal(share * BigInt(n) + remainder, 123_456_789n);
    assert.ok(remainder < BigInt(n));
  }
});

test("token amounts convert exactly into base units", () => {
  assert.equal(parseTokenAmount("5000", 6), 5_000_000_000n);
  assert.equal(parseTokenAmount("0.000001", 6), 1n);
  assert.equal(parseTokenAmount(12.5, 6), 12_500_000n);
  assert.equal(parseTokenAmount("0.0000001", 6), null, "more decimals than the mint");
  assert.equal(parseTokenAmount("-1", 6), null);
  assert.equal(parseTokenAmount("1e3", 6), null);
});

test("payouts are idempotent: a saved transfer is resolved before anything is resent", () => {
  const saved = { signature: "sig", validHeight: 100 };
  assert.equal(payoutAction({ signature: "", validHeight: null }, null, null), "send", "never sent");
  assert.equal(payoutAction(saved, { err: null, confirmationStatus: "confirmed" }, null), "paid");
  assert.equal(payoutAction(saved, { err: null, confirmationStatus: "finalized" }, null), "paid");
  assert.equal(payoutAction(saved, { err: null, confirmationStatus: "processed" }, null), "wait", "landed, not confirmed yet");
  assert.equal(payoutAction(saved, { err: { InstructionError: [1, "Custom"] } }, null), "send", "failed on-chain: nothing moved");
  assert.equal(payoutAction(saved, null, 100), "wait", "unseen but its blockhash is still valid");
  assert.equal(payoutAction(saved, null, 101), "send", "unseen and expired: it can never land");
  assert.equal(payoutAction({ signature: "sig", validHeight: null }, null, 999), "wait", "unknown expiry: never resend blindly");
});

test("bounty ids are strict positive int32 values", async () => {
  const { parseBountyId, parseRecentlyOutLimit } = await import("../src/v4/bounty.js");
  assert.equal(parseBountyId("1"), 1);
  assert.equal(parseBountyId("2147483647"), 2_147_483_647);
  for (const bad of ["0", "-1", "01", "1.0", "1e3", "abc", "", "2147483648", undefined]) assert.equal(parseBountyId(bad), null, String(bad));
  assert.equal(parseRecentlyOutLimit(undefined), 20);
  assert.equal(parseRecentlyOutLimit("100"), 100);
  assert.equal(parseRecentlyOutLimit("101"), null);
});
