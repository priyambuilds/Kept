// `+` menu (screens.md › +): Start an Oath, Join with code, Create a Bounty.
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/copy";
import { Button } from "@/components/actions";
import { BottomSheet } from "@/components/chrome";
import { Note, Title } from "@/components/content/Basics";
import { RowList } from "@/components/content/Rows";
import { useGo } from "@/app/nav";
import type { DesignId } from "@/app/routes";
import { color } from "@/theme";
import type { IconName } from "@/components/primitives";

const ITEMS: { to: DesignId; icon: IconName; key: 0 | 1 | 2 }[] = [
  { to: "C1", icon: "fire", key: 0 },
  { to: "E1", icon: "link-variant", key: 1 },
  { to: "K1", icon: "trophy-outline", key: 2 },
];

export function PlusSheet() {
  const { back, replace } = useGo();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <BottomSheet visible onClose={back} bottomInset={insets.bottom}>
        <Title heading={t("screens.+.b0.title")} pt={0} />
        <RowList rows={ITEMS.map((i) => ({
          title: t(`screens.+.b1.r${i.key}.t`), sub: t(`screens.+.b1.r${i.key}.s`), chevron: true,
          leading: { kind: "icon" as const, icon: i.icon, bg: color.surface[3] },
          // The sheet is replaced by the flow so back from C1/E1/K1 returns to the tab, not the sheet.
          onPress: () => replace(i.to),
        }))} />
        <Note text={t("screens.+.b2.text")} />
        <Button kind="t" label={t("screens.+.b3.btn.0")} onPress={back} />
      </BottomSheet>
    </View>
  );
}
