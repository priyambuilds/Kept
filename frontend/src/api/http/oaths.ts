// Real Oaths: program accounts read over RPC, goal text from the backend, and the fields the backend
// can't store yet from the device (names, review mode, photo 1). Oaths created on the mock in hybrid
// mode (solo with a stake, D-30) are merged in so they still show up.
import { PublicKey } from "@solana/web3.js";
import { oathPda } from "@kept/chain";
import { DetailsResponse, GoalResponse, InviteCreateResponse, InviteResolveResponse, LegacyProofResponse } from "@kept/shared";
import { PROGRAM_ID, listOathsOf, readOath } from "@/chain/program";
import type { ChainOath } from "@/chain/program";
import { mockOaths } from "@/features/oaths/mockStore";
import { useDeviceOaths } from "@/features/oaths/device";
import type { OathFacts } from "@/features/oaths/model";
import { oathName } from "@/features/oaths/names";
import { clock } from "../mock/clock";
import { ApiError, isApiError } from "../errors";
import { dailyTarget } from "../proofTarget";
import type { OathsApi, ProofApi } from "../types";
import type { HttpClient } from "./client";

const isMockId = (id: string) => id.startsWith("mock-");

async function goalOf(c: HttpClient, oath: string): Promise<string | null> {
  const d = useDeviceOaths.getState();
  if (d.goals[oath]) return d.goals[oath]!;
  try {
    const { goalText } = await c.get(`/api/oaths/${oath}/details`, GoalResponse);
    if (goalText) d.remember(oath, { goal: goalText });
    return goalText;
  } catch {
    return null; // non-members and Genesis-less wallets get 403; the screen shows the name only
  }
}

export function toFacts(o: ChainOath, goal: string | null): OathFacts {
  const d = useDeviceOaths.getState();
  const started = o.status !== "open";
  const day = started ? Math.floor((Math.floor(clock.now() / 1000) - o.startTs) / o.daySeconds) : -1;
  return {
    id: o.address,
    source: "chain",
    oathId: o.oathId.toString(),
    creator: o.creator,
    name: d.names[o.address] ?? oathName(o.objectId, o.numDays),
    goal,
    objectId: o.objectId,
    numDays: o.numDays,
    stake: o.stake,
    isSolo: o.isSolo,
    reviewMode: d.reviewModes[o.address] ?? "ai",
    status: o.status,
    // Today the program starts day 1 at Start, in 24 h windows (BACKEND_GAPS P0-4).
    day1StartsAt: started ? o.startTs : null,
    daySeconds: o.daySeconds,
    members: o.members.map((m) => ({
      wallet: m.wallet, name: null, avatar: null, keptRate: null, rateDays: 0, daysKept: m.daysKept, claimed: m.claimed,
      payout: o.status === "settled" || o.status === "cancelled" ? m.payout : null,
      proofToday: d.photo1[o.address] === day ? "photo1" : "none",
    })),
    inviteCode: d.codes[o.address] ?? null,
    createdAt: o.startTs || Number(o.oathId % 1_000_000_000n),
  };
}

