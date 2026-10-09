// The mock "chain + backend" for Oaths: in-memory, seeded per Dev scenario relative to the virtual
// clock, and mutated by the mock TxService and the mock proof API. Days roll forward on read (other
// members prove on their own), and an Oath settles with the engine's numbers once its last day ends.
import { SKR_UNIT, STAKES_SKR } from "@kept/config";
import { nextMidnight, simulate, marksFromBitmasks, settlement } from "@kept/engine";
import { clock } from "@/api/mock/clock";
import type { Scenario } from "@/api/mock/scenarios";
import type { MemberFacts, OathFacts, ProofToday, ReviewMode } from "./model";
import { oathName } from "./names";

const DAY = 86_400;
const now = () => Math.floor(clock.now() / 1000);
const tz = () => -new Date(clock.now()).getTimezoneOffset();
const skr = (n: number) => BigInt(n) * SKR_UNIT;

/** The other people in the prototype, with their kept rates from copy.json (D2 › KEEPERS). */
export const PEOPLE = {
  riya: { wallet: "RiyaQ9mZ3LbVd2RtYc8NfH4uJs6WgA1oPqE5rTk3F9q", name: "Riya", avatar: "61302120", keptRate: 0.94, rateDays: 71, reliable: true },
  arjun: { wallet: "ArjunZ3LbVd2RtYc8NfH4uJs6WgA1oPqE5rTk3F9qm", name: "Arjun", avatar: "22413031", keptRate: 0.78, rateDays: 40, reliable: false },
  dev: { wallet: "DevQe9mZ3LbVd2RtYc8NfH4uJs6WgA1oPqE5rTk3F9", name: "Dev", avatar: "70114253", keptRate: 0.88, rateDays: 52, reliable: true },
} as const;
type Person = keyof typeof PEOPLE;

interface MockMember extends MemberFacts { reliable: boolean; proofDay: number }
interface MockOath extends Omit<OathFacts, "members"> { members: MockMember[]; seeded: boolean }

const oaths = new Map<string, MockOath>();
let seededFor: string | null = null;
let counter = 0;

function me(wallet: string, extra: Partial<MockMember> = {}): MockMember {
  return { wallet, name: null, avatar: null, keptRate: 0.91, rateDays: 64, daysKept: 0, proofToday: "none", proofDay: -1, claimed: false, payout: null, reliable: false, ...extra };
}
function person(p: Person, daysKept: number, today: ProofToday = "none", day = -1): MockMember {
  const x = PEOPLE[p];
  return { wallet: x.wallet, name: x.name, avatar: x.avatar, keptRate: x.keptRate, rateDays: x.rateDays, daysKept, proofToday: today, proofDay: day, claimed: false, payout: null, reliable: x.reliable };
}

/** A day-1 start time that puts "now" `dayIndex` days in, with `secondsLeft` left in today. */
function startFor(dayIndex: number, secondsLeft: number): number {
  return now() + secondsLeft - (dayIndex + 1) * DAY;
}
const mask = (pattern: string) => [...pattern].reduce((m, c, d) => (c === "k" ? m | (1 << d) : m), 0);

function add(o: Omit<MockOath, "id" | "createdAt" | "source" | "inviteCode" | "daySeconds" | "oathId"> & Partial<Pick<MockOath, "inviteCode">>): MockOath {
  const id = `mock-oath-${++counter}`;
  const full: MockOath = { id, source: "mock", oathId: null, createdAt: now() - counter, daySeconds: DAY, inviteCode: o.inviteCode ?? `${o.name.split(" ")[0]!.toUpperCase()}-${(1000 + counter).toString(36).toUpperCase()}`, ...o };
  oaths.set(id, full);
  return full;
}

const group = (name: string, objectId: number, numDays: number, stakeSkr: number, wallet: string, members: MockMember[], extra: Partial<MockOath> = {}) =>
  add({ name, goal: null, objectId, numDays, stake: skr(stakeSkr), isSolo: false, reviewMode: "ai_group", status: "active", day1StartsAt: null, creator: PEOPLE.riya.wallet, members, seeded: true, ...extra });

