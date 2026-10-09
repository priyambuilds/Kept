// N1 Inbox and M1 Notifications (screens.md). The inbox is on the mock until the backend adds it
// (BACKEND_GAPS P1-11); M1 is the system tray's look, from copy.
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InboxItem } from "@kept/shared";
import { keeperLines, t } from "@/copy";
import type { CopyKey } from "@/copy";
import { NavBar, useToast } from "@/components/chrome";
import { Note, Skeleton, Title } from "@/components/content/Basics";
import { RowList } from "@/components/content/Rows";
import { InboxList } from "@/components/content/Social";
import type { InboxItemView, InboxLead } from "@/components/content/Social";
import type { IconName } from "@/components/primitives";
import type { PaletteName } from "@/theme";
import { KeeperPlacement } from "@/components/keeper/KeeperUI";
import { Screen } from "@/components/layout/Screen";
import { ago } from "@/lib/format";
import { useApi } from "@/api";
import { qk, useInbox } from "@/api/queries";
import type { DesignId } from "@/app/routes";
import type { Params } from "@/app/nav";
import { useGo } from "@/app/nav";
import { useNow } from "@/features/time";

type Kind = InboxItem["type"];
/** Where an item opens, from its type and ref (flows.md N1). */
function targetOf(it: InboxItem): [DesignId, Params] | null {
  const { oath, code, bounty } = it.ref;
  switch (it.type) {
    case "invite": return oath ? ["E2", { id: oath, ...(code ? { code } : {}) }] : code ? ["E1", { code }] : null;
    case "review": return oath ? ["G1", { id: oath }] : null;
    case "claim": return oath ? ["J1", { id: oath }] : null;
    case "rematch": case "broken": return oath ? ["R1", { id: oath }] : null;
    case "nudge": case "deadline": return oath ? ["D2", { id: oath }] : null;
    case "recap": return ["B5", {}];
    case "started": return bounty ? ["H3", { id: bounty }] : oath ? ["D2", { id: oath }] : null;
    case "bounty": return bounty ? ["H2", { id: bounty }] : null;
    case "followed": return null;
  }
}

const LEAD: Record<Kind, { icon: IconName; palette: PaletteName }> = {
  invite: { icon: "account-plus-outline", palette: "sky" },
  review: { icon: "vote-outline", palette: "vio" },
  claim: { icon: "sack", palette: "lime" },
  rematch: { icon: "sword-cross", palette: "orange" },
  broken: { icon: "heart-broken", palette: "orange" },
  nudge: { icon: "hand-wave-outline", palette: "pink" },
  deadline: { icon: "timer-sand", palette: "orange" },
  recap: { icon: "chart-bar", palette: "amber" },
  started: { icon: "flag-checkered", palette: "lime" },
  bounty: { icon: "bullhorn-outline", palette: "sky" },
  followed: { icon: "account-heart-outline", palette: "pink" },
};
/** The design's button labels per item type (N1 copy). */
const ACTIONS: Partial<Record<Kind, CopyKey[]>> = {
  invite: ["screens.N1.b1.inv1.btn0", "screens.N1.b1.inv1.btn1"],
  review: ["screens.N1.b1.rev1.btn0"],
  claim: ["screens.N1.b1.clm1.btn0"],
  rematch: ["screens.N1.b1.rm1.btn0"],
};

export function N1() {
  const { back, go } = useGo();
  const toast = useToast();
  const api = useApi();
  const qc = useQueryClient();
  const inbox = useInbox();
  const now = useNow(60_000);
  const markDone = useCallback(async (ids: string[]) => {
    await api.inbox.markDone(ids);
    await qc.invalidateQueries({ queryKey: qk.inbox });
  }, [api, qc]);

  const items = inbox.data?.items ?? [];
  const view = (it: InboxItem): InboxItemView => {
    const to = targetOf(it);
    const open = to ? () => go(to[0], to[1]) : undefined;
    const labels = it.done ? [] : (ACTIONS[it.type] ?? []);
    const lead: InboxLead = { kind: "icon", ...LEAD[it.type] };
    return {
      id: it.id, title: it.title, sub: it.body, time: ago(now / 1000 - it.createdAt), lead,
      needsAction: it.needsAction, done: it.done, unread: !it.done && !it.needsAction,
      ...(open ? { onPress: open } : {}),
      actions: labels.map((label, i) => {
        // Invites: Accept opens E2, Decline stays (toast); both mark the item done.
        if (it.type === "invite" && i === 1) return { label: t(label), kind: "s" as const, onPress: () => { void markDone([it.id]); toast(t("toasts.20")); } };
        return { label: t(label), kind: it.type === "claim" ? ("l" as const) : ("p" as const), onPress: () => { if (it.type === "invite") void markDone([it.id]); open?.(); } };
      }),
    };
  };
  const needs = items.filter((i) => i.needsAction && !i.done);
  const fresh = items.filter((i) => !i.needsAction);
  const k = keeperLines("N1");
  const keeper = needs.some((i) => i.type === "claim") ? k[0] : needs.some((i) => i.type === "review") ? k[1] : k[2];

  return (
    <Screen bar={<NavBar onBack={back} title={t("screens.N1.nav.title")} />}>
      {keeper ? <KeeperPlacement mood={keeper.mood} line={keeper.line} size={80} side="r" height={100} /> : null}
      {inbox.isLoading ? <><Skeleton height={96} /><Skeleton height={96} /><Skeleton height={96} /></> : null}
      {needs.length ? <InboxList label={t("screens.N1.b1.label", { n: needs.length })} items={needs.map(view)} /> : null}
      {fresh.length ? (
        <InboxList label={t("screens.N1.b2.label")} items={fresh.map(view)}
          {...(fresh.some((i) => !i.done) ? { action: { label: t("screens.N1.b2.action"), onPress: () => { void markDone(fresh.map((i) => i.id)); } } } : {})} />
      ) : null}
      <Note text={t("screens.N1.b3.text")} />
    </Screen>
  );
}

// ── M1 Notifications ── what the system tray shows; real pushes use expo-notifications (P1-12).
export function M1() {
  const { back } = useGo();
  const rows = Array.from({ length: 11 }, (_, i) => ({
    title: t(`screens.M1.b1.r${i}.t` as CopyKey), value: t(`screens.M1.b1.r${i}.r` as CopyKey),
    leading: { kind: "mark" as const },
  }));
  return (
    <Screen bar={<NavBar onBack={back} close />}>
      <Title heading={t("screens.M1.b0.title")} sub={t("screens.M1.b0.sub")} align="center" fs={56} />
      <RowList rows={rows} />
    </Screen>
  );
}
