// Oath queries and actions for screens. Lists and single Oaths come from the `oaths` API slice and are
// turned into views with the engine; actions run the TxService for the Oath's source and then the
// backend follow-ups, then refresh the queries.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApi, useApi } from "@/api";
import { queryClient } from "@/api/queries";
import { getTx } from "@/chain";
import { SKR_UNIT } from "@kept/config";
import { flags, useDev } from "@/state/dev";
import { useSession } from "@/state/session";
import type { OathDraft } from "@/state/drafts";
import { useNow } from "../time";
import { useDeviceOaths } from "./device";
import { oathView } from "./model";
import type { OathFacts, OathSource, OathView } from "./model";
import { oathName } from "./names";

export const oathKeys = {
  all: ["oaths"] as const,
  list: (wallet: string | null) => ["oaths", "list", wallet] as const,
  one: (id: string) => ["oaths", "one", id] as const,
};

/** Refresh while a day is running so others' proofs and the day roll-over show up. */
const REFRESH_MS = 30_000;

export function useOathList() {
  const api = useApi();
  const wallet = useSession((s) => s.wallet);
  const scenario = useDev((s) => s.scenario);
  const q = useQuery({ queryKey: [...oathKeys.list(wallet), scenario], queryFn: () => api.oaths.list(wallet!), enabled: !!wallet, refetchInterval: REFRESH_MS });
  const now = useNow(1000);
  const names = useDeviceOaths((s) => s.names);
  const views = useMemo(() => (q.data ?? []).map((f) => oathView(withName(f, names), now, wallet)), [q.data, now, wallet, names]);
  return { ...q, views };
}

export function useOath(id: string | undefined) {
  const api = useApi();
  const wallet = useSession((s) => s.wallet);
  const scenario = useDev((s) => s.scenario);
  const q = useQuery({ queryKey: [...oathKeys.one(id ?? ""), scenario], queryFn: () => api.oaths.get(id!), enabled: !!id, refetchInterval: REFRESH_MS });
  const now = useNow(1000);
  const names = useDeviceOaths((s) => s.names);
  const view = useMemo(() => (q.data ? oathView(withName(q.data, names), now, wallet) : null), [q.data, now, wallet, names]);
  return { ...q, view };
}

const withName = (f: OathFacts, names: Record<string, string>): OathFacts => (names[f.id] ? { ...f, name: names[f.id]! } : f);

export const refreshOaths = () => queryClient.invalidateQueries({ queryKey: oathKeys.all });

/**
 * Where a new Oath is created (docs/BUILD_PLAN.md › Phase 3, DECISIONS D-30): the mock when the oaths
 * slice is mock; in hybrid, solo Oaths stay on the mock so they can carry a stake; otherwise the chain.
 */
export function createSource(d: OathDraft): OathSource {
  const f = flags();
  if (f.oaths === "mock") return "mock";
  if (d.isSolo && useDev.getState().overrides.oaths !== "http") return "mock";
  return "chain";
}

const tzOffset = () => -new Date().getTimezoneOffset();

export const oathActions = {
  async create(d: OathDraft): Promise<{ id: string; code: string | null }> {
    const source = createSource(d);
    const goal = d.goal.trim();
    const { oath } = await getTx(source).createOath({
      objectId: d.objectId, numDays: d.numDays, stake: BigInt(d.stakeSkr) * SKR_UNIT, goalText: goal, tzOffsetMinutes: tzOffset(), isSolo: d.isSolo, reviewMode: d.reviewMode,
    });
    useDeviceOaths.getState().remember(oath, { name: oathName(d.objectId, d.numDays), reviewMode: d.reviewMode, goal });
    const api = getApi();
    const facts = await api.oaths.get(oath);
    const code = await api.oaths.register(facts, goal).catch(() => facts.inviteCode);
    await refreshOaths();
    return { id: oath, code };
  },
  async join(o: OathFacts) {
    await getTx(o.source).joinOath(o.id);
    await getApi().oaths.watch(o).catch(() => undefined);
    await refreshOaths();
  },
  async start(o: OathFacts) { await getTx(o.source).startOath(o.id); await refreshOaths(); },
  async cancel(o: OathFacts) { await getTx(o.source).cancelOath(o.id); await refreshOaths(); },
  async settle(o: OathFacts) { await getTx(o.source).settle(o.id); await refreshOaths(); },
  async claim(o: OathFacts): Promise<bigint> {
    const { amount } = await getTx(o.source).claim(o.id);
    await refreshOaths();
    await queryClient.invalidateQueries({ queryKey: ["wallet"] });
    return amount;
  },
};

export type { OathView };
