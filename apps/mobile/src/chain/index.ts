// The wallet and TxService the app uses: MWA unless the Dev menu (or API mode "mock") picks the mock.
// The real TxService arrives in Phase 3; until then transactions always go through the mock.
import { useDev } from "@/state/dev";
import { createMockTx, createMockWallet } from "./mock";
import { mwaWallet } from "./mwa";
import type { TxService, WalletSession } from "./types";

export * from "./types";
export { classifyTxError } from "./classify";

const scenario = () => useDev.getState().scenario;
const mockWallet = createMockWallet(scenario);
const mockTx = createMockTx(scenario);

export function getWallet(): WalletSession {
  return useDev.getState().mockWallet ? mockWallet : mwaWallet;
}

export function getTx(): TxService {
  return mockTx;
}
