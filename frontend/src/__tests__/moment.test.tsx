// D-74: a moment blocks hardware back until its own choreography has ended, then back works as usual.
import { act, render } from "@testing-library/react-native";
import { BackHandler, Text } from "react-native";
import { COUNT_UP_MS, enterDelay } from "@/components/primitives/motion";
import { momentSettleMs, pinnedDelay, useBackBlockedFor } from "@/components/layout/moment";
import { duration } from "@/theme";

import * as Reanimated from "react-native-reanimated";

// Tests run with Reduce Motion on (jest.setup.js); the hold only applies with motion.
let reduce = false;

describe("momentSettleMs", () => {
  it("ends when the last block has entered", () => {
    expect(momentSettleMs(8, 1)).toBe(enterDelay(7) + duration.enter);
  });
  it("waits for the last pinned action when it enters later than the blocks", () => {
    expect(momentSettleMs(1, 3)).toBe(Math.max(pinnedDelay(2) + duration.enter, COUNT_UP_MS));
  });
  it("never ends before the money count-up has landed", () => {
    expect(momentSettleMs(1, 0)).toBe(COUNT_UP_MS);
  });
});

describe("useBackBlockedFor", () => {
  let handler: ((e?: never) => boolean | null | undefined) | null = null;
  const remove = jest.fn();
  beforeEach(() => {
    jest.useFakeTimers();
    handler = null;
    jest.spyOn(Reanimated, "useReducedMotion").mockImplementation(() => reduce);
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((_e, h) => { handler = h as never; return { remove }; });
  });
  afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

  function Probe({ on }: { on: boolean }) { useBackBlockedFor(1000, on); return <Text>moment</Text>; }

  it("swallows back until settled, then lets it through", async () => {
    const r = await render(<Probe on />);
    expect(handler?.()).toBe(true);
    await act(async () => { jest.advanceTimersByTime(999); });
    expect(handler?.()).toBe(true);
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(handler?.()).toBe(false);
    await r.unmount();
    expect(remove).toHaveBeenCalled();
  });

  it("lets back through at once with Reduce Motion (nothing animates)", async () => {
    reduce = true;
    const r = await render(<Probe on />);
    expect(handler).toBeNull();
    await r.unmount();
    reduce = false;
  });

  it("does nothing on screens that aren't moments", async () => {
    const r = await render(<Probe on={false} />);
    expect(handler).toBeNull();
    await r.unmount();
  });
});
