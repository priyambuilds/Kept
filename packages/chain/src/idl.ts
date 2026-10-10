import { BorshAccountsCoder, BorshInstructionCoder } from "@anchor-lang/core";
import type { Idl } from "@anchor-lang/core";
import idlJson from "../idl/kept_test.json";

/** The kept_test IDL, synced from onchain/target by `pnpm --filter @kept/chain idl:sync`. */
export const IDL = idlJson as unknown as Idl;
export const accountsCoder = new BorshAccountsCoder(IDL);
export const instructionCoder = new BorshInstructionCoder(IDL);

/** Program error code → name and message, straight from the IDL (6000 InvalidFee, …). */
export const PROGRAM_ERRORS: ReadonlyMap<number, { name: string; msg: string }> = new Map(
  (idlJson.errors ?? []).map((e: { code: number; name: string; msg?: string }) => [e.code, { name: e.name, msg: e.msg ?? e.name }]),
);
