// The navigation tree from design/flows.md › Navigation model (docs/ARCHITECTURE.md §5).
// Every design id is registered: built screens use their component, the rest render Placeholder.
import type { ComponentType } from "react";
import { BackHandler } from "react-native";
import { NavigationContainer, DarkTheme, useFocusEffect } from "@react-navigation/native";
import type { LinkingOptions, ParamListBase } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBar } from "@/components/chrome";
import type { TabKey } from "@/components/chrome";
import { color } from "@/theme";
import { Gallery } from "@/dev/Gallery";
import { M2 } from "@/screens/M2";
import { Placeholder } from "@/screens/Placeholder";
import { PlusSheet } from "@/screens/sheets/PlusSheet";
import { A0, A1, A2, A2e, A2s, A3, A3no, A4 } from "@/screens/onboarding/Onboarding";
import { BountiesTab, OathsTab, ProfileTab, TodayTab } from "@/screens/tabs/Tabs";
import { useSession } from "@/state/session";
import { navigationRef } from "./nav";
import { ROUTES, presentation, routeName } from "./routes";
import type { DesignId } from "./routes";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** Screens built so far; every other id renders Placeholder. */
const BUILT: Partial<Record<DesignId, ComponentType>> = {
  A0, A1, A2, "A2·s": A2s, "A2·e": A2e, A3, "A3·no": A3no, A4, M2, "+": PlusSheet,
};
const TAB_SCREENS: { id: DesignId; key: TabKey; component: ComponentType }[] = [
  { id: "B1", key: "today", component: TodayTab },
  { id: "D0", key: "oaths", component: OathsTab },
  { id: "H1", key: "bounties", component: BountiesTab },
  { id: "I1", key: "profile", component: ProfileTab },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const active = TAB_SCREENS[state.index]?.key ?? "today";
  return (
    <TabBar
      active={active}
      bottomInset={insets.bottom}
      onTab={(k) => navigation.navigate(routeName(TAB_SCREENS.find((s) => s.key === k)!.id))}
      onPlus={() => navigation.getParent()?.navigate(routeName("+"))}
    />
  );
}

function Tabs() {
  return (
    <Tab.Navigator tabBar={(p) => <CustomTabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg.app } }}>
      {TAB_SCREENS.map((s) => <Tab.Screen key={s.id} name={routeName(s.id)} component={s.component} />)}
    </Tab.Navigator>
  );
}

/** Moments (L1–L6, F5, …) block hardware back until the screen settles (flows.md). */
function blockBack<P extends object>(C: ComponentType<P>): ComponentType<P> {
  return function Moment(props: P) {
    useFocusEffect(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    });
    return <C {...props} />;
  };
}

const flowIds = ROUTES.filter((r) => !["tab", "sheet", "moment"].includes(presentation(r.id)));
const sheetIds = ROUTES.filter((r) => presentation(r.id) === "sheet");
const momentIds = ROUTES.filter((r) => presentation(r.id) === "moment");
const MomentPlaceholder = blockBack(Placeholder);

/**
 * `kept://join/<code>`: signed-in and onboarded users land on E1 with the code. Otherwise the code is
 * kept (session.invite) and onboarding's cont: rule opens E1 at the end (docs/ARCHITECTURE.md §5).
 */
export function routeInvite(url: string | null): string | null {
  if (!url) return url;
  const code = url.match(/^kept:\/\/join\/([^/?#]+)/)?.[1];
  if (!code) return url;
  const s = useSession.getState();
  if (s.token && s.onboarded) return url;
  s.setInvite(decodeURIComponent(code));
  return null;
}

const linking: LinkingOptions<ParamListBase> = {
  prefixes: ["kept://"],
  config: { screens: { [routeName("E1")]: "join/:code" } },
  getInitialURL: async () => routeInvite(await Linking.getInitialURL()),
  subscribe: (listener) => {
    const sub = Linking.addEventListener("url", ({ url }) => { const u = routeInvite(url); if (u) listener(u); });
    return () => sub.remove();
  },
};

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: color.bg.app, card: color.bg.app } };

export function RootNavigator({ onReady }: { onReady?: () => void }) {
  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={theme} {...(onReady ? { onReady } : {})}>
      <Stack.Navigator initialRouteName={routeName("A0")} screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: color.bg.app } }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ animation: "fade" }} />
        {flowIds.map((r) => (
          <Stack.Screen key={r.id} name={routeName(r.id)} component={BUILT[r.id] ?? Placeholder}
            options={r.id === "A0" ? { animation: "fade" } : presentation(r.id) === "modal" ? { animation: "slide_from_bottom" } : {}} />
        ))}
        <Stack.Group screenOptions={{ animation: "fade", gestureEnabled: false }}>
          {momentIds.map((r) => <Stack.Screen key={r.id} name={routeName(r.id)} component={BUILT[r.id] ?? MomentPlaceholder} />)}
        </Stack.Group>
        {/* Sheets draw their own scrim and slide (BottomSheet), over the screen below. */}
        <Stack.Group screenOptions={{ presentation: "transparentModal", animation: "none", contentStyle: { backgroundColor: "transparent" } }}>
          {sheetIds.map((r) => <Stack.Screen key={r.id} name={routeName(r.id)} component={BUILT[r.id] ?? Placeholder} />)}
        </Stack.Group>
        {__DEV__ ? <Stack.Screen name="Gallery" component={Gallery} /> : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

