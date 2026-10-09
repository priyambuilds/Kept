import { SKR_UNIT } from "@kept/config";
import { createApi, createMockApi } from "@/api";
import type { Slice, SliceMode } from "@/api";
import { ApiError, toApiError } from "@/api/errors";
import { createHttpClient } from "@/api/http/client";
import { MOCK_WALLET } from "@/api/mock/slices";
import type { Scenario } from "@/api/mock/scenarios";
import { clock } from "@/api/mock/clock";
import { SLICES } from "@/api/types";
import { classifyTxError } from "@/chain/classify";
import { createMockWallet } from "@/chain/mock";
import { signIn } from "@/features/auth";
import { defaultFlags } from "@/state/dev";
import { useSession } from "@/state/session";
import { Address, NonceResponse } from "@kept/shared";

const allMock = Object.fromEntries(SLICES.map((s) => [s, "mock"])) as Record<Slice, SliceMode>;
function mockApi(scenario: Scenario = "activeGroup") {
  return createMockApi({ scenario: () => scenario, wallet: () => MOCK_WALLET, latencyMs: 0 });
}

describe("errors", () => {
  it("maps statuses per route, and the Genesis 403 by its message", () => {
    expect(toApiError("GET /api/invites/X", 404, { error: "Invite not found" }).code).toBe("INVITE_NOT_FOUND");
    expect(toApiError("POST /api/faucet", 429, { error: "used" }).code).toBe("FAUCET_USED");
    expect(toApiError("GET /api/me", 409, { error: "bound" }).code).toBe("GENESIS_TAKEN");
    expect(toApiError("GET /api/price", 403, { error: "A Seeker Genesis Token is required" }).code).toBe("NOT_ELIGIBLE");
    expect(toApiError("POST /api/nudges", 403, { error: "Not a member" }).code).toBe("UNAUTHORIZED");
    expect(toApiError("GET /api/price", 500, "boom").code).toBe("SERVER");
  });
  it("prefers a code the backend sends (BACKEND_GAPS P1-14)", () => {
    expect(toApiError("POST /api/x", 400, { error: "late", code: "OATH_STARTED" }).code).toBe("OATH_STARTED");
  });
});

describe("http client", () => {
  const ok = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));
  it("sends the bearer token and validates the response", async () => {
    const fetchImpl = jest.fn(() => ok({ message: "sign me" }));
    const c = createHttpClient(() => "tok", "http://api", fetchImpl as unknown as typeof fetch);
    await expect(c.post("/api/auth/nonce", { wallet: MOCK_WALLET }, NonceResponse)).resolves.toEqual({ message: "sign me" });
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok");
  });
  it("turns a network failure into OFFLINE and a bad body into SERVER", async () => {
    const down = createHttpClient(() => null, "http://api", (() => Promise.reject(new TypeError("Network request failed"))) as unknown as typeof fetch);
    await expect(down.get("/api/me", NonceResponse)).rejects.toMatchObject({ code: "OFFLINE" });
    const odd = createHttpClient(() => null, "http://api", (() => ok({ nope: 1 })) as unknown as typeof fetch);
    await expect(odd.get("/api/me", NonceResponse)).rejects.toMatchObject({ code: "SERVER" });
  });
});

describe("createApi", () => {
  it("picks http or mock per slice", () => {
    const mock = mockApi();
    const api = createApi({ ...allMock, auth: "http" }, mock, () => null);
    expect(api.inbox).toBe(mock.inbox);
    expect(api.auth).not.toBe(mock.auth);
  });
});

describe("flags", () => {
  it("Demo is the mock for every slice; Live and not-chosen are http for every slice", () => {
    expect(SLICES.every((s) => defaultFlags("demo")[s] === "mock")).toBe(true);
    expect(SLICES.every((s) => defaultFlags("live")[s] === "http")).toBe(true);
    expect(SLICES.every((s) => defaultFlags(null)[s] === "http")).toBe(true);
  });
});

describe("mock api", () => {
  it("fixtures pass the shared schemas", () => {
    expect(Address.safeParse(MOCK_WALLET).success).toBe(true);
  });
  it("inbox unread counts items needing action, and markDone clears them", async () => {
    const api = mockApi();
    const first = await api.inbox.list();
    expect(first.unread).toBe(first.items.filter((i) => i.needsAction).length);
    await api.inbox.markDone(["inv1"]);
    expect((await api.inbox.list()).unread).toBe(first.unread - 1);
  });
  it("scenarios drive eligibility, balances and offline", async () => {
    expect((await mockApi("notEligible").auth.me()).genesis).toBe(false);
    expect((await mockApi().auth.me()).genesis).toBe(true);
    expect((await mockApi("noSkr").wallet.balances(MOCK_WALLET)).skr).toBe(620n * SKR_UNIT);
    await expect(mockApi("offline").inbox.list()).rejects.toBeInstanceOf(ApiError);
    expect((await mockApi("fresh").inbox.list()).items).toHaveLength(0);
  });
  it("faucet pays once", async () => {
    const api = mockApi();
    await expect(api.wallet.faucet()).resolves.toMatchObject({ amount: 5000n * SKR_UNIT });
    await expect(api.wallet.faucet()).rejects.toMatchObject({ code: "FAUCET_USED" });
  });
  it("the virtual clock jumps to the deadline and the next day", () => {
    clock.toDeadline();
    expect(new Date(clock.now()).getHours()).toBe(22);
    clock.endDay();
    expect(new Date(clock.now()).getHours()).toBe(0);
    clock.reset();
    expect(Math.abs(clock.now() - Date.now())).toBeLessThan(50);
  });
});

describe("sign-in", () => {
  beforeEach(() => useSession.getState().signOut());
  it("signs in with the wallet and stores token + Genesis", async () => {
    const r = await signIn(mockApi(), createMockWallet(() => "activeGroup", 0));
    expect(r).toEqual({ wallet: MOCK_WALLET, genesis: true });
    expect(useSession.getState().token).toBe(`mock.${MOCK_WALLET}`);
  });
  it("reports a declined signature as rejected", async () => {
    await expect(signIn(mockApi(), createMockWallet(() => "walletRejected", 0))).rejects.toMatchObject({ kind: "rejected" });
    expect(useSession.getState().token).toBeNull();
  });
  it("non-Seekers sign in with genesis false", async () => {
    expect((await signIn(mockApi("notEligible"), createMockWallet(() => "notEligible", 0))).genesis).toBe(false);
  });
});

describe("classifyTxError", () => {
  const protocol = (code: number) => Object.assign(new Error("x"), { name: "SolanaMobileWalletAdapterProtocolError", code });
  it.each([
    [protocol(-3), "rejected"],
    [Object.assign(new Error("x"), { name: "SolanaMobileWalletAdapterError", code: "ERROR_ASSOCIATION_CANCELLED" }), "rejected"],
    [new Error("Network request failed"), "offline"],
    [new Error("Simulation failed: Attempt to debit an account but found no record of a prior credit."), "insufficientSol"],
    [new Error("Program log: Error: insufficient funds\ncustom program error: 0x1"), "insufficientSkr"],
    [new Error("custom program error: 0x1771"), "failed"],
  ])("%s → %s", (e, kind) => {
    expect(classifyTxError(e).kind).toBe(kind);
  });
});
