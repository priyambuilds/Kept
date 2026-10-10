// `+` menu (screens.md › +): Start an Oath, Join with code, Create a Bounty.
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/copy";
import { Button } from "@/components/actions";
import { BottomSheet } from "@/components/chrome";
import { Note, Title } from "@/components/content/Basics";
import { RowList } from "@/components/content/Rows";
import { useGo, useSheetRoute } from "@/app/nav";
import type { DesignId } from "@/app/routes";
import { color } from "@/theme";
import type { IconName } from "@/components/primitives";
import { useFeature } from "@/features/availability";

// reference/kept-screens-1.js › `+`: a white plus tile, then the icons' own tile colours.
const ITEMS: { to: DesignId; icon: IconName; key: 0 | 1 | 2 }[] = [
  { to: "C1", icon: "plus", key: 0 },
  { to: "E1", icon: "qrcode-scan", key: 1 },
  { to: "K1", icon: "trophy-outline", key: 2 },
];

export function PlusSheet() {
  const { back, replace } = useGo();
  const insets = useSafeAreaInsets();
  const sheet = useSheetRoute();
  // Creating a Bounty has no backend yet (P1-10): Live leaves it out (D-80).
  const items = useFeature("createBounty") ? ITEMS : ITEMS.filter((i) => i.to !== "K1");
  return (
    <View style={{ flex: 1 }}>
      <BottomSheet {...sheet} bottomInset={insets.bottom}>
        <Title heading={t("screens.+.b0.title")} pt={0} fs={26} />
        <RowList rows={items.map((i) => ({
          title: t(`screens.+.b1.r${i.key}.t`), sub: t(`screens.+.b1.r${i.key}.s`), chevron: true,
          leading: i.key === 0 ? { kind: "icon" as const, icon: i.icon, bg: color.chipTone.white.bg, fg: color.text.onLime } : { kind: "icon" as const, icon: i.icon },
          // The sheet is replaced by the flow so back from C1/E1/K1 returns to the tab, not the sheet.
          onPress: () => replace(i.to),
        }))} />
        <Note text={t("screens.+.b2.text")} icon="cellphone-check" />
        <Button kind="s" label={t("screens.+.b3.btn.0")} onPress={back} />
      </BottomSheet>
    </View>
  );
}
