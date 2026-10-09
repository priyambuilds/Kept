// Mobile Wallet Adapter session, ported from legacy/harness-app/src/chain/wallet.ts. The wallet's
// auth_token is remembered so the user connects once; later requests re-authorize silently and fall
// back to a full authorize if the wallet rejects the token.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { PublicKey, Transaction } from "@solana/web3.js";
import type { TransactionInstruction } from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import type { Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { env, walletChain } from "@/config/env";
import { classifyTxError } from "./classify";
import { connection } from "./connection";
import type { WalletSession } from "./types";

const STORAGE_KEY = "kept.mwa";
/** How long to wait for the app to be in front again after the wallet returns. */
const FOREGROUND_WAIT_MS = 30_000;
const identity = { name: env.identity.name, uri: env.identity.uri };

type Saved = { authToken: string; address: string };
let saved: Saved | null | undefined;

async function load(): Promise<Saved | null> {
  if (saved !== undefined) return saved;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    saved = raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    saved = null;
  }
  return saved;
}
async function save(next: Saved | null): Promise<void> {
  saved = next;
  try {
    if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best effort: the in-memory session still works for this run.
  }
}

async function authorize(wallet: Web3MobileWallet): Promise<PublicKey> {
  const prev = await load();
  let auth;
  if (prev) {
    try {
      auth = await wallet.authorize({ chain: walletChain, identity, auth_token: prev.authToken });
    } catch {
      await save(null); // revoked or expired: ask again below
    }
  }
  auth ??= await wallet.authorize({ chain: walletChain, identity });
  const account = auth.accounts[0];
  if (!account) throw new Error("Wallet authorized but returned no account");
  const key = new PublicKey(Buffer.from(account.address, "base64"));
  await save({ authToken: auth.auth_token, address: key.toBase58() });
  return key;
}

function waitForForeground(): Promise<void> {
  if (AppState.currentState === "active") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { sub.remove(); reject(new Error("App did not return to the foreground after the wallet")); }, FOREGROUND_WAIT_MS);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") { clearTimeout(timer); sub.remove(); resolve(); }
    });
  });
}

async function run<T>(fn: (w: Web3MobileWallet) => Promise<T>): Promise<T> {
  try {
    const r = await transact(fn);
    await waitForForeground();
    return r;
  } catch (e) {
    throw classifyTxError(e);
  }
}

export const mwaWallet: WalletSession = {
  connect: async () => (await run(authorize)).toBase58(),
  signMessage: (message) => run(async (w) => {
    const key = await authorize(w);
    const [signature] = await w.signMessages({ addresses: [Buffer.from(key.toBytes()).toString("base64")], payloads: [new TextEncoder().encode(message)] });
    if (!signature) throw new Error("Wallet did not return a message signature");
    return { wallet: key.toBase58(), signature };
  }),
  forget: () => save(null),
};

/**
 * Builds a transaction from instructions, simulates it (a rejected tx otherwise surfaces only as
 * "block height exceeded"), has the wallet sign and send it, and waits for confirmation. Used by
 * the real TxService in Phase 3.
 */
export async function signAndSend(payer: PublicKey, ixs: TransactionInstruction[]): Promise<string> {
  try {
    const c = connection();
    const { blockhash, lastValidBlockHeight } = await c.getLatestBlockhash("confirmed");
    const tx = new Transaction({ feePayer: payer, blockhash, lastValidBlockHeight }).add(...ixs);
    const sim = await c.simulateTransaction(tx);
    if (sim.value.err) throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}\n${(sim.value.logs ?? []).join("\n")}`);
    const minContextSlot = await c.getSlot("confirmed");
    const latest = await c.getLatestBlockhash("confirmed");
    tx.recentBlockhash = latest.blockhash;
    tx.lastValidBlockHeight = latest.lastValidBlockHeight;
    const [signature] = await run(async (w) => {
      const key = await authorize(w);
      if (!key.equals(payer)) throw new Error(`Wallet switched accounts: expected ${payer.toBase58()}, got ${key.toBase58()}`);
      return w.signAndSendTransactions({ transactions: [tx], minContextSlot }); // Phantom rejects without minContextSlot
    });
    if (!signature) throw new Error("Wallet returned no signature");
    const res = await c.confirmTransaction({ signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, "confirmed");
    if (res.value.err) throw new Error(`Transaction ${signature} failed on chain: ${JSON.stringify(res.value.err)}`);
    return signature;
  } catch (e) {
    throw classifyTxError(e);
  }
}
