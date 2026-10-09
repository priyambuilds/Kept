// Turns wallet / RPC / program failures into the few outcomes the screens care about
// (C7·no, C7·fail, M3, M4, M2). The raw text is kept for logs.
import { PROGRAM_ERRORS } from "./idl";

export type TxErrorKind = "rejected" | "insufficientSol" | "insufficientSkr" | "offline" | "failed";

export interface ClassifiedTxError {
  kind: TxErrorKind;
  /** Program error name when the program rejected it (e.g. "NotOpen"). */
  programError?: string;
  raw: string;
}

const rawOf = (e: unknown) => (e instanceof Error ? `${e.name}: ${e.message}` : typeof e === "string" ? e : JSON.stringify(e));

export function classifyTxError(e: unknown): ClassifiedTxError {
  const raw = rawOf(e);
  const t = raw.toLowerCase();
  // MWA: user declined in the wallet (ERROR_AUTHORIZATION_FAILED / -1 / "declined").
  if (/declin|reject|cancel|authorization_failed|user denied|not authorized/.test(t)) return { kind: "rejected", raw };
  if (/network request failed|failed to fetch|enotfound|econnrefused|timed? ?out|offline/.test(t)) return { kind: "offline", raw };
  if (/insufficient (funds|lamports)|attempt to debit an account but found no record of a prior credit|0x1\b.*lamports/.test(t)) {
    return { kind: "insufficientSol", raw };
  }
  // Token program: insufficient funds is custom error 0x1 from the token program.
  if (/insufficient funds/.test(t) || /tokenkeg|tokenz.*custom program error: 0x1\b/.test(t)) return { kind: "insufficientSkr", raw };
  const hex = raw.match(/custom program error: (0x[0-9a-f]+)/i);
  const named = raw.match(/Error Code: (\w+)/);
  const code = hex ? parseInt(hex[1]!, 16) : undefined;
  const programError = named?.[1] ?? (code !== undefined ? PROGRAM_ERRORS.get(code)?.name : undefined);
  return programError ? { kind: "failed", programError, raw } : { kind: "failed", raw };
}
