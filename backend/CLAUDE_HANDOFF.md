# Claude handoff: KEPT backend and Render connection

Read this before merging the KEPT mobile app with the backend.

## Workspace boundary

- Work only in this KEPT application workspace. Do not request or use direct access to the separate backend folder or its credentials.
- The integrated Node API for this app is already under `backend/` (not `apps/api`). Its source, Prisma schema and migrations, tests, package manifest, and TypeScript config are already synchronized with the intended backend.
- `backend/scripts/build-info.mjs` uses the pnpm lockfile path for this monorepo. Keep that workspace-specific path.
- Use `frontend/` for the mobile client and `onchain/` for the program. Do not copy external harness, legacy, generated, or secret files into the app workspace.

## Render service and current diagnosis

- API base URL: `https://kepttestapp.onrender.com`.
- Checked on 2026-10-10: `GET /health` returned HTTP 200 for `kept-v4`, API v4. The reported source hash matches the supplied backend's build metadata.
- An unauthenticated `GET /api/price` returned HTTP 401 `Sign-in required`. The service is reachable; this response means the route requires the app's bearer session.
- The app's `frontend/src/config/env.ts` and `.env.example` now default `EXPO_PUBLIC_API_URL` to `https://kepttestapp.onrender.com`. The local API port refused connections during diagnosis. On Android, `localhost` refers to the phone. Rebuild/reinstall after changing build-time Expo variables.
- Set `EXPO_PUBLIC_STAKE_MINT` to the public Devnet mint configured as `STAKE_MINT` on the backend. Never put `DATABASE_URL` or other server secrets in Expo variables.

## Database diagnosis

- The mobile app does not connect directly to Postgres. The Express API uses Prisma and its server-side `DATABASE_URL` to reach the managed database.
- `/health` in `backend/src/app.ts` returns static build metadata and does **not** query Postgres. A 200 from `/health` confirms the API process is serving requests; it does not confirm database connectivity.
- The actual Render `DATABASE_URL` value is not visible from this workspace. Confirm that the Render service has it configured and inspect startup/runtime logs for Prisma or migration errors without exposing the value.
- To exercise a database-backed API path, complete wallet sign-in and call `GET /api/me`; it reads `SessionSeat` through Prisma. An unauthenticated request cannot establish database health.

## Integration constraints

- Keep Live and Demo isolated. Live must not silently fall back to mock data.
- Live proof currently requires a backend `verificationId` from the proof-verification flow. Do not send a fabricated client detection as a substitute; use the designed unavailable state until the client can provide a valid verification.
- Rematch and other unsupported Live features must follow `docs/BACKEND_GAPS.md` and the current design's unavailable states.
- Do not change HP, staking, or payout rules while connecting the API. Escalate contract mismatches that affect money or HP.
