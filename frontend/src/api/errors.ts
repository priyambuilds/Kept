// One error type for every API failure. The backend doesn't send machine codes yet (BACKEND_GAPS
// P1-14), so the http adapter derives a code from the HTTP status and the route. The one message it
// reads is the Genesis middleware's, because that 403 is otherwise identical to a membership 403.
import { ErrorBody } from "@kept/shared";
import type { ApiErrorCode } from "@kept/shared";

export class ApiError extends Error {
  constructor(public readonly code: ApiErrorCode, message: string, public readonly status = 0, public readonly retryable = false) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** Per-route status → code overrides, for routes whose statuses mean something specific. */
const ROUTE_CODES: { match: RegExp; status: number; code: ApiErrorCode }[] = [
  { match: /^GET \/api\/invites\//, status: 404, code: "INVITE_NOT_FOUND" },
  { match: /^POST \/api\/faucet$/, status: 429, code: "FAUCET_USED" },
  { match: /^GET \/api\/me$/, status: 409, code: "GENESIS_TAKEN" },
  { match: /^POST \/api\/proof$/, status: 422, code: "PROOF_FAIL" },
  { match: /^POST \/api\/proof$/, status: 502, code: "PROOF_UNAVAILABLE" },
  { match: /^POST \/api\/proof$/, status: 409, code: "OUTSIDE_DAY_WINDOW" },
];

const GENESIS_REQUIRED = "A Seeker Genesis Token is required";

export function toApiError(route: string, status: number, body: unknown): ApiError {
  const parsed = ErrorBody.safeParse(body);
  const message = parsed.success ? parsed.data.error : `Request failed (${status})`;
  const retryable = parsed.success ? parsed.data.retryable === true : false;
  if (parsed.success && parsed.data.code) return new ApiError(parsed.data.code, message, status, retryable);
  const routed = ROUTE_CODES.find((r) => r.status === status && r.match.test(route));
  if (routed) return new ApiError(routed.code, message, status, retryable);
  // The Genesis middleware's 403 is the one message we must tell apart from other 403s (v4.ts:50-62).
  if (status === 403 && message === GENESIS_REQUIRED) return new ApiError("NOT_ELIGIBLE", message, status);
  const code: ApiErrorCode =
    status === 400 ? "BAD_REQUEST" : status === 401 ? "UNAUTHORIZED" : status === 403 ? "UNAUTHORIZED"
      : status === 404 ? "NOT_FOUND" : status === 409 ? "DUPLICATE" : status === 429 ? "RATE_LIMITED" : "SERVER";
  return new ApiError(code, message, status, retryable || status >= 500);
}

/**
 * A failed read from the Solana RPC (the public Devnet one rate-limits). web3.js already retries a 429 with
 * backoff; what's left is: still rate-limited → RATE_LIMITED, no answer (network, our timeout) → OFFLINE,
 * anything else → SERVER. All three are worth retrying.
 */
export function fromRpcError(e: unknown): ApiError {
  const message = e instanceof Error ? e.message : String(e);
  if (/\b429\b|too many requests|rate limit/i.test(message)) return new ApiError("RATE_LIMITED", message, 429, true);
  if (/network request failed|failed to fetch|abort|timed? ?out|ENOTFOUND|ECONNREFUSED/i.test(message)) return new ApiError("OFFLINE", message, 0, true);
  return new ApiError("SERVER", message, 0, true);
}
