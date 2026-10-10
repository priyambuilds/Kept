// M2 No internet (screens.md): shown by OfflineHost when a call fails for lack of network, and by
// LoadFailHost (`cause: "load"`, D-89) when a screen's data failed to load for another reason; that case
// only swaps the title and line. Retry marks the app online and refetches; if that fails again the toast says so.
import { onlineManager, useQueryClient } from "@tanstack/react-query";
import { keeperLines, t } from "@/copy";
import { Button } from "@/components/actions";
import { NavBar, useToast } from "@/components/chrome";
import { Title } from "@/components/content/Basics";
import { ScreenKeeper } from "@/components/keeper/ScreenKeeper";
import { Screen } from "@/components/layout/Screen";
import { metrics } from "@/theme";
import { useGo, useParams } from "@/app/nav";

/** toasts[18] is "Still offline" (copy.json; checked in navigation.test). */
export const STILL_OFFLINE = 18;

export function M2() {
  const { back } = useGo();
  const server = useParams<{ cause: string }>().cause === "load";
  const qc = useQueryClient();
  const toast = useToast();
  const k = keeperLines("M2")[0]!;
  const retry = async () => {
    onlineManager.setOnline(true);
    await qc.refetchQueries({ type: "active" });
    // A screen still waiting on data it couldn't load would show its skeleton again.
    const stuck = qc.getQueryCache().findAll({ type: "active" }).some((q) => q.state.status === "error" && q.state.data === undefined);
    if (onlineManager.isOnline() && !stuck) back();
    else toast(server && onlineManager.isOnline() ? t("additions.loadFailed.title") : t(`toasts.${STILL_OFFLINE}`));
  };
  return (
    <Screen
      bar={<NavBar onBack={() => { onlineManager.setOnline(true); back(); }} close />}
      bottomInset={metrics.button.height + metrics.pinned.bottom}
      pinned={<Button kind="p" icon="wifi-refresh" label={t("screens.M2.pin.0")} onPress={() => { void retry(); }} />}
    >
      <ScreenKeeper id="M2" lines={[k]} />
      <Title heading={t(server ? "additions.loadFailed.title" : "screens.M2.b2.title")} sub={t(server ? "additions.loadFailed.sub" : "screens.M2.b2.sub")} align="center" />
    </Screen>
  );
}
