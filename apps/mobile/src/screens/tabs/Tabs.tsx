// The four tab screens. Each is the shell + a list of where it leads until its phase builds it.
import { t } from "@/copy";
import { Note, Title } from "@/components/content/Basics";
import { RowList } from "@/components/content/Rows";
import { useGo } from "@/app/nav";
import { routeInfo } from "@/app/routes";
import type { DesignId } from "@/app/routes";
import { TabScreen } from "./TabScreen";
import type { TabId } from "./TabScreen";

function TabPlaceholder({ tab, id }: { tab: TabId; id: DesignId }) {
  const { go } = useGo();
  const info = routeInfo(id);
  // Global chrome destinations are reachable from the header and tab bar already.
  const chrome = new Set<string>(["B1", "D0", "H1", "I1", "+", "N1", "W1", "I4"]);
  return (
    <TabScreen tab={tab}>
      <Title heading={`${info.id} · ${info.name}`} />
      <Note text={t("additions.placeholder.note")} />
      <RowList label={t("additions.placeholder.leadsTo")} rows={info.to.filter((to) => !chrome.has(to)).map((to) => ({ title: to, sub: routeInfo(to).name, chevron: true, onPress: () => go(to) }))} />
    </TabScreen>
  );
}

export const BountiesTab = () => <TabPlaceholder tab="bounties" id="H1" />;
export const ProfileTab = () => <TabPlaceholder tab="profile" id="I1" />;
