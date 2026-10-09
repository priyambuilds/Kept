// Dev scenarios (docs/ARCHITECTURE.md §6). Each one seeds the mock store so a screen state can be
// reached on the device without the backend. Phase 2 wires the ones that affect sign-in, balances,
// inbox and errors; the Oath scenarios get their data in Phase 3.
export const SCENARIOS = [
  "fresh", "activeGroup", "deadlineClose", "allDone", "lowHp", "broken", "settledKept", "settledMissed",
  "rematchActive", "bountyJoined", "bountyOut", "notEligible", "offline", "walletRejected", "txFailed", "noSol", "noSkr",
] as const;
export type Scenario = (typeof SCENARIOS)[number];
export const DEFAULT_SCENARIO: Scenario = "activeGroup";

/** Scenarios whose effect is on the wallet / TxService rather than the API. */
export const WALLET_SCENARIOS: readonly Scenario[] = ["walletRejected", "txFailed", "noSol", "noSkr"];
