// Mock Bounties, Rematch and group review (BACKEND_GAPS P1-10, P1-2, P1-1), on the mock stores.
import { mockBounties } from "@/features/bounties/mockStore";
import { mockOaths } from "@/features/oaths/mockStore";
import { mockReviews } from "@/features/reviews/mockStore";
import { ApiError } from "../errors";
import { clock } from "@/lib/clock";
import type { BountiesApi, RematchApi, ReviewsApi } from "../types";
import type { MockContext } from "./slices";
import { MOCK_WALLET } from "./slices";

const REMATCH_WINDOW = 7 * 86_400;

async function delay(ctx: MockContext) {
  if (ctx.latencyMs) await new Promise((r) => setTimeout(r, ctx.latencyMs));
  if (ctx.scenario() === "offline") throw new ApiError("OFFLINE", "mock: offline scenario", 0, true);
}
const seeded = (ctx: MockContext) => mockOaths.ensureSeeded(ctx.scenario(), ctx.wallet() ?? MOCK_WALLET);
const notFound = (what: string) => new ApiError("NOT_FOUND", `mock: no ${what}`, 404);

export function mockBountiesApi(ctx: MockContext): BountiesApi {
  return {
    list: async () => { await delay(ctx); seeded(ctx); return mockBounties.list(); },
    get: async (id) => { await delay(ctx); seeded(ctx); const b = mockBounties.get(id); if (!b) throw notFound("Bounty"); return { ...b }; },
    join: async (id, wallet) => {
      await delay(ctx);
      const b = mockBounties.get(id);
      if (!b) throw notFound("Bounty");
      if (ctx.scenario() === "notEligible") throw new ApiError("NOT_ELIGIBLE", "mock: Bounties need a verified Seeker", 403);
      return mockOaths.joinBounty(b, wallet);
    },
    mine: async (id, wallet) => { await delay(ctx); seeded(ctx); return mockOaths.forBounty(id, wallet); },
    create: async (d, wallet) => { await delay(ctx); return mockBounties.create({ ...d, wallet }); },
  };
}

export function mockRematchApi(ctx: MockContext): RematchApi {
  return {
    offer: async (sourceId) => {
      await delay(ctx); seeded(ctx);
      const source = mockOaths.get(sourceId);
      if (!source || source.day1StartsAt === null) throw notFound("broken Oath");
      // The window opens when the Oath breaks (midnight after the breaking day) and lasts 7 days.
      // The last day boundary already passed (ceil put it a day in the future: 8 days left on R1).
      const brokeAt = source.day1StartsAt + Math.min(source.numDays, Math.floor((clock.now() / 1000 - source.day1StartsAt) / source.daySeconds)) * source.daySeconds;
      return { rematch: mockOaths.rematchFor(sourceId), closesAt: brokeAt + REMATCH_WINDOW };
    },
    join: async (sourceId, wallet) => { await delay(ctx); return mockOaths.joinRematch(sourceId, wallet); },
  };
}

export function mockReviewsApi(ctx: MockContext): ReviewsApi {
  const seedOpen = (oathId: string, me: string) => {
    const o = mockOaths.get(oathId);
    const asked = o?.members.find((m) => m.wallet !== me && m.proofToday === "review");
    if (o && asked && o.day1StartsAt !== null) {
      mockReviews.seedFor(o.id, o.objectId, o.members.map((m) => m.wallet), Math.floor((clock.now() / 1000 - o.day1StartsAt) / o.daySeconds));
    }
  };
  return {
    request: async (oath, by, dayIndex, gesture) => { await delay(ctx); return mockReviews.request(oath, by, dayIndex, gesture); },
    get: async (id, me) => { await delay(ctx); const r = mockReviews.get(id, me); if (!r) throw notFound("review"); return r; },
    mine: async (oathId, me, dayIndex) => { await delay(ctx); return mockReviews.mine(oathId, me, dayIndex); },
    openFor: async (oathId, me) => { await delay(ctx); seeded(ctx); seedOpen(oathId, me); return mockReviews.openFor(oathId, me); },
    vote: async (id, me, approve) => { await delay(ctx); mockReviews.vote(id, me, approve); },
  };
}
