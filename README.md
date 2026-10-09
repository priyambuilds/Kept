# KEPT

Android app for the Solana Seeker: swear daily Oaths, stake SKR, prove each day with two photos.

| Path | What |
|---|---|
| `apps/api` | Express + Prisma backend (V4 Devnet prototype) |
| `apps/mobile` | the new Expo app (from Phase 1) |
| `programs/kept` | Anchor program `kept_test` (`6iXXBqsdiCnUTSVf8CW3Uuw8c7iYvZSj5haz64QMuMUh`) |
| `packages/*` | shared config, engine, schemas, chain client (from Phase 1) |
| `design/` | the design handoff (read-only source of truth) |
| `docs/` | architecture, backend gaps, decisions, build plan, API |
| `legacy/` | the old harness app, V3 code and docs (reference only, not built) |

## Setup
Requires Node ≥ 20, pnpm, Docker (local Postgres). For the program: Rust, Solana CLI (Agave), Anchor 1.2.0.

```bash
pnpm install
pnpm db:up                       # Postgres 16 on localhost:5432 (user/pass/db: kept)
cp apps/api/.env.example apps/api/.env   # then fill it in (see apps/api/.env.example)
pnpm --filter @kept/api exec prisma migrate deploy
pnpm api:dev                     # http://localhost:3000
```

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm program:build`, `pnpm program:test` (build the program before testing it; its tests load `target/idl`).

## Run the app on an Android phone
The app is a **development build** (Expo Go can't run the wallet adapter or the camera). One-time setup: Android Studio (SDK + platform tools, `ANDROID_HOME` set), JDK 17, and on the phone **Developer options → USB debugging** on.

```bash
pnpm install
adb devices                      # the phone must be listed as "device"
pnpm mobile:android              # prebuilds android/, builds and installs app.kept.mobile, starts Metro
```
After the first install you only need Metro: `pnpm mobile:start`, then open **KEPT** on the phone (same Wi-Fi, or `adb reverse tcp:8081 tcp:8081` over USB). Shake the phone (or `adb shell input keyevent 82`) for the dev menu.

### Signing in against your local API (hybrid mode, the default)
1. Start the backend (Setup above). In `apps/api/.env` put your phone wallet's address in `SGT_MOCK_ALLOWLIST` to get **A3 Seeker verified**; leave it out to see **A3·no**.
2. `cp apps/mobile/.env.example apps/mobile/.env` and set `EXPO_PUBLIC_STAKE_MINT` (the `STAKE_MINT` printed by the API's `v4-setup` script) so the balance chip shows SKR.
3. `adb reverse tcp:3000 tcp:3000` so `localhost:3000` on the phone reaches the API (and `adb reverse tcp:8081 tcp:8081` for Metro).
4. Open KEPT → **Get started** → pick any wallet row → approve the connect, then the sign-in message in your wallet.

**Dev menu:** long-press the orange **DEVNET** badge. Switch every slice between `http` and `mock`, pick a scenario (`notEligible`, `walletRejected`, `offline`, `noSkr`, …), use a mock wallet (no wallet app needed; pair it with mock auth), move the virtual clock, jump to any of the 116 screens, open the component **Gallery**, or sign out.

Deep link test: `adb shell am start -a android.intent.action.VIEW -d "kept://join/IRON-7K2Q"`.

### Testing the core loop
- **On the mock (one phone, fastest):** Dev menu → API mode `mock` + Mock wallet on. Pick a scenario (`activeGroup`, `deadlineClose`, `allDone`, `lowHp`, `broken`, `settledKept`, `settledMissed`, `proofFail`, `proofUnavailable`, `walletRejected`, `txFailed`, `noSol`, `noSkr`, `offline`). Use **End day** / **To deadline** to move time: a started mock Oath begins at the next midnight, other members prove on their own, and the Oath settles after its last day.
- **On Devnet (two phones or two wallets, `hybrid` mode):** both wallets need devnet SOL and SKR (`POST /api/faucet` gives 5,000 SKR once). Phone 1: + → Start an Oath → Group → Sign & stake → Invite (QR). Phone 2: + → Join with code → scan → Join & stake. Phone 1: Start. Both: take photo 1 and photo 2 (photo 2 is checked by the API). For a quick settle, run the API against a program built with `debug-tools` and set `EXPO_PUBLIC_DAY_SECONDS=120` on both phones; after the last day, open the Oath and tap **Settle now** (or wait for the scheduler), then claim.
- Solo Oaths in `hybrid` stay on the mock so they can carry a stake (D-30).

### Testing Rematch, review, Bounties, profiles, inbox and wallet (Phase 4)
These run on the mock in every mode until the backend adds them (`docs/BACKEND_GAPS.md`), so no API is needed. Dev menu → Mock wallet on, then pick a scenario:
- **Rematch:** `broken` → the result screen (or Oaths → Guitar Days) → **Rematch · win back 500** (R1) → Join → R3 lobby → Start. `rematchActive` shows a Rematch on day 3 (R·act); **End day** through its last day for R4 / L6.
- **Group review:** `activeGroup` → bell → **Review photo** (G1) → Approve or Reject. To ask for one yourself: an "AI + group review" Oath → photo 2 → `proofFail` three times → **Ask your group to review** (G2), and the other members vote after about 20 seconds.
- **Bounties:** Bounties tab → any Bounty → **Join free** → H3. `bountyOut` shows H4 (out), `bountyJoined` shows a finished one (H5 → claim). Bounties tab → **Created** → **Create a Bounty** (K1–K5) → Fund → K5·ok → H6 stats.
- **Profiles:** Profile tab (I1) → Edit (I8), avatar (I9), Settings (I4), visibility (I7), activity (I5); tap a member on D2 for I2.
- **Inbox:** the bell (N1). Every item opens its screen; Accept / Decline / Mark all read clear it.
- **Wallet:** the balance chip (W1) → Add SKR (W2) → Swap (W3, mock) or the real faucet in `hybrid`; Receive (W4) shows your real address as a QR. `noSol` shows M3 on a swap.

See `docs/ARCHITECTURE.md` and `docs/BUILD_PLAN.md`.