/** Seeds the store for a scenario (docs/ARCHITECTURE.md §6). Keeps Oaths the user created. */
export function seed(scenario: Scenario, wallet: string) {
  for (const [id, o] of oaths) if (o.seeded) oaths.delete(id);
  seededFor = `${scenario}:${wallet}`;
  const t = now();
  const today = 2; // "Day 3/7"
  const left = (h: number, m = 0) => h * 3600 + m * 60;
  if (scenario === "fresh") return;

  if (scenario === "settledKept" || scenario === "settledMissed") {
    const missed = scenario === "settledMissed";
    group("Iron Week", 0, 7, 1000, wallet, [me(wallet, { daysKept: mask(missed ? "kkkmkmk" : "kkkkkkk") }), person("riya", mask("kkkkkkk")), person("arjun", mask("kmkkkkm")), person("dev", mask("kkkkkkk"))],
      { creator: wallet, goal: "lift for 20 minutes", day1StartsAt: t - 7 * DAY - 60 });
    return;
  }
  if (scenario === "broken") {
    group("Guitar Days", 3, 7, 1000, wallet, [me(wallet, { daysKept: mask("kkkkkk") }), person("riya", mask("kkkkkk")), person("arjun", mask("kmkkkm")), person("dev", mask("kkkkmk"))],
      { goal: "practise guitar for 30 min", day1StartsAt: t - 6 * DAY - 60 });
    return;
  }

  // The prototype's Today: Iron Week (group, day 3), Read 20 pages (solo, day 9), a waiting Oath and a claim.
  const deadline = scenario === "deadlineClose";
  const allDone = scenario === "allDone";
  const low = scenario === "lowHp";
  const secondsLeft = deadline ? left(1, 42) : allDone ? left(5, 2) : left(9, 18);
  if (low) {
    group("Iron Week", 0, 7, 1000, wallet, [me(wallet, { daysKept: mask("kkkk") }), person("riya", mask("kkkk"), "kept", 4), person("arjun", mask("mmkm")), person("dev", mask("mmmk"))],
      { creator: PEOPLE.riya.wallet, goal: "lift for 20 minutes", day1StartsAt: startFor(4, secondsLeft) });
  } else {
    group("Iron Week", 0, 7, 1000, wallet, [
      me(wallet, { daysKept: mask("kk"), proofToday: allDone ? "kept" : deadline ? "none" : "photo1", proofDay: today }),
      person("riya", mask("kk"), "kept", today), person("arjun", mask("km"), allDone ? "kept" : "none", today), person("dev", mask("kk"), allDone ? "kept" : "review", today),
    ], { creator: PEOPLE.riya.wallet, goal: "lift for 20 minutes", day1StartsAt: startFor(today, secondsLeft) });
  }
  if (!deadline) {
    add({ name: "Read 20 pages", goal: "read 20 pages", objectId: 1, numDays: 14, stake: skr(500), isSolo: true, reviewMode: "ai", status: "active", creator: wallet,
      day1StartsAt: startFor(8, secondsLeft), members: [me(wallet, { daysKept: mask("kkkkkkkk"), proofToday: "kept", proofDay: 8 })], seeded: true });
  }
  group("Iron Week", 0, 7, 1000, wallet, [me(wallet), person("riya", 0)], { status: "open", creator: wallet, goal: "lift for 20 minutes", inviteCode: "IRON-7K2Q" });
  group("Hydra 14", 2, 14, 1000, wallet, [me(wallet, { daysKept: mask("kkkkkkkkkkkkkk") }), person("riya", mask("kkkkkkkkkkkkkk")), person("arjun", mask("kkkmkkkkkmkkkk")), person("dev", mask("kkkkkkkkkkkkkk"))],
    { goal: "drink 2 litres of water", day1StartsAt: t - 16 * DAY });
}

/** Rolls every Oath forward to "now": other members prove, finished Oaths settle (engine numbers). */
function roll(o: MockOath) {
  if (o.status !== "active" || o.day1StartsAt === null) return;
  const t = now();
  const day = Math.floor((t - o.day1StartsAt) / o.daySeconds);
  if (day >= o.numDays) {
    const finals = settlement(simulate({ stake: o.stake, days: o.numDays, members: o.members.length, solo: o.isSolo }, marksFromBitmasks(o.members.map((m) => m.daysKept), o.numDays)));
    o.status = "settled";
    o.members.forEach((m, i) => { m.payout = finals[i]!.final; m.proofToday = "none"; });
    return;
  }
  for (const m of o.members) {
    if (day < 0) continue;
    if (m.proofDay !== day) {
      // A new day: reliable people keep straight away, everyone else starts from nothing.
      m.proofDay = day;
      m.proofToday = m.reliable ? "kept" : "none";
      if (m.reliable) m.daysKept |= 1 << day;
    }
  }
}

