// Group review's three-failure threshold is counted by the server from POST /proof/verify rows.
import test from "node:test";
import assert from "node:assert/strict";
import { loadReviewFailures, type ReviewFailureStore } from "../src/routes/proofVerify.js";
import { REVIEW_AFTER_FAILED_TRIES, reviewFailures, reviewRequestRejection, type ReviewContext } from "../src/v4/rules.js";

const WALLET = "Wa11et1111111111111111111111111111111111111";
const OATH = "0ath11111111111111111111111111111111111111";
const endAllowedAt = new Date("2026-10-08T12:30:00Z");
const ctx: ReviewContext = { wallet: WALLET, oath: OATH, dayIndex: 2, session: { id: 7, endAllowedAt }, object: "running shoes", gesture: "thumbs up" };

let n = 0;
/** A FAIL for exactly `ctx` unless overridden; createdAt after the end photo opened. */
const fail = (over: Record<string, unknown> = {}) => ({
  id: `v${++n}`, wallet: WALLET, oath: OATH, dayIndex: 2, sessionId: 7, status: "FAIL", proofHash: `hash${n}`,
  expectedObject: "running shoes", expectedGesture: "thumbs up", createdAt: new Date(endAllowedAt.getTime() + n * 1000),
  objectPresent: false, objectConfidence: 0.2, gestureSeen: "none", gestureMatches: false, looksLikeScreen: false, reason: "", usedAt: null, ...over,
});

/** In-memory ProofVerification table; applies the same `where` the Prisma query does. */
function store(rows: ReturnType<typeof fail>[]): ReviewFailureStore {
  return { async findMany({ where }) {
    return rows.filter((r) => r.wallet === where.wallet && r.oath === where.oath && r.dayIndex === where.dayIndex && r.status === where.status) as any;
  } };
}

const decide = async (rows: ReturnType<typeof fail>[], photoHash: string, isSolo = false) => {
  const failures = await loadReviewFailures(ctx, store(rows));
  return { failures, refused: reviewRequestRejection({ isSolo, failures, photoHash, photoBytes: 50_000, priorStatus: null }) };
};

test("fewer than three failed checks: review is refused, whatever the app claims", async () => {
  const rows = [fail(), fail()];
  const { failures, refused } = await decide(rows, rows[1].proofHash);
  assert.equal(failures.length, 2);
  assert.equal(refused?.status, 409);
  assert.match(refused!.error, /after 3 failed checks/);
});

test("three valid failed checks: review is allowed for the photo of one of them", async () => {
  const rows = [fail(), fail(), fail()];
  const { failures, refused } = await decide(rows, rows[2].proofHash);
  assert.equal(REVIEW_AFTER_FAILED_TRIES, 3);
  assert.equal(failures.length, 3);
  assert.equal(failures[0].proofHash, rows[2].proofHash, "newest first");
  assert.equal(refused, null);
});

test("three failures but a photo the server never checked: 422", async () => {
  const { refused } = await decide([fail(), fail(), fail()], "some-other-photo");
  assert.equal(refused?.status, 422);
});

test("failures for another wallet, Oath, day, gesture, object or session do not count", async () => {
  const valid = [fail(), fail()];
  const others = [
    fail({ wallet: "SomeoneE1se11111111111111111111111111111111" }),
    fail({ oath: "0therOath1111111111111111111111111111111111" }),
    fail({ dayIndex: 1 }),
    fail({ expectedGesture: "victory sign (index and middle finger in a V)" }),
    fail({ expectedObject: "book" }),
    fail({ sessionId: 6 }),
    fail({ sessionId: null }),
    fail({ oath: null, dayIndex: null, sessionId: null }), // sent without Oath context (e.g. a bounty check)
    fail({ createdAt: new Date(endAllowedAt.getTime() - 1) }), // before photo 2 opened
    fail({ status: "PASS" }),
    fail({ status: "PENDING" }),
  ];
  for (const other of others) {
    const { failures, refused } = await decide([...valid, other], other.proofHash);
    assert.equal(failures.length, 2, JSON.stringify(other));
    assert.equal(refused?.status, 409, JSON.stringify(other));
  }
  assert.equal(reviewFailures([...valid, ...others], ctx).length, 2, "the pure filter agrees without the store's where");
});

test("solo Oaths cannot use group review, even with three valid failures", async () => {
  const rows = [fail(), fail(), fail()];
  const { refused } = await decide(rows, rows[0].proofHash, true);
  assert.equal(refused?.status, 409);
  assert.match(refused!.error, /Solo Oaths/);
});

test("photo size and one-review-per-day rules still apply", () => {
  const failures = [{ proofHash: "a" }, { proofHash: "b" }, { proofHash: "c" }];
  const ok = { isSolo: false, failures, photoHash: "c", photoBytes: 50_000, priorStatus: null };
  assert.equal(reviewRequestRejection(ok), null);
  assert.equal(reviewRequestRejection({ ...ok, photoBytes: 99 })?.status, 413);
  assert.equal(reviewRequestRejection({ ...ok, priorStatus: "PENDING_REVIEW" })?.status, 409);
  assert.equal(reviewRequestRejection({ ...ok, priorStatus: "REJECTED" })?.status, 409);
});
