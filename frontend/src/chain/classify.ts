// Turns whatever the wallet, RPC or program threw into a TxError, which picks the screen:
// rejected → C7·no / A2·e, failed → C7·fail, insufficientSol → M3, insufficientSkr → M4, offline → M2,
// noWallet (no MWA wallet app installed) → back to A2 with a toast on sign-in, C7·fail elsewhere.
import { TxFailure } from "./types";
import type { TxError } from "./types";

/** MWA protocol codes (mobile-wallet-adapter-protocol): −1 authorization failed, −3 not signed. */
const DECLINED_PROTOCOL_CODES = new Set([-1, -3]);
/** MWA client codes that mean the user backed out of the wallet. */
const DECLINED_CLIENT_CODES = new Set(["ERROR_ASSOCIATION_CANCELLED", "ERROR_SESSION_CLOSED"]);

export function classifyTxError(e: unknown): TxFailure {
  if (e instanceof TxFailure) return e;
  const err = e as { name?: string; code?: unknown; message?: string; logs?: string[] } | null;
  const message = err?.message ?? String(e);
  const kind = ((): TxError => {
    if (err?.name === "SolanaMobileWalletAdapterProtocolError" && DECLINED_PROTOCOL_CODES.has(err.code as number)) return "rejected";
    if (err?.name === "SolanaMobileWalletAdapterError" && DECLINED_CLIENT_CODES.has(err.code as string)) return "rejected";
    if (err?.code === "ERROR_WALLET_NOT_FOUND" || /no installed wallet|wallet not found/i.test(message)) return "noWallet";
    if (/network request failed|failed to fetch|ENOTFOUND|ECONNREFUSED/i.test(message)) return "offline";
    // System program: account can't pay the fee / rent.
    if (/insufficient lamports|Attempt to debit an account but found no record of a prior credit/i.test(message)) return "insufficientSol";
    // SPL Token / Token-2022 InsufficientFunds is custom error 0x1.
    if (/insufficient funds|custom program error: 0x1\b/i.test(message)) return "insufficientSkr";
    return "failed";
  })();
  return new TxFailure(kind, message);
}
