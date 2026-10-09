// M2 No internet (screens.md): shown by OfflineHost when a call fails for lack of network.
// Retry marks the app online and refetches; if that fails again the toast says so.
import { onlineManager, useQueryClient } from "@tanstack/react-query";
import { keeperLines, t } from "@/copy";
import { Button } from "@/components/actions";
import { NavBar, useToast } from "@/components/chrome";
import { Title } from "@/components/content/Basics";
import { ScreenKeeper } from "@/components/keeper/ScreenKeeper";
import { Screen } from "@/components/layout/Screen";
import { metrics } from "@/theme";
import { useGo } from "@/app/nav";

/** toasts[18] is "Still offline" (copy.json; checked in navigation.test). */
export const STILL_OFFLINE = 18;

export function M2() {
  const { back } = useGo();
  const qc = useQueryClient();
  const toast = useToast();
  const k = keeperLines("M2")[0]!;
  const retry = async () => {
    onlineManager.setOnline(true);
    await qc.refetchQueries({ type: "active" });
    if (onlineManager.isOnline()) back();
    else toast(t(`toasts.${STILL_OFFLINE}`));
  };
  return (
    <Screen
      bar={<NavBar onBack={() => { onlineManager.setOnline(true); back(); }} close />}
      bottomInset={metrics.button.height + metrics.pinned.bottom}
      pinned={<Button kind="p" icon="wifi-refresh" label={t("screens.M2.pin.0")} onPress={() => { void retry(); }} />}
    >
      <ScreenKeeper id="M2" lines={[k]} />
      <Title heading={t("screens.M2.b2.title")} sub={t("screens.M2.b2.sub")} align="center" />
    </Screen>
  );
}
