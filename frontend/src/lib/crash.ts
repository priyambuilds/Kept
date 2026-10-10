// Crash safety (D-87). Two holes React's error boundary doesn't cover:
// - Errors thrown outside render (a press handler, a timer, a native callback) go to RN's global handler,
//   which in a release build kills the app on a fatal one. Here they open the recover screen instead.
// - Unhandled promise rejections: Hermes drops them silently in release (RN only tracks them in dev). Here
//   they're logged and the app says once that something didn't work, so a tap that did nothing is explained.
// Both are kept in a short in-memory log (`recentErrors`) for debugging; nothing leaves the phone.

type Fatal = (e: Error) => void;
type Rejection = (e: unknown) => void;

const fatalListeners = new Set<Fatal>();
const rejectionListeners = new Set<Rejection>();
const log: { at: number; kind: "fatal" | "error" | "rejection"; message: string }[] = [];
const LOG_MAX = 20;

export const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(typeof e === "string" ? e : "Unknown error"));

function record(kind: (typeof log)[number]["kind"], e: unknown) {
  log.push({ at: Date.now(), kind, message: toError(e).message });
  if (log.length > LOG_MAX) log.shift();
}

export const recentErrors = () => [...log];

/** The recover screen listens; returns the unsubscribe. */
export function onFatal(f: Fatal): () => void { fatalListeners.add(f); return () => { fatalListeners.delete(f); }; }
/** The toast listens; returns the unsubscribe. */
export function onRejection(f: Rejection): () => void { rejectionListeners.add(f); return () => { rejectionListeners.delete(f); }; }

/** A fatal error from outside render: shown on the recover screen (when it's mounted). */
export function reportFatal(e: unknown): boolean {
  record("fatal", e);
  fatalListeners.forEach((f) => f(toError(e)));
  return fatalListeners.size > 0;
}

export function reportRejection(e: unknown) {
  record("rejection", e);
  rejectionListeners.forEach((f) => f(e));
}

interface ErrorUtilsLike {
  getGlobalHandler(): (e: unknown, isFatal?: boolean) => void;
  setGlobalHandler(h: (e: unknown, isFatal?: boolean) => void): void;
}
interface HermesLike {
  enablePromiseRejectionTracker?(o: { allRejections: boolean; onUnhandled: (id: number, e: unknown) => void; onHandled: (id: number) => void }): void;
}

let installed = false;

/** Called once from index.ts, before the app mounts. */
export function installCrashHandlers() {
  if (installed) return;
  installed = true;
  const g = globalThis as unknown as { ErrorUtils?: ErrorUtilsLike; HermesInternal?: HermesLike };
  const eu = g.ErrorUtils;
  if (eu) {
    const previous = eu.getGlobalHandler();
    eu.setGlobalHandler((e, isFatal) => {
      // Development keeps RN's red box; release shows the recover screen instead of closing the app.
      if (__DEV__) { previous(e, isFatal); return; }
      if (!isFatal) { record("error", e); return; }
      if (!reportFatal(e)) previous(e, isFatal); // nothing mounted to recover with: RN's own handling
    });
  }
  // In development RN already tracks rejections (the LogBox warning); this replaces it with ours, which
  // also warns in development.
  g.HermesInternal?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id, e) => {
      if (__DEV__) console.warn("Unhandled promise rejection:", e);
      reportRejection(e);
    },
    onHandled: () => undefined,
  });
}
