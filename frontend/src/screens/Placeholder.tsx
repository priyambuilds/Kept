// Stand-in for every screen not built yet (BUILD_PLAN Phase 2): its design id and name, and a row
// per screen it leads to in design/flows.md, so the whole map can be walked on the device.
import { View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/copy";
import { Button } from "@/components/actions";
import { BottomSheet, NavBar } from "@/components/chrome";
import { Note, Title } from "@/components/content/Basics";
import { RowList } from "@/components/content/Rows";
import { Screen } from "@/components/layout/Screen";
import { useGo, useSheetRoute } from "@/app/nav";
import { designIdOf, presentation, routeInfo } from "@/app/routes";
import type { DesignId } from "@/app/routes";

export function Placeholder() {
  const route = useRoute<RouteProp<Record<string, object | undefined>>>();
  const id = designIdOf(route.name) as DesignId;
  const info = routeInfo(id);
  const kind = presentation(id);
  const { go, replace, back } = useGo();
  const insets = useSafeAreaInsets();
  const sheet = useSheetRoute(kind === "sheet");
  // Signing screens replace themselves; everything else pushes.
  const open = (to: DesignId) => (kind === "signing" ? replace(to) : go(to));
  const body = (
    <>
      <Title heading={`${info.id} · ${info.name}`} />
      <Note text={t("additions.placeholder.note")} />
      {info.to.length ? (
        <RowList label={t("additions.placeholder.leadsTo")} rows={info.to.map((to) => ({ title: to, sub: routeInfo(to).name, chevron: true, onPress: () => open(to) }))} />
      ) : null}
    </>
  );
  if (kind === "sheet") {
    return (
      <View style={{ flex: 1 }}>
        <BottomSheet {...sheet} bottomInset={insets.bottom}>
          {body}
          <Button kind="t" label={t("additions.a11y.close")} onPress={back} />
        </BottomSheet>
      </View>
    );
  }
  return <Screen bar={<NavBar onBack={back} close={kind === "modal" || kind === "signing"} title={info.name} />}>{body}</Screen>;
}
