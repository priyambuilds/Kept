// The photo-history routes were removed: passed photos are hash-only, so there is nothing to list.
// Pending group-review photos stay available through GET /api/oaths/:oath/reviews.
import test from "node:test";
import assert from "node:assert/strict";

process.env.SESSION_SECRET ??= "photo-routes-test-secret"; // read by config.ts at import time
const { v4Router } = await import("../src/routes/v4.js");

const OATH = "0ath11111111111111111111111111111111111111";
/** GET route layers of the production router whose path matches `url` (Express's own matcher). */
const getRoutesMatching = (url: string) => (v4Router as any).stack.filter((l: any) => l.route?.methods.get && l.match(url)).map((l: any) => l.route.path);

test("no GET route serves photo history or photo files", () => {
  for (const url of [`/api/photos/${OATH}/1`, "/api/photos/file/abc.jpg"]) assert.deepEqual(getRoutesMatching(url), [], url);
  const declared = (v4Router as any).stack.filter((l: any) => l.route?.path?.startsWith?.("/api/photos")).map((l: any) => l.route.path);
  assert.deepEqual(declared, []);
});

test("pending review photos are still served by the reviews route, and voting stays available", () => {
  assert.deepEqual(getRoutesMatching(`/api/oaths/${OATH}/reviews`), ["/api/oaths/:oath/reviews"]);
  const vote = (v4Router as any).stack.find((l: any) => l.route?.path === "/api/reviews/:id");
  assert.ok(vote?.route.methods.post);
});
