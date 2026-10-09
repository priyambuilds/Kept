import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { config } from "./config.js";

export const connection = new Connection(config.devnetRpcUrl, "confirmed");
export const programId = new PublicKey(config.programId);

export function keypairFromEnv(raw: string): Keypair {
  const parsed = JSON.parse(raw.startsWith("[") ? raw : `[${raw}]`) as number[];
  if (!Array.isArray(parsed) || parsed.length !== 64) throw new Error("Secret key must be a 64-byte JSON array");
  return Keypair.fromSecretKey(Uint8Array.from(parsed));
}

export async function tokenProgramForMint(mint: PublicKey) {
  const a = await connection.getAccountInfo(mint, "confirmed");
  if (!a) throw new Error("Stake mint not found");
  if (a.owner.equals(TOKEN_2022_PROGRAM_ID)) return TOKEN_2022_PROGRAM_ID;
  if (a.owner.equals(TOKEN_PROGRAM_ID)) return TOKEN_PROGRAM_ID;
  throw new Error("Stake mint is not owned by Token or Token-2022");
}