export const httpOaths = (c: HttpClient): OathsApi => ({
  list: async (wallet) => {
    const found = await listOathsOf(wallet).catch((e: unknown) => { throw new ApiError("OFFLINE", String(e), 0, true); });
    const known = useDeviceOaths.getState().known.filter((id) => !isMockId(id) && !found.some((o) => o.address === id));
    const extra = (await Promise.all(known.map((id) => readOath(id).catch(() => null)))).filter((o): o is ChainOath => !!o && o.members.some((m) => m.wallet === wallet));
    const chain = await Promise.all([...found, ...extra].map(async (o) => toFacts(o, await goalOf(c, o.address))));
    return [...chain, ...mockOaths.list(wallet, { seeded: false })];
  },
  get: async (id) => {
    if (isMockId(id)) { const m = mockOaths.get(id); if (m) return m; }
    const o = await readOath(id).catch((e: unknown) => { throw new ApiError("OFFLINE", String(e), 0, true); });
    if (!o) throw new ApiError("NOT_FOUND", `Oath ${id} not found`, 404);
    return toFacts(o, await goalOf(c, id));
  },
  byInvite: async (code) => {
    let r;
    try {
      r = await c.get(`/api/invites/${encodeURIComponent(code)}`, InviteResolveResponse);
    } catch (e) {
      throw isApiError(e) && e.status === 404 ? new ApiError("INVITE_NOT_FOUND", e.message, 404) : e;
    }
    // The invite returns OathRead without the account address; it's the PDA of creator + oath_id.
    const o = await readOath(oathPda(PROGRAM_ID, new PublicKey(r.oath.creator), BigInt(r.oath.oathId)).toBase58());
    if (!o) throw new ApiError("INVITE_NOT_FOUND", "Oath account not found", 404);
    return { oath: toFacts(o, r.goalText), alreadyStarted: r.alreadyStarted };
  },
  register: async (oath, goal) => {
    if (oath.source === "mock") return oath.inviteCode;
    await c.post("/api/oaths/details", { oath: oath.id, goalText: goal }, DetailsResponse);
    const code = oath.isSolo ? null : (await c.post("/api/invites", { oath: oath.id }, InviteCreateResponse)).code;
    await c.send("/api/oaths/watch", { oath: oath.id });
    useDeviceOaths.getState().remember(oath.id, { goal, ...(code ? { code } : {}) });
    return code;
  },
  watch: async (oath) => {
    if (oath.source === "mock") return;
    await c.send("/api/oaths/watch", { oath: oath.id });
    useDeviceOaths.getState().remember(oath.id);
  },
});

/**
 * Proof on chain Oaths: photo 1 has no backend step yet (BACKEND_GAPS P0-2), so it passes on the
 * device; photo 2 goes to POST /api/proof with today's target as the "detection" (dev force, D-23).
 * Mock Oaths use the mock proof API.
 */
export function httpProof(c: HttpClient, mock: ProofApi): ProofApi {
  return {
    challenge: async (oath, photo, dayIndex, avoid) => {
      if (oath.source === "mock" || !oath.oathId) return mock.challenge(oath, photo, dayIndex, avoid);
      const target = dailyTarget(oath.oathId, dayIndex, oath.objectId);
      // The backend checks one gesture per day; photo 1 (device-only) uses another so the two differ.
      const gesture = photo === 2 ? target.gesture : (await mock.challenge(oath, 1, dayIndex, target.gesture)).gesture;
      return { photo, dayIndex, objectId: oath.objectId, gesture, expiresAt: Math.floor(clock.now() / 1000) + 300 };
    },
    submit: async (oath, ch, image) => {
      if (oath.source === "mock" || !oath.oathId) return mock.submit(oath, ch, image);
      if (ch.photo === 1) {
        useDeviceOaths.getState().passPhoto1(oath.id, ch.dayIndex);
        return { status: "pass" };
      }
      const target = dailyTarget(oath.oathId, ch.dayIndex, oath.objectId);
      try {
        await c.post("/api/proof", {
          oath: oath.id, dayIndex: ch.dayIndex, photo: image,
          detection: { object: { label: target.object, confidence: 0.99 }, gesture: { label: target.gesture, confidence: 0.99 }, target },
        }, LegacyProofResponse);
        return { status: "pass" };
      } catch (e) {
        if (!isApiError(e)) throw e;
        if (e.code === "PROOF_FAIL") return { status: "fail", attempts: useDeviceOaths.getState().failPhoto2(oath.id, ch.dayIndex) };
        if (e.code === "PROOF_UNAVAILABLE" || e.status === 503) return { status: "unavailable" };
        if (e.code === "OUTSIDE_DAY_WINDOW") return { status: "expired" };
        throw e;
      }
    },
  };
}
