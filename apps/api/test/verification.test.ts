import test from "node:test";
import assert from "node:assert/strict";
import { claimVerification, type VerificationStore } from "../src/routes/proofVerify.js";

const expected = { object: "running shoes", gesture: "thumbs up" };

/** In-memory ProofVerification table. Reads yield to the event loop first, so concurrent requests interleave. */
function memoryStore() {
  const row = { id: "v1", wallet: "W", proofHash: "ab".repeat(32), expectedObject: "running shoes", expectedGesture: "thumbs up", status: "PASS", usedAt: null as Date | null, createdAt: new Date() };
  const store: VerificationStore = {
    async findUnique({ where }) {
      await new Promise((r) => setImmediate(r));
      return where.id === row.id ? ({ ...row } as any) : null;
    },
    async updateMany({ where, data }) {
      // A conditional UPDATE is atomic in Postgres; here it runs within one tick.
      if (where.id !== row.id || row.usedAt !== null) return { count: 0 };
      row.usedAt = data.usedAt;
      return { count: 1 };
    },
  };
  return { store, row };
}

test("two concurrent requests with the same verificationId: exactly one claims it", async () => {
  const { store, row } = memoryStore();
  const results = await Promise.all([claimVerification("v1", "W", expected, store), claimVerification("v1", "W", expected, store)]);
  const won = results.filter((r) => "verification" in r);
  const lost = results.filter((r) => "error" in r) as Array<{ error: string }>;
  assert.equal(won.length, 1);
  assert.equal(lost.length, 1);
  assert.match(lost[0].error, /already used/);
  assert.ok(row.usedAt, "the claim happens before any work");
});

test("a used or mismatched check is rejected before the conditional update", async () => {
  const { store, row } = memoryStore();
  assert.match((await claimVerification("v1", "W", { ...expected, gesture: "open palm facing the camera" }, store) as { error: string }).error, /different/);
  assert.equal(row.usedAt, null, "a rejected request does not consume the check");
  assert.ok("verification" in await claimVerification("v1", "W", expected, store));
  assert.match((await claimVerification("v1", "W", expected, store) as { error: string }).error, /already used/);
  assert.match((await claimVerification("v1", "someone-else", expected, store) as { error: string }).error, /not found/);
});
