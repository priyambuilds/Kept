import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { t } from "@/copy";
import { Button } from "@/components/actions";
import { AppHeader, Bell, BottomSheet, NavBar, TabBar, ToastHost, useToast } from "@/components/chrome";
import { Banner, Segmented } from "@/components/content/Basics";
import { DayMemberGrid, HPPanel, OathCard } from "@/components/content/Oath";
import { Toggle } from "@/components/content/Rows";
import { SignStatus } from "@/components/content/Status";
import { Gallery } from "@/dev/Gallery";
import { Text } from "@/components/primitives";

const insets = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

describe("Button", () => {
  it("fires onPress and exposes its label", async () => {
    const onPress = jest.fn();
    await render(<Button label="Take photo 2" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Take photo 2" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it("does not fire when disabled or loading", async () => {
    const onPress = jest.fn();
    await render(<><Button label="A" onPress={onPress} disabled /><Button label="B" onPress={onPress} loading /></>);
    await fireEvent.press(screen.getByRole("button", { name: "A" }));
    await fireEvent.press(screen.getByRole("button", { name: "B" }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "B" })).toHaveProp("accessibilityState", expect.objectContaining({ busy: true }));
  });
});

describe("chrome", () => {
  it("AppHeader routes the balance chip, bell and Keeper mark", async () => {
    const onBalance = jest.fn(), onBell = jest.fn(), onKeeper = jest.fn();
    await render(<AppHeader title="Today" balance="1,043" unreadCount={3} keeper={{ hasNew: true, onPress: onKeeper }} onBalance={onBalance} onBell={onBell} />);
    await fireEvent.press(screen.getByLabelText(`${t("additions.a11y.wallet")}: 1,043 SKR`));
    await fireEvent.press(screen.getByLabelText(`${t("additions.a11y.inbox")}, ${t("additions.a11y.unread", { n: 3 })}`));
    await fireEvent.press(screen.getByLabelText(t("additions.a11y.keeper")));
    expect([onBalance, onBell, onKeeper].map((f) => f.mock.calls.length)).toEqual([1, 1, 1]);
    expect(screen.getByText("3")).toBeTruthy();
  });
  it("Bell hides the badge at 0", async () => {
    await render(<Bell count={0} />);
    expect(screen.queryByText("0")).toBeNull();
  });
  it("NavBar shows k/n for steps and a close button for modal flows", async () => {
    const onBack = jest.fn();
    await render(<NavBar onBack={onBack} steps={[2, 6]} close />);
    expect(screen.getByText("2/6")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(t("additions.a11y.close")));
    expect(onBack).toHaveBeenCalled();
  });
  it("TabBar selects tabs and opens the + menu", async () => {
    const onTab = jest.fn(), onPlus = jest.fn();
    await render(<TabBar active="today" onTab={onTab} onPlus={onPlus} />);
    expect(screen.getByText(t("common.tabs.today"))).toBeTruthy();
    expect(screen.queryByText(t("common.tabs.oaths"))).toBeNull();
    await fireEvent.press(screen.getByRole("tab", { name: t("common.tabs.oaths") }));
    await fireEvent.press(screen.getByLabelText(t("additions.a11y.newMenu")));
    expect(onTab).toHaveBeenCalledWith("oaths");
    expect(onPlus).toHaveBeenCalled();
  });
  it("BottomSheet renders only while visible and closes from the scrim", async () => {
    const onClose = jest.fn();
    const { rerender } = await render(<BottomSheet visible={false} onClose={onClose}><Text>inside</Text></BottomSheet>);
    expect(screen.queryByText("inside")).toBeNull();
    await rerender(<BottomSheet visible onClose={onClose}><Text>inside</Text></BottomSheet>);
    expect(screen.getByText("inside")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(t("additions.a11y.close")));
    expect(onClose).toHaveBeenCalled();
  });
  it("Toast shows and hides itself after the hold time", async () => {
    jest.useFakeTimers();
    function Trigger() { const toast = useToast(); return <Button label="go" onPress={() => toast(t("toasts.0"))} />; }
    await render(<ToastHost><Trigger /></ToastHost>);
    await fireEvent.press(screen.getByRole("button", { name: "go" }));
    expect(screen.getByText(t("toasts.0"))).toBeTruthy();
    await act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.queryByText(t("toasts.0"))).toBeNull();
    jest.useRealTimers();
  });
});

describe("content", () => {
  it("OathCard shows its tags and button", async () => {
    const onBtn = jest.fn();
    await render(<OathCard icon="dumbbell" name="Iron Week" meta="Day 3/7" tags={[{ text: "1,043 SKR" }]} hp={90} button={{ label: "Take photo 2", onPress: onBtn }} />);
    expect(screen.getByText("1,043 SKR")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Take photo 2" }));
    expect(onBtn).toHaveBeenCalled();
  });
  it("HPPanel shows the HP number", async () => {
    await render(<HPPanel hp={40} lostToday={20} />);
    expect(screen.getByText(/40/)).toBeTruthy();
  });
  it("DayMemberGrid renders a row per member", async () => {
    await render(<DayMemberGrid days={7} today={3} members={[{ key: "a", name: "Arjun", initial: "A", color: "#FDE68A", cells: "kmpffff" }, { key: "r", name: "Riya", initial: "R", color: "#F9A8D4", cells: "kkkffff" }]} />);
    expect(screen.getByText("Arjun")).toBeTruthy();
    expect(screen.getByText("Riya")).toBeTruthy();
  });
  it("Segmented and Toggle report changes", async () => {
    const onSeg = jest.fn(), onToggle = jest.fn();
    await render(<><Segmented items={["Discover", "Joined"]} value={0} onChange={onSeg} /><Toggle on={false} onChange={onToggle} label="Push" /></>);
    await fireEvent.press(screen.getByRole("tab", { name: "Joined" }));
    await fireEvent.press(screen.getByLabelText("Push"));
    expect(onSeg).toHaveBeenCalledWith(1);
    expect(onToggle).toHaveBeenCalledWith(true);
  });
  it("Banner is pressable only with onPress", async () => {
    const onPress = jest.fn();
    await render(<Banner tone="lime" icon="sack" title="Claim" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Claim" }));
    expect(onPress).toHaveBeenCalled();
  });
  it("SignStatus renders every state", async () => {
    await render(<>{(["pending", "success", "fail", "warn"] as const).map((s) => <SignStatus key={s} state={s} chip="1,000 SKR staked" />)}</>);
    expect(screen.getAllByText("1,000 SKR staked").length).toBeGreaterThan(0);
  });
});

describe("Gallery", () => {
  it("renders every section without a missing copy key", async () => {
    await render(<SafeAreaProvider initialMetrics={insets}><ToastHost><Gallery /></ToastHost></SafeAreaProvider>);
    for (const s of ["AppHeader", "TabBar + PlusButton", "OathCard", "ProofCamera + Shutter", "SignStatus", "Overlays · FX"]) {
      expect(screen.getByText(s)).toBeTruthy();
    }
  });
});
