// Navigation by design id. Screens never spell route names: they call go("D2"), replace("C7·ok"),
// back(). Tab ids route into the Tabs navigator; signing screens are replaced, never pushed back to.
import { useCallback, useMemo } from "react";
import { CommonActions, StackActions, createNavigationContainerRef, useNavigation, useRoute } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useSession } from "@/state/session";
import { presentation, routeName } from "./routes";
import type { DesignId } from "./routes";

export type Params = Record<string, string | number | boolean | undefined>;
export const navigationRef = createNavigationContainerRef<ParamListBase>();

/** Route + params for a design id (tabs are nested in "Tabs"). */
export function target(id: DesignId, params?: Params): [string, object | undefined] {
  return presentation(id) === "tab" ? ["Tabs", { screen: routeName(id), params }] : [routeName(id), params];
}

export function useGo() {
  const nav = useNavigation<NavigationProp<ParamListBase>>();
  const go = useCallback((id: DesignId, params?: Params) => { const [n, p] = target(id, params); nav.navigate(n, p); }, [nav]);
  const replace = useCallback((id: DesignId, params?: Params) => { const [n, p] = target(id, params); nav.dispatch(StackActions.replace(n, p)); }, [nav]);
  const back = useCallback(() => { if (nav.canGoBack()) nav.goBack(); }, [nav]);
  /** Clears the stack: used when onboarding ends or the user signs out. */
  const reset = useCallback((id: DesignId, params?: Params) => {
    const [n, p] = target(id, params);
    nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: n, params: p }] }));
  }, [nav]);
  return useMemo(() => ({ go, replace, back, reset }), [go, replace, back, reset]);
}

/**
 * flows.md `cont:` rule: go to `fallback`, or to E1 with the invite code if the user arrived with an
 * invite (then forget it).
 */
export function useContinue() {
  const { reset } = useGo();
  return useCallback((fallback: DesignId) => {
    const { invite, setInvite } = useSession.getState();
    if (invite !== null) {
      setInvite(null);
      reset("B1");
      const [n, p] = target("E1", invite ? { code: invite } : undefined);
      setTimeout(() => navigationRef.isReady() && navigationRef.navigate(n, p), 0);
    } else {
      reset(fallback);
    }
  }, [reset]);
}

/** Navigate from outside React (hosts, deep links). */
export function navigateTo(id: DesignId, params?: Params) {
  if (!navigationRef.isReady()) return;
  const [n, p] = target(id, params);
  navigationRef.navigate(n, p);
}

/** Route params as strings/numbers (every screen reads them through this). */
export function useParams<P extends Params>(): Partial<P> {
  return (useRoute().params ?? {}) as Partial<P>;
}
