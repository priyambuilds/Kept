// The wallet and TxService the app uses. The wallet is the mock in Demo and MWA in Live (a development
// build's Dev menu can swap in the mock). A transaction goes to the program for chain Oaths and to the
// mock store for mock Oaths; Demo only has mock Oaths, Live only chain ones.
import { useDev, mockWalletOn } from "@/state/dev";
import { useSession } from "@/state/session";
import type { OathSource } from "@/features/oaths/model";
import { createMockTx, createMockWallet } from "./mock";
import { mwaWallet } from "./mwa";
import { realTx } from "./realTx";
import type { TxService, WalletSession } from "./types";

export * from "./types";
export { classifyTxError } from "./classify";

const scenario = () => useDev.getState().scenario;
const mockWallet = createMockWallet(scenario);
const mockTx = createMockTx(scenario, () => useSession.getState().wallet);

export function getWallet(): WalletSession {
  return mockWalletOn() ? mockWallet : mwaWallet;
}

export function getTx(source: OathSource): TxService {
  return source === "chain" ? realTx : mockTx;
}
