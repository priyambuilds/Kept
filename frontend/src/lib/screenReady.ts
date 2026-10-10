// When a screen may mount its content (D-83). The native stack starts a push's slide only after the new
// screen's first commit, so building the whole screen first held every push back (120–380 ms on the
// emulator, three to four times that on a phone). Screen commits its bar, ambient light and a skeleton
// at once, and mounts the content when this turns true:
// - a pushed screen: when its slide ends (transitionEnd), with a cap in case the event never comes;
// - a tab screen (no transition): one frame later, so the tab bar and skeleton paint first;
// - the first screen of a stack (the splash) and screens outside a navigator: at once.
import { useContext, useEffect, useState } from "react";
import { NavigationContext } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

/** A little past the Android slide (~400 ms), counted from the first frame. */
const CAP_MS = 600;

let deferral = true;
/** Tests render screens without native transitions: they turn deferral off (jest.setup.js). */
export const setScreenDeferral = (on: boolean) => { deferral = on; };

type Nav = NavigationProp<ParamListBase>;
const isStack = (nav: Nav) => nav.getState()?.type === "stack";
const firstOfStack = (nav: Nav) => isStack(nav) && nav.getState()?.routes.length === 1;

export function useScreenReady(): boolean {
  const nav = useContext(NavigationContext) as Nav | undefined;
  const [ready, setReady] = useState(() => !deferral || !nav || firstOfStack(nav));
  useEffect(() => {
    if (ready || !nav) return;
    const go = () => setReady(true);
    const stack = isStack(nav);
    // @ts-expect-error transitionEnd is a native-stack event; the generic navigation type doesn't list it.
    const off: () => void = stack ? nav.addListener("transitionEnd", go) : () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => { timer = setTimeout(go, stack ? CAP_MS : 0); });
    return () => { off(); cancelAnimationFrame(frame); if (timer) clearTimeout(timer); };
  }, [ready, nav]);
  return ready;
}