function facts(o: MockOath): OathFacts {
  roll(o);
  const t = now();
  const day = o.day1StartsAt === null ? -1 : Math.floor((t - o.day1StartsAt) / o.daySeconds);
  return { ...o, members: o.members.map(({ reliable: _r, proofDay, ...m }) => ({ ...m, proofToday: proofDay === day ? m.proofToday : "none" })) };
}

export const mockOaths = {
  ensureSeeded(scenario: Scenario, wallet: string) { if (seededFor !== `${scenario}:${wallet}`) seed(scenario, wallet); },
  /** Oaths `wallet` is in. `seeded: false` lists only Oaths created on this device (hybrid mode). */
  list(wallet: string, opts: { seeded: boolean }): OathFacts[] {
    return [...oaths.values()].filter((o) => (opts.seeded || !o.seeded) && o.members.some((m) => m.wallet === wallet)).map(facts);
  },
  get(id: string): OathFacts | null { const o = oaths.get(id); return o ? facts(o) : null; },
  byCode(code: string): OathFacts | null {
    const o = [...oaths.values()].find((x) => x.inviteCode?.toUpperCase() === code.toUpperCase());
    return o ? facts(o) : null;
  },
  /** For the E1 mock: an Open group Oath anyone can join with this code. */
  inviteFor(code: string, wallet: string): OathFacts {
    const existing = mockOaths.byCode(code);
    if (existing) return existing;
    const o = group("Iron Week", 0, 7, STAKES_SKR[1], wallet, [person("riya", 0), person("dev", 0), person("arjun", 0)], { status: "open", creator: PEOPLE.riya.wallet, goal: "lift for 20 minutes", inviteCode: code.toUpperCase() });
    return facts(o);
  },

  create(d: { wallet: string; goal: string; objectId: number; numDays: number; stake: bigint; isSolo: boolean; reviewMode: ReviewMode }): OathFacts {
    const o = add({ name: oathName(d.objectId, d.numDays), goal: d.goal, objectId: d.objectId, numDays: d.numDays, stake: d.stake, isSolo: d.isSolo, reviewMode: d.reviewMode,
      status: "open", creator: d.wallet, day1StartsAt: null, members: [me(d.wallet)], seeded: false });
    return facts(o);
  },
  join(id: string, wallet: string) { const o = need(id); if (!o.members.some((m) => m.wallet === wallet)) o.members.push(me(wallet)); },
  leave(id: string, wallet: string) { const o = need(id); o.members = o.members.filter((m) => m.wallet !== wallet); },
  /** Start: day 1 begins at the first midnight after Start (D-6). */
  start(id: string) { const o = need(id); o.status = "active"; o.day1StartsAt = nextMidnight(now(), tz()); },
  cancel(id: string) { const o = need(id); o.status = "cancelled"; o.members.forEach((m) => { m.payout = o.stake; }); },
  claim(id: string, wallet: string): bigint {
    const m = need(id).members.find((x) => x.wallet === wallet);
    if (!m || m.claimed || m.payout === null) throw new Error("nothing to claim");
    m.claimed = true;
    return m.payout;
  },
  /** Proof progress for the user today. */
  prove(id: string, wallet: string, status: ProofToday) {
    const o = need(id);
    roll(o);
    const m = o.members.find((x) => x.wallet === wallet);
    if (!m || o.day1StartsAt === null) return;
    const day = Math.floor((now() - o.day1StartsAt) / o.daySeconds);
    m.proofDay = day;
    m.proofToday = status;
    if (status === "kept") m.daysKept |= 1 << day;
  },
  /** Tests only. */
  reset() { oaths.clear(); seededFor = null; counter = 0; },
};

function need(id: string): MockOath {
  const o = oaths.get(id);
  if (!o) throw new Error(`mock: no Oath ${id}`);
  return o;
}
