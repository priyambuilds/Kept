import { fireEvent, render, screen } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import copy from "../../../../design/copy.json";
import { t } from "@/copy";
import { ToastHost } from "@/components/chrome";
import { queryClient } from "@/api/queries";
import { SLICES } from "@/api/types";
import { RootNavigator, routeInvite } from "@/app/RootNavigator";
import { ROUTES, presentation, routeName } from "@/app/routes";
import { STILL_OFFLINE } from "@/screens/M2";
import { useDev } from "@/state/dev";
import { useSession } from "@/state/session";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 24, left: 0, right: 0, bottom: 16 } };
const slow = { timeout: 8000 };

function App() {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={queryClient}>
        <ToastHost><RootNavigator /></ToastHost>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

describe("routes", () => {
  it("registers every design id with an ASCII name", () => {
    expect(ROUTES).toHaveLength(Object.keys(copy.screens).length);
    expect(routeName("C7·no")).toBe("C7_no");
    expect(routeName("+")).toBe("Plus");
    expect(presentation("A2·s")).toBe("signing");
    expect(presentation("L1")).toBe("moment");
    expect(presentation("M3")).toBe("sheet");
    expect(presentation("B1")).toBe("tab");
  });
  it("M2's retry toast is 'Still offline'", () => {
    expect(copy.toasts[STILL_OFFLINE]).toBe("Still offline");
  });
});

describe("kept://join/<code>", () => {
  it("signed out: keeps the code for after onboarding and swallows the link", () => {
    useSession.setState({ token: null, onboarded: false, invite: null });
    expect(routeInvite("kept://join/IRON-7K2Q")).toBeNull();
    expect(useSession.getState().invite).toBe("IRON-7K2Q");
  });
  it("signed in: lets the link through to E1", () => {
    useSession.setState({ token: "t", onboarded: true, invite: null });
    expect(routeInvite("kept://join/IRON-7K2Q")).toBe("kept://join/IRON-7K2Q");
    expect(useSession.getState().invite).toBeNull();
    expect(routeInvite("kept://other")).toBe("kept://other");
  });
});

describe("onboarding on mocks", () => {
  // With gcTime Infinity React Query schedules no garbage-collection timers, so Jest can exit.
  beforeAll(() => queryClient.setDefaultOptions({ queries: { ...queryClient.getDefaultOptions().queries, gcTime: Infinity } }));
  beforeEach(() => {
    useDev.setState({ overrides: Object.fromEntries(SLICES.map((s) => [s, "mock"])), mockWallet: true, scenario: "activeGroup" });
    useSession.setState({ token: null, wallet: null, genesis: false, onboarded: false, avatar: null, invite: null });
    queryClient.clear();
  });

  it("splash → welcome → wallet → signed in → verified → look → tabs → + sheet", async () => {
    await render(<App />);
    await fireEvent.press(await screen.findByRole("button", { name: t("screens.A1.pin.0") }, slow));
    await fireEvent.press(await screen.findByLabelText(t("screens.A2.b1.r0.t")));
    expect(await screen.findByText(t("screens.A2·s.b2.title"))).toBeTruthy();
    await fireEvent.press(await screen.findByRole("button", { name: t("screens.A3.pin.0") }, slow));
    await fireEvent.press(await screen.findByRole("button", { name: t("screens.A4.pin.0") }));
    expect(useSession.getState()).toMatchObject({ onboarded: true, genesis: true });
    expect(await screen.findByRole("header", { name: t("screens.B1.header.title") })).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(t("additions.a11y.newMenu")));
    expect(await screen.findByText(t("screens.+.b0.title"))).toBeTruthy();
  }, 30000);

  it("a declined signature lands on A2·e", async () => {
    useDev.setState({ scenario: "walletRejected" });
    await render(<App />);
    await fireEvent.press(await screen.findByRole("button", { name: t("screens.A1.pin.0") }, slow));
    await fireEvent.press(await screen.findByLabelText(t("screens.A2.b1.r1.t")));
    expect(await screen.findByText(t("screens.A2·e.b2.title"), {}, slow)).toBeTruthy();
    expect(useSession.getState().token).toBeNull();
  }, 30000);

  it("a non-Seeker lands on A3·no", async () => {
    useDev.setState({ scenario: "notEligible" });
    await render(<App />);
    await fireEvent.press(await screen.findByRole("button", { name: t("screens.A1.pin.0") }, slow));
    await fireEvent.press(await screen.findByLabelText(t("screens.A2.b1.r0.t")));
    expect(await screen.findByText(t("screens.A3·no.b2.title"), {}, slow)).toBeTruthy();
  }, 30000);

  it("a signed-in, onboarded user skips straight to the tabs", async () => {
    useSession.setState({ token: "mock.x", wallet: "7xKpQe9mZ3LbVd2RtYc8NfH4uJs6WgA1oPqE5rTk3F9q", onboarded: true, avatar: "31205140" });
    await render(<App />);
    expect(await screen.findByRole("header", { name: t("screens.B1.header.title") }, slow)).toBeTruthy();
  }, 30000);
});
