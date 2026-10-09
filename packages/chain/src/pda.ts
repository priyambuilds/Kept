import { PublicKey } from "@solana/web3.js";

const enc = (s: string) => new TextEncoder().encode(s);
const u64le = (x: bigint) => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, x, true);
  return b;
};

/** PDAs of kept_test (lib.rs:9-12). */
export const configPda = (programId: PublicKey) => PublicKey.findProgramAddressSync([enc("config")], programId)[0];
export const oathPda = (programId: PublicKey, creator: PublicKey, oathId: bigint) =>
  PublicKey.findProgramAddressSync([enc("oath"), creator.toBytes(), u64le(oathId)], programId)[0];
export const vaultPda = (programId: PublicKey, oath: PublicKey) => PublicKey.findProgramAddressSync([enc("vault"), oath.toBytes()], programId)[0];
export const keeperPda = (programId: PublicKey, authority: PublicKey) => PublicKey.findProgramAddressSync([enc("keeper"), authority.toBytes()], programId)[0];
