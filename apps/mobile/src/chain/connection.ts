import { Connection, PublicKey } from "@solana/web3.js";
import { env } from "@/config/env";

let conn: Connection | null = null;
/** One shared RPC connection (created lazily so tests that never touch the chain don't open one). */
export function connection(): Connection {
  conn ??= new Connection(env.rpcUrl, "confirmed");
  return conn;
}

/** SOL (lamports) and SKR (base units) for a wallet, read from RPC. Works for SPL and Token-2022 mints. */
export async function readBalances(wallet: string): Promise<{ sol: bigint; skr: bigint }> {
  const owner = new PublicKey(wallet);
  const c = connection();
  const [lamports, tokens] = await Promise.all([
    c.getBalance(owner, "confirmed"),
    env.stakeMint ? c.getParsedTokenAccountsByOwner(owner, { mint: new PublicKey(env.stakeMint) }, "confirmed") : Promise.resolve(null),
  ]);
  let skr = 0n;
  for (const a of tokens?.value ?? []) {
    const info = (a.account.data as { parsed?: { info?: { tokenAmount?: { amount?: string } } } }).parsed?.info;
    skr += BigInt(info?.tokenAmount?.amount ?? "0");
  }
  return { sol: BigInt(lamports), skr };
}
