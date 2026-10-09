// Mock group review (no backend yet: BACKEND_GAPS P1-1). After 3 failed photo-2 checks an
// "AI + group review" Oath can send photo 2 to the other members; majority approves, a tie rejects
// (screens.md C5). The other members vote on their own as the virtual clock moves.
import { clock } from "@/api/mock/clock";
import { mockOaths, PEOPLE } from "../oaths/mockStore";

const now = () => Math.floor(clock.now() / 1000);
const TTL = 48 * 3600;
/** Simulated voters take this long (virtual seconds) to vote. */
const VOTE_DELAY = 20;

export type ReviewStatus = "pending" | "approved" | "rejected" | "expired";
export interface ReviewFacts {
  id: string;
  oathId: string;
  /** Who asked for the review. */
  by: string;
  dayIndex: number;
  objectId: number;
  gesture: "thumbs_up" | "victory" | "open_palm";
  /** wallet → approve? */
  votes: Record<string, boolean>;
  /** Everyone except the requester. */
  voters: string[];
  createdAt: number;
  expiresAt: number;
  status: ReviewStatus;
}

const reviews = new Map<string, ReviewFacts>();
let counter = 0;

function tally(r: ReviewFacts): ReviewStatus {
  const yes = Object.values(r.votes).filter(Boolean).length;
  const no = Object.values(r.votes).length - yes;
  const majority = Math.floor(r.voters.length / 2) + 1;
  if (yes >= majority) return "approved";
  if (no >= majority || Object.keys(r.votes).length === r.voters.length) return "rejected"; // a tie rejects
  return now() > r.expiresAt ? "expired" : "pending";
}

/** Simulated members (everyone but the real user) vote approve after a short delay. */
function roll(r: ReviewFacts, me: string) {
  if (r.status !== "pending") return;
  if (now() - r.createdAt >= VOTE_DELAY) {
    for (const v of r.voters) if (v !== me && r.votes[v] === undefined) r.votes[v] = true;
  }
  const s = tally(r);
  if (s !== "pending") {
    r.status = s;
    mockOaths.decideReview(r.oathId, r.by, s === "approved");
  }
}

export const mockReviews = {
  reset() { reviews.clear(); counter = 0; },
  /** F4a·g: the user asks their group. One review per member per day. */
  request(o: { id: string; objectId: number; members: { wallet: string }[] }, by: string, dayIndex: number, gesture: ReviewFacts["gesture"]): ReviewFacts {
    const existing = [...reviews.values()].find((r) => r.oathId === o.id && r.by === by && r.dayIndex === dayIndex);
    if (existing) return existing;
    const r: ReviewFacts = {
      id: `mock-review-${++counter}`, oathId: o.id, by, dayIndex, objectId: o.objectId, gesture, votes: {},
      voters: o.members.map((m) => m.wallet).filter((w) => w !== by), createdAt: now(), expiresAt: now() + TTL, status: "pending",
    };
    reviews.set(r.id, r);
    mockOaths.prove(o.id, by, "review");
    return r;
  },
  /** The prototype's D2: Dev asked, Riya already approved (seeded with the Oath). */
  seedFor(oathId: string, objectId: number, members: string[], dayIndex: number) {
    if ([...reviews.values()].some((r) => r.oathId === oathId)) return;
    const r: ReviewFacts = {
      id: `mock-review-${++counter}`, oathId, by: PEOPLE.dev.wallet, dayIndex, objectId, gesture: "open_palm",
      votes: { [PEOPLE.riya.wallet]: true }, voters: members.filter((w) => w !== PEOPLE.dev.wallet),
      createdAt: now() - 7 * 3600, expiresAt: now() + 41 * 3600, status: "pending",
    };
    reviews.set(r.id, r);
  },
  get(id: string, me: string): ReviewFacts | null {
    const r = reviews.get(id);
    if (!r) return null;
    roll(r, me);
    return { ...r, votes: { ...r.votes } };
  },
  /** Pending reviews on an Oath that `me` can vote on. */
  openFor(oathId: string, me: string): ReviewFacts[] {
    return [...reviews.values()].filter((r) => r.oathId === oathId && r.by !== me && r.status === "pending" && r.votes[me] === undefined).map((r) => ({ ...r }));
  },
  mine(oathId: string, me: string, dayIndex: number): ReviewFacts | null {
    const r = [...reviews.values()].find((x) => x.oathId === oathId && x.by === me && x.dayIndex === dayIndex);
    if (!r) return null;
    roll(r, me);
    return { ...r };
  },
  vote(id: string, me: string, approve: boolean) {
    const r = reviews.get(id);
    if (!r || r.status !== "pending") return;
    r.votes[me] = approve;
    const s = tally(r);
    if (s !== "pending") { r.status = s; mockOaths.decideReview(r.oathId, r.by, s === "approved"); }
  },
};
