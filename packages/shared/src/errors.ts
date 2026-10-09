import { z } from "zod";

/**
 * Error codes the app needs to pick the right screen. The backend doesn't send codes yet
 * (BACKEND_GAPS P1-14); until it does, the http adapter derives them from status + route.
 */
export const ApiErrorCode = z.enum([
  "UNAUTHORIZED",
  "NOT_ELIGIBLE",        // A3·no, E3·elig, H2·no
  "GENESIS_TAKEN",
  "INVITE_NOT_FOUND",    // E3·code
  "OATH_STARTED",        // E3·late
  "ALREADY_MEMBER",      // E3·in
  "OATH_FULL",
  "INSUFFICIENT_SKR",    // E3·skr, M4
  "INSUFFICIENT_SOL",    // M3
  "NOT_ACTIVE",
  "OUTSIDE_DAY_WINDOW",
  "DUPLICATE",
  "PROOF_FAIL",          // F2a
  "PROOF_UNAVAILABLE",   // F2b
  "CHALLENGE_EXPIRED",   // F2c
  "FAUCET_USED",
  "RATE_LIMITED",
  "NOT_FOUND",
  "BAD_REQUEST",
  "SERVER",
  "OFFLINE",             // M2 (client-side)
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

/** Today's error body: `{error}` (+ `code` once P1-14 lands; + route-specific extras). */
export const ErrorBody = z.object({
  error: z.string(),
  code: ApiErrorCode.optional(),
  retryable: z.boolean().optional(),
}).loose();
export type ErrorBody = z.infer<typeof ErrorBody>;
