// Whether the enclosing screen is focused, and true outside a navigator (tests, the Gallery). Read
// through a store so a focus that fires before anything subscribes (a reset, a deep link) is seen.
import { useCallback, useContext, useSyncExternalStore } from "react";
import { NavigationContext } from "@react-navigation/native";

export function useScreenFocused(): boolean {
  const nav = useContext(NavigationContext);
  const subscribe = useCallback((cb: () => void) => {
    if (!nav) return () => {};
    const a = nav.addListener("focus", cb);
    const b = nav.addListener("blur", cb);
    return () => { a(); b(); };
  }, [nav]);
  return useSyncExternalStore(subscribe, () => (nav ? nav.isFocused() : true));
}
