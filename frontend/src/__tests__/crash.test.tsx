// Crash safety (D-87): render errors and fatal errors from outside render show the recover screen, "Try
// again" remounts the app, and an unhandled rejection shows one toast instead of vanishing.
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { t } from "@/copy";
import { ToastHost } from "@/components/chrome";
import { CrashBoundary } from "@/app/CrashBoundary";
import { installCrashHandlers, recentErrors, reportFatal, reportRejection } from "@/lib/crash";

const safe = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 24, left: 0, right: 0, bottom: 16 } };
let broken = false;
function Child() {
  if (broken) throw new Error("render failed");
  return <Text>app</Text>;
}
const App = () => (
  <SafeAreaProvider initialMetrics={safe}>
    <ToastHost><CrashBoundary><Child /></CrashBoundary></ToastHost>
  </SafeAreaProvider>
);

beforeEach(() => { broken = false; jest.spyOn(console, "error").mockImplementation(() => undefined); });
afterEach(() => { jest.restoreAllMocks(); });

describe("crash safety", () => {
  it("a render error shows the recover screen; Try again remounts the app", async () => {
    broken = true;
    await render(<App />);
    expect(screen.getByText(t("additions.recover.title"))).toBeTruthy();
    expect(screen.queryByText(/^app/)).toBeNull();
    broken = false;
    await fireEvent.press(screen.getByTestId("recover-retry"));
    expect(screen.queryByTestId("recover")).toBeNull();
    expect(screen.getByText(/^app/)).toBeTruthy();
  });

  it("a fatal error from outside render (a handler, a timer) shows the recover screen", async () => {
    await render(<App />);
    expect(screen.getByText(/^app/)).toBeTruthy();
    await act(async () => { reportFatal(new Error("timer failed")); });
    expect(screen.getByTestId("recover")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("recover-retry"));
    expect(screen.getByText(/^app/)).toBeTruthy();
    expect(recentErrors().at(-1)).toMatchObject({ kind: "fatal", message: "timer failed" });
  });

  it("an unhandled rejection shows one toast, not one per rejection", async () => {
    jest.useFakeTimers();
    await render(<App />);
    await act(async () => { reportRejection(new Error("a")); reportRejection(new Error("b")); });
    expect(screen.getAllByText(t("additions.recover.rejected"))).toHaveLength(1);
    expect(screen.getByText(/^app/)).toBeTruthy(); // the app keeps running
    jest.useRealTimers();
  });

  it("release: RN's global handler and Hermes's rejection tracker are routed here", async () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const previous = jest.fn();
    let handler: ((e: unknown, fatal?: boolean) => void) | undefined;
    let tracker: { onUnhandled: (id: number, e: unknown) => void } | undefined;
    const saved = { ErrorUtils: g.ErrorUtils, HermesInternal: g.HermesInternal, dev: g.__DEV__ };
    g.ErrorUtils = { getGlobalHandler: () => previous, setGlobalHandler: (h: typeof handler) => { handler = h; } };
    g.HermesInternal = { enablePromiseRejectionTracker: (o: typeof tracker) => { tracker = o; } };
    g.__DEV__ = false;
    try {
      installCrashHandlers();
      await render(<App />);
      // Not fatal: logged, the app carries on.
      await act(async () => { handler!(new Error("soft"), false); });
      expect(screen.getByText(/^app/)).toBeTruthy();
      // Fatal: the recover screen, and RN's handler (which would close the app) isn't called.
      await act(async () => { handler!(new Error("hard"), true); });
      expect(screen.getByTestId("recover")).toBeTruthy();
      expect(previous).not.toHaveBeenCalled();
      await act(async () => { tracker!.onUnhandled(1, new Error("lost")); });
      expect(recentErrors().map((e) => e.message)).toEqual(expect.arrayContaining(["soft", "hard", "lost"]));
    } finally {
      g.ErrorUtils = saved.ErrorUtils; g.HermesInternal = saved.HermesInternal; g.__DEV__ = saved.dev;
    }
  });
});
