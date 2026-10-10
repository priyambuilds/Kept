// Dev scenarios (docs/ARCHITECTURE.md §6). Each one seeds the mock store so a screen state can be
// reached on the device without the backend. Phase 2 wires the ones that affect sign-in, balances,
// inbox and errors; the Oath scenarios get their data in Phase 3.
export const SCENARIOS = [
  // Demo mode's account (D-80): the core ideas reachable from Today in two minutes.
  "judges",
  "fresh", "activeGroup", "deadlineClose", "allDone", "lowHp", "broken", "settledKept", "settledMissed",
  "rematchActive", "bountyJoined", "bountyOut", "notEligible", "offline", "walletRejected", "txFailed", "noSol", "noSkr",
  "proofFail", "proofUnavailable",
  // Finished Oaths for the result screens (L4, L4·m, L4·b, R4, R4·lost, L6).
  "soloKept", "soloMissed", "soloBroken", "rematchKept", "rematchLost",
] as const;
export type Scenario = (typeof SCENARIOS)[number];
export const DEFAULT_SCENARIO: Scenario = "judges";

/** Scenarios whose effect is on the wallet / TxService rather than the API. */
export const WALLET_SCENARIOS: readonly Scenario[] = ["walletRejected", "txFailed", "noSol", "noSkr"];
