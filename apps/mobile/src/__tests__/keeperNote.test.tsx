// KeeperNote behaviour (components.md › KeeperNote): tab screens never auto-open it and their mark
// toggles it; flow screens drop it once on entry and close it after 4.8 s; it always closes when the
// screen loses focus and never shows on another screen.
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import type { ParamListBase } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { keeperIdle, keeperLines, t } from "@/copy";
import { AppHeader, NavBar } from "@/components/chrome";
import { Screen } from "@/components/layout/Screen";
import { ScreenKeeper, __resetSeenKeeperLines } from "@/components/keeper/ScreenKeeper";
import { metrics } from "@/theme";

const safe = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 24, left: 0, right: 0, bottom: 16 } };
const Stack = createNativeStackNavigator();
const nav = createNavigationContainerRef<ParamListBase>();

const tabLine = keeperLines("B1")[1]!;
const flowLine = keeperLines("C1")[0]!;
const idle = keeperIdle("today");
const header = <AppHeader title="Today" balance="0" unreadCount={0} />;

/** B1 is a tab screen (mark-only line); C1 a flow screen (mark-only, auto-drop); I1-like tab with no line. */
function TabWithLine() {
  return <Screen bar={header} keeperIdle={idle}><ScreenKeeper id="B1" lines={[tabLine]} /></Screen>;
}
function FlowWithLine() {
  return <Screen bar={<NavBar onBack={() => nav.goBack()} />}><ScreenKeeper id="C1" lines={[flowLine]} /></Screen>;
}
function TabNoLine() {
  return <Screen bar={header} keeperIdle={idle} />;
}

function App({ initial }: { initial: string }) {
  return (
    <SafeAreaProvider initialMetrics={safe}>
      <NavigationContainer ref={nav}>
        <Stack.Navigator initialRouteName={initial} screenOptions={{ headerShown: false, animation: "none" }}>
          <Stack.Screen name="B1" component={TabWithLine} />
          <Stack.Screen name="C1" component={FlowWithLine} />
          <Stack.Screen name="D0" component={TabNoLine} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const mark = () => screen.getAllByLabelText(t("additions.a11y.keeper"));
const visible = (line: string) => screen.queryAllByText(line).length > 0;

beforeEach(() => { jest.useFakeTimers(); __resetSeenKeeperLines(); });
afterEach(() => { jest.useRealTimers(); });

describe("KeeperNote", () => {
  it("tab screen: never auto-opens; the mark toggles it; tapping the card closes it", async () => {
    await render(<App initial="B1" />);
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(visible(tabLine.line)).toBe(false);
    await fireEvent.press(mark()[0]!);
    expect(visible(tabLine.line)).toBe(true);
    await fireEvent.press(screen.getByText(tabLine.line));
    expect(visible(tabLine.line)).toBe(false);
    await fireEvent.press(mark()[0]!);
    expect(visible(tabLine.line)).toBe(true);
    await fireEvent.press(mark()[0]!);
    expect(visible(tabLine.line)).toBe(false);
  });

  it("tab screen with no line: the mark opens the tab's idle line", async () => {
    await render(<App initial="D0" />);
    expect(visible(idle.line)).toBe(false);
    await fireEvent.press(mark()[0]!);
    expect(visible(idle.line)).toBe(true);
  });

  it("flow screen: drops once on entry, closes after 4.8 s, then lives behind the nav mark", async () => {
    await render(<App initial="C1" />);
    await act(async () => { jest.advanceTimersByTime(10); });
    expect(visible(flowLine.line)).toBe(true);
    await act(async () => { jest.advanceTimersByTime(metrics.keeperNote.holdMs + 10); });
    expect(visible(flowLine.line)).toBe(false);
    await fireEvent.press(mark()[0]!);
    expect(visible(flowLine.line)).toBe(true);
  });

  it("closes on navigation and never shows on the next screen or after coming back", async () => {
    await render(<App initial="B1" />);
    await fireEvent.press(mark()[0]!);
    expect(visible(tabLine.line)).toBe(true);
    await act(async () => { nav.navigate("D0"); jest.advanceTimersByTime(10); });
    expect(visible(tabLine.line)).toBe(false);
    expect(visible(idle.line)).toBe(false);
    await act(async () => { nav.goBack(); jest.advanceTimersByTime(10); });
    expect(visible(tabLine.line)).toBe(false);
  });

  it("a flow screen's note closes when another screen is pushed over it", async () => {
    await render(<App initial="C1" />);
    await act(async () => { jest.advanceTimersByTime(10); });
    expect(visible(flowLine.line)).toBe(true);
    await act(async () => { nav.navigate("D0"); jest.advanceTimersByTime(10); });
    expect(visible(flowLine.line)).toBe(false);
    // Back on C1 it doesn't drop again (once per entry).
    await act(async () => { nav.goBack(); jest.advanceTimersByTime(10); });
    expect(visible(flowLine.line)).toBe(false);
  });
});
