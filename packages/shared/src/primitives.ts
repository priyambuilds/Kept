import { z } from "zod";

/** A base58 Solana address (32–44 chars of the base58 alphabet). */
export const Address = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "not a base58 address");
/** Token amount in base units, sent as a decimal string, parsed to bigint. */
export const Amount = z.string().regex(/^\d+$/, "not a base-unit amount").transform((s) => BigInt(s));
/** ISO-8601 timestamp → unix seconds. */
export const IsoTime = z.iso.datetime({ offset: true }).transform((s) => Math.floor(Date.parse(s) / 1000));
export const UnixSeconds = z.number().int().nonnegative();
