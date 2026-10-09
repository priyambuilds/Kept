// Generated Oath names (DECISIONS D-16): "<object word> <length>", e.g. "Iron Week", "Page 14".
import { oathNameParts } from "@kept/engine";
import { t } from "@/copy";

export function oathName(objectId: number, numDays: number): string {
  const p = oathNameParts(objectId, numDays);
  return t("additions.oathName.pattern", {
    word: t(`additions.oathName.words.${p.word}`),
    length: p.length === "week" ? t("additions.oathName.week") : String(p.length),
  });
}

/** "7xKp…3F9q" for wallets without a name. */
export const shortWallet = (w: string) => `${w.slice(0, 4)}…${w.slice(-4)}`;
