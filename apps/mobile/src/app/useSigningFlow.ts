// Transient signing screens (A2·s, C7, D1·go, …) run one wallet task and then REPLACE themselves with
// the result screen, so the back stack never points at a pending state (flows.md › Navigation model).
import { useEffect, useRef, useState } from "react";
import { useGo } from "./nav";
import type { Params } from "./nav";
import type { DesignId } from "./routes";

export type SignOutcome = { to: DesignId; params?: Params; delayMs?: number };

/**
 * Starts `task` once on mount. `resolve` maps its result (or thrown error) to the screen to show next.
 * Returns the in-progress state for SignStatus and a `retry` for screens that offer one.
 */
export function useSigningFlow<T>(task: () => Promise<T>, resolve: (r: { ok: true; value: T } | { ok: false; error: unknown }) => SignOutcome) {
  const { replace } = useGo();
  const [state, setState] = useState<"pending" | "success" | "fail">("pending");
  const started = useRef(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    task().then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    ).then((r) => {
      if (!alive.current) return;
      setState(r.ok ? "success" : "fail");
      const out = resolve(r);
      setTimeout(() => { if (alive.current) replace(out.to, out.params); }, out.delayMs ?? 0);
    });
  }, [task, resolve, replace]);
  return state;
}
