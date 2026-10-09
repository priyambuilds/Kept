// HTTP tests for GET /bounty/:id/recently-out: real authenticate middleware + route handler, in-memory store.
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

process.env.SESSION_SECRET = "recently-out-test-secret"; // read by config.ts at import time

const { default: express } = await import("express");
const { authenticate, issueSession } = await import("../src/auth.js");
const { bountyRouter, recentlyOutHandler } = await import("../src/routes/bounty.js");

const WALLET = "11111111111111111111111111111111";
const t = (iso: string) => new Date(iso);
const entries = [
  { wallet: "C-old", outDay: 0, outAt: t("2026-10-01T10:00:00Z") },
  { wallet: "A-new", outDay: 2, outAt: t("2026-10-03T10:00:00Z") },
  { wallet: "Z-legacy", outDay: 1, outAt: null },
  { wallet: "B-tie", outDay: 1, outAt: t("2026-10-02T10:00:00Z") },
  { wallet: "A-tie", outDay: 1, outAt: t("2026-10-02T10:00:00Z") },
  { wallet: "Y-legacy", outDay: 0, outAt: null },
];
const store = {
  findBounty: async (id: number) => (id === 7 ? { id: 7 } : null),
  outEntries: async (bountyId: number) => (bountyId === 7 ? entries : []),
};

let server: Server;
let base = "";
before(async () => {
  const app = express();
  app.get("/bounty/:id/recently-out", authenticate, recentlyOutHandler(store));
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

const token = () => issueSession(WALLET);
const get = (path: string, auth = true) => fetch(base + path, { headers: auth ? { authorization: `Bearer ${token()}` } : {} });

test("the production router mounts the route behind authenticate", () => {
  const layer = (bountyRouter as any).stack.find((l: any) => l.route?.path === "/bounty/:id/recently-out");
  assert.ok(layer, "route is registered");
  assert.ok(layer.route.methods.get);
  assert.equal(layer.route.stack[0].handle, authenticate);
});

test("requires sign-in", async () => {
  const res = await get("/bounty/7/recently-out", false);
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: "Sign-in required" });
  const bad = await fetch(base + "/bounty/7/recently-out", { headers: { authorization: "Bearer not.a-token" } });
  assert.equal(bad.status, 401);
});

test("unknown or malformed bounty id → standard 404", async () => {
  for (const id of ["999", "abc", "0", "-1", "1.5", "99999999999"]) {
    const res = await get(`/bounty/${id}/recently-out`);
    assert.equal(res.status, 404, id);
    assert.deepEqual(await res.json(), { error: "Bounty not found" });
  }
});

test("returns knockouts newest first, untimed ones last, ties by outDay then wallet", async () => {
  const res = await get("/bounty/7/recently-out");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.bountyId, 7);
  assert.equal(body.total, 6);
  assert.deepEqual(body.entries.map((e: any) => e.wallet), ["A-new", "A-tie", "B-tie", "C-old", "Z-legacy", "Y-legacy"]);
  assert.deepEqual(body.entries[0], { wallet: "A-new", outDay: 2, outAt: "2026-10-03T10:00:00.000Z" });
  assert.deepEqual(body.entries[4], { wallet: "Z-legacy", outDay: 1, outAt: null });
});

test("limit trims the list but total counts every knockout; bad limits are 400", async () => {
  const body = await (await get("/bounty/7/recently-out?limit=2")).json();
  assert.deepEqual(body.entries.map((e: any) => e.wallet), ["A-new", "A-tie"]);
  assert.equal(body.total, 6);
  for (const limit of ["0", "101", "abc", "2.5"]) {
    const res = await get(`/bounty/7/recently-out?limit=${limit}`);
    assert.equal(res.status, 400, limit);
  }
});
