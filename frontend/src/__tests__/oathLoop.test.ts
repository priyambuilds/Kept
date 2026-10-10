import { SKR_UNIT } from "@kept/config";
import { createMockApi } from "@/api";
import { clock } from "@/api/mock/clock";
import { MOCK_WALLET } from "@/api/mock/slices";
import { dailyTarget } from "@/api/proofTarget";
import { createMockTx } from "@/chain/mock";
import { mockOaths, PEOPLE } from "@/features/oaths/mockStore";
import { oathView } from "@/features/oaths/model";
import type { Scenario } from "@/api/mock/scenarios";

let scenario: Scenario = "fresh";
const api = createMockApi({ scenario: () => scenario, wallet: () => MOCK_WALLET, latencyMs: 0 });
const tx = createMockTx(() => scenario, () => MOCK_WALLET, 0);
const now = () => Math.floor(clock.now() / 1000);

beforeEach(() => { mockOaths.reset(); clock.reset(); scenario = "fresh"; });
afterAll(() => clock.reset());

describe("mock Oath loop", () => {
  it("create → join → start → prove both photos → settle → claim", async () => {
    const { oath: id } = await tx.createOath({ objectId: 0, numDays: 3, stake: 1000n * SKR_UNIT, goalText: "lift", tzOffsetMinutes: 0, isSolo: false, reviewMode: "ai" });
    mockOaths.join(id, PEOPLE.riya.wallet);
    let o = await api.oaths.get(id);
    expect(oathView(o, now(), MOCK_WALLET).life).toBe("open");
    await tx.startOath(id);
    o = await api.oaths.get(id);
    expect(oathView(o, now(), MOCK_WALLET).life).toBe("waiting"); // day 1 starts at the next midnight (D-6)

    clock.endDay();
    o = await api.oaths.get(id);
    let v = oathView(o, now(), MOCK_WALLET);
    expect(v.life).toBe("active");
    expect(v.dayNumber).toBe(1);
    const c1 = await api.proof.challenge(o, 1, 0);
    await expect(api.proof.submit(o, c1, "img")).resolves.toEqual({ status: "pass" });
    expect(oathView(await api.oaths.get(id), now(), MOCK_WALLET).members[0]!.cells[0]).toBe("h");
    const c2 = await api.proof.challenge(o, 2, 0, c1.gesture);
    expect(c2.gesture).not.toBe(c1.gesture);
    await api.proof.submit(o, c2, "img");
    expect(oathView(await api.oaths.get(id), now(), MOCK_WALLET).members[0]!.cells[0]).toBe("k");

    for (let d = 0; d < 3; d++) clock.endDay(); // Riya (reliable) keeps the rest; we miss days 2–3
    o = await api.oaths.get(id);
    v = oathView(o, now(), MOCK_WALLET);
    expect(o.status).toBe("settled");
    expect(v.claimable).toBeGreaterThan(0n);
    const { amount } = await tx.claim(id);
    expect(amount).toBe(v.claimable);
    expect(oathView(await api.oaths.get(id), now(), MOCK_WALLET).claimable).toBe(0n);
  });

  it("scenarios seed the prototype's Today", async () => {
    scenario = "activeGroup";
    const list = await api.oaths.list(MOCK_WALLET);
    const views = list.map((f) => oathView(f, now(), MOCK_WALLET));
    const iron = views.find((v) => v.life === "active" && !v.facts.isSolo)!;
    expect(iron.dayNumber).toBe(3);
    expect(iron.members.map((m) => m.cells.slice(0, 3))).toEqual(["kkh", "kkk", "kmp", "kkr"]);
    expect(views.some((v) => v.life === "open")).toBe(true);
    expect(views.some((v) => v.claimable > 0n)).toBe(true);
    scenario = "lowHp";
    const low = (await api.oaths.list(MOCK_WALLET)).map((f) => oathView(f, now(), MOCK_WALLET));
    expect(low[0]!.hp).toBe(20);
  });

  it("forced failures come from the scenario", async () => {
    scenario = "walletRejected";
    await expect(tx.startOath("x")).rejects.toMatchObject({ kind: "rejected" });
    scenario = "noSkr";
    await expect(tx.joinOath("x")).rejects.toMatchObject({ kind: "insufficientSkr" });
  });

  it("mirrors the backend's daily proof target", () => {
    // Expected values computed with Node's crypto exactly as backend/src/routes/v4.ts:226 does.
    expect(dailyTarget("42", 0, 1)).toEqual({ object: "book", gesture: "thumbs_up" });
    expect(dailyTarget("1728000000123", 3, 0)).toEqual({ object: "dumbbell", gesture: "open_palm" });
  });
});
