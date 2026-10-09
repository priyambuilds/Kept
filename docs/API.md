# KEPT API (`apps/api`)

Express + Prisma backend. Base URL in dev: `http://localhost:3000` (use `adb reverse tcp:3000 tcp:3000` for a phone).
This file documents the routes **as they exist today** (`apps/api/src/routes/v4.ts`, `src/routes/assetlinks.ts`, `src/index.ts`). Routes added by the mobile work are listed in the last section with their status. The zod schemas in `packages/shared` (Phase 1) mirror these shapes, and the app validates every response with them.

**Conventions**
- JSON bodies (limit 12 MB, `src/index.ts:9`).
- Errors are always `{ "error": "<English sentence>" }` plus an HTTP status. There are no machine codes yet (BACKEND_GAPS P1-14).
- **Auth:** `Authorization: Bearer <token>` from `/api/auth/verify`. Tokens are HMAC-signed and valid 7 days.
- **Genesis gate:** every `/api/*` route **except** `/api/auth/*` and `GET /api/me` also requires a Seeker Genesis Token, else 403 `"A Seeker Genesis Token is required"` (`v4.ts:50-62`). In dev, `SGT_MOCK=true` + `SGT_MOCK_ALLOWLIST` decides.
- Oath addresses are base58 public keys of on-chain `Oath` accounts. Amounts are strings in base units (SKR has 6 decimals).

---

## Public

### `GET /health`
→ `200 {"ok": true}`

### `GET /.well-known/assetlinks.json`
Android Digital Asset Links for wallet identity verification (`src/routes/assetlinks.ts`). Currently lists `com.kept.backendtest` only (BACKEND_GAPS P2-7).

### `POST /api/auth/nonce`
Body `{wallet}` → `200 {message}`. The message the wallet signs:
```
KEPT V4 sign-in
Wallet: <base58>
Nonce: <64 hex>
This signature only signs in and cannot move funds.
```
Valid 5 minutes, single use. `400` on an invalid wallet.

### `POST /api/auth/verify`
Body `{wallet, message, signature}` (signature base64, ed25519 over the exact message) → `200 {token, wallet}`. `401` on a bad, expired or replayed signature.

## Signed in (no Genesis needed)

### `GET /api/me`
→ `200 {wallet, genesis: boolean, mocked: boolean, genesisMint: string|null}`. `409` if the Genesis token is already bound to another wallet.

## Signed in + Genesis

### `POST /api/oaths/watch`
Body `{oath}` → `204`. Registers the Oath with the settlement and reminder scheduler. Caller must be a member (`403`). **The app must call this after create and join** (BACKEND_GAPS P0-9).

### `POST /api/oaths/details`
Body `{oath, goalText}` (1–120 chars, trimmed, SHA-256 must equal the on-chain `goal_hash`) → `201 {oath, goalText}`. Creator only, while Open. `400 / 403 / 404 / 422`.

### `GET /api/oaths/:oath/details`
→ `200 {goalText: string|null}`. Members only (`403`).

### `POST /api/invites`
Body `{oath}` → `201 {code, deepLink: "kept://join/<code>", oath: OathRead}`. Members only, Oath Open.

### `GET /api/invites/:code`
→ `200 {oath: OathRead, goalText: string|null, alreadyStarted: boolean}`. `404` unknown code or Oath.

`OathRead` = `{oathId, creator, goalHash, status (0 Open|1 Active|2 Settled|3 Cancelled), startTs, daySeconds, numDays, objectId, members: string[], daysKept: Record<wallet, bitmask>}`.

### `POST /api/proof`
Body `{oath, dayIndex, photo (base64 jpeg/png, 100 B–8 MB), detection: {object:{label, confidence}, gesture:{label, confidence}, target:{object, gesture}}}`.
- The detection must match today's target (`dailyTarget`, `v4.ts:226`) with confidence ≥ 0.7. **It's client-supplied** (BACKEND_GAPS P0-1).
- On success the verifier records the check-in on chain → `201 {signature, proofHash, target}` (`200` with `recovered: true` when it resumes a pending one).
- Errors: `400` bad input or wrong day · `403` non-member · `404` · `409` not active, outside the day window, duplicate · `413` size · `422 {error, expected}` detection mismatch · `502 {error, retryable: true}` · `503` verifier not configured.

### `GET /api/photos/:oath/:day` and `GET /api/photos/file/:id`
Return other members' proof photos. **To be removed** (BACKEND_GAPS P0-11). The app doesn't use them.

### `POST /api/push-token`
Body `{token}` (FCM device token, ≤ 4096) → `204`.

### `POST /api/nudges`
Body `{oath, recipient, dayIndex}` → `201 {ok: true}`. Only for an Active Oath, today's day, a recipient who hasn't checked in; once per sender/recipient/day (`429`). Sends an FCM push.

### `GET /api/price`
→ `200 {usdPerSkr: 0.01, skrForUsd10: 1000, devnet: true, label: "placeholder rate"}`.

### `POST /api/faucet`
Devnet only. Sends 5,000 SKR once per wallet → `200 {signature, amount: "5000", mint}`. `429` if already used, `503` if not configured, `502` on transfer failure.

---

## Background jobs
`startV4Scheduler()` (`v4.ts:264`), every 60 s, over `OathWatch` rows:
- Active Oath with ≤ 2 h left in the day → FCM reminder to members who haven't checked in (once per member/day).
- Active Oath past its last day → `settle_oath` signed by the verifier key, then proof photos deleted.
- Settled Oath → proof photos deleted.

---

## Proposed routes (not implemented)
The app codes against these through `KeptApi` with a **mock** until the backend developer adds them. Shapes and reasons are in `BACKEND_GAPS.md` (P0-2, P0-10, P1-1, P1-2, P1-7, P1-9, P1-10, P1-11, P1-14). Each one is **proposed**: none exists in `apps/api` today.
