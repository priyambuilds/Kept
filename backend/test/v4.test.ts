import test from "node:test";
import assert from "node:assert/strict";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { issueNonce, verifyLogin } from "../src/auth.js";
import { challengeUsable, CHALLENGE_GESTURES, CHALLENGE_TTL_MS, nudgeRejection, pickChallenge, proofRejection, reviewOutcome } from "../src/v4/rules.js";

test("Sign-in requires the issued wallet-specific message and consumes its nonce", () => {
  const kp=Keypair.generate(), wallet=kp.publicKey.toBase58(), message=issueNonce(wallet);
  const signature=Buffer.from(nacl.sign.detached(Buffer.from(message),kp.secretKey)).toString("base64");
  assert.equal(verifyLogin(wallet,message,signature),true);
  assert.equal(verifyLogin(wallet,message,signature),false,"nonce cannot be replayed");
});

test("proof gates reject non-members, wrong day windows and duplicates", () => {
  const base={status:1,member:true,day:1,numDays:3,startTs:1000,daySeconds:120,now:1120,alreadyRecorded:false};
  assert.equal(proofRejection({...base,member:false}),"non_member");
  assert.equal(proofRejection({...base,day:0}),"outside_day_window");
  assert.equal(proofRejection({...base,alreadyRecorded:true}),"duplicate");
  assert.equal(proofRejection(base),null);
});

test("nudge rules restrict members, current day, and already completed proof", () => {
  const base={member:true,recipientMember:true,self:false,day:2,currentDay:2,alreadyCheckedIn:false};
  assert.equal(nudgeRejection({...base,recipientMember:false}),"invalid_member");
  assert.equal(nudgeRejection({...base,day:1}),"wrong_day");
  assert.equal(nudgeRejection({...base,alreadyCheckedIn:true}),"already_checked_in");
  assert.equal(nudgeRejection(base),null);
});

test("gesture challenges are thumbs-up, victory, or open-palm and never repeat the previous one", () => {
  assert.deepEqual(CHALLENGE_GESTURES, ["Thumb_Up", "Victory", "Open_Palm"]);
  for (const previous of [null, ...CHALLENGE_GESTURES]) {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999999]) {
      const next = pickChallenge(previous, () => r);
      assert.ok(CHALLENGE_GESTURES.includes(next));
      assert.notEqual(next, previous);
    }
  }
});

test("gesture challenges expire after two minutes, with optional upload grace", () => {
  assert.equal(challengeUsable(1_000, 1_000 + CHALLENGE_TTL_MS - 1), true);
  assert.equal(challengeUsable(1_000, 1_000 + CHALLENGE_TTL_MS), false);
  assert.equal(challengeUsable(1_000, 1_000 + CHALLENGE_TTL_MS + 30_000, 60_000), true);
  assert.equal(challengeUsable(1_000, 999), false);
});

test("group review needs a majority of the other members and ties reject", () => {
  assert.equal(reviewOutcome({ approvals: 1, rejections: 0, reviewers: 1 }), "approved");
  assert.equal(reviewOutcome({ approvals: 0, rejections: 1, reviewers: 1 }), "rejected");
  assert.equal(reviewOutcome({ approvals: 1, rejections: 0, reviewers: 3 }), null);
  assert.equal(reviewOutcome({ approvals: 2, rejections: 0, reviewers: 3 }), "approved");
  assert.equal(reviewOutcome({ approvals: 1, rejections: 1, reviewers: 2 }), "rejected");
  assert.equal(reviewOutcome({ approvals: 0, rejections: 0, reviewers: 0 }), "rejected");
});

test("a photo check can be used once, by its wallet, for the same target, within 10 minutes", async () => {
  const { verificationRejection, VERIFICATION_TTL_MS } = await import("../src/v4/rules.js");
  const expected = { object: "running shoes", gesture: "thumbs up" };
  const v = { wallet: "W", status: "PASS", usedAt: null, createdAt: new Date(1_000_000), expectedObject: "running shoes", expectedGesture: "thumbs up" };
  const now = 1_000_000 + 60_000;
  assert.equal(verificationRejection(v, "W", expected, now), null);
  assert.match(verificationRejection(null, "W", expected, now)!, /not found/);
  assert.match(verificationRejection(v, "other", expected, now)!, /not found/);
  assert.match(verificationRejection({ ...v, status: "FAIL" }, "W", expected, now)!, /did not pass/);
  assert.match(verificationRejection({ ...v, usedAt: new Date() }, "W", expected, now)!, /already used/);
  assert.match(verificationRejection(v, "W", expected, 1_000_000 + VERIFICATION_TTL_MS + 1)!, /expired/);
  assert.match(verificationRejection(v, "W", { ...expected, gesture: "open palm facing the camera" }, now)!, /different/);
});

test("group-review photos expire 48 hours after upload", async () => {
  const { reviewPhotoExpired, REVIEW_PHOTO_TTL_MS } = await import("../src/v4/rules.js");
  const uploaded = new Date(1_000_000);
  assert.equal(REVIEW_PHOTO_TTL_MS, 48 * 60 * 60 * 1000);
  assert.equal(reviewPhotoExpired(uploaded, uploaded.getTime() + REVIEW_PHOTO_TTL_MS - 1), false);
  assert.equal(reviewPhotoExpired(uploaded, uploaded.getTime() + REVIEW_PHOTO_TTL_MS), true);
});

test("/api/proof needs a verificationId, except a group-review request that sends the photo", async () => {
  const { proofRequestKind } = await import("../src/v4/rules.js");
  assert.deepEqual(proofRequestKind({ verificationId: "v" }), { kind: "verified" });
  assert.deepEqual(proofRequestKind({}), { status: 400, error: "Expected verificationId from POST /proof/verify" });
  assert.deepEqual(proofRequestKind({ photo: "…" }), { status: 400, error: "Expected verificationId from POST /proof/verify" }, "a photo alone is not enough without review: true");
  assert.deepEqual(proofRequestKind({ review: true, photo: "…" }), { kind: "review" }, "the exception: no verificationId, and no client detection or failedAttempts needed");
  assert.equal((proofRequestKind({ review: true, verificationId: "v" }) as { status: number }).status, 400, "review still needs the photo");
  assert.equal((proofRequestKind({ review: "true", photo: "…" }) as { status: number }).status, 400, "only boolean true selects review");
});
