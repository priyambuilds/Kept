# CLAUDE.md: KEPT (monorepo)

Read this first in every session.

## What KEPT is
KEPT is an Android app for the Solana Seeker. People swear **Oaths** (daily habits, solo or group), stake SKR, and prove each day with two photos checked by AI on the server.
- **HP bar:** each Oath has one. Misses cost part of your stake, which goes to the members who kept, and at 0 HP the Oath breaks.
- **Rematch:** wins back 50% of a broken Oath.
- **Bounties:** free public challenges funded by a creator.
- **Kept rate:** a public trust score.
- **The Keeper:** a half-warden, half-bookie mascot that comments at key moments.

## What's in this folder today
| Path | What it is | Status |
|---|---|---|
| `design/` | The final handoff from Claude Design: `README.md`, `DESIGN.md`, `tokens.json`, `components.md`, `screens.md` (116 screens, A0–W4), `flows.md`, `copy.json`, `motion.md`, `rules.md`, `assets/`, `reference/` (HTML prototype) | **Source of truth for UI and product rules.** Read-only. |
| `backend/` | The existing V4 prototype: Express + Prisma + Postgres API (`src/`), Anchor program (`kept-example/program`), a test-harness Expo app (`kept-example/app`), and V3/Aura `legacy/` | Working Devnet prototype, but **behind the design** in many places (see `docs/BACKEND_GAPS.md`) |

## Precedence rules
1. **Product behavior and UI:** `design/rules.md` and `design/screens.md` win. If the backend or program does something different, build the frontend to the design and **record the difference in `docs/BACKEND_GAPS.md`**. Never silently change the design to match the backend.
2. **Engineering details** (how wallets sign, PDAs, token program, auth, Genesis checks, deploy): the existing backend is the reference. Reuse what works.
3. **Open decisions** listed at the end of `design/rules.md`: use the prototype's assumption, and list it in `docs/DECISIONS.md` so a human can confirm it.
4. When the design and rules contradict each other, or something is truly ambiguous, **ask**. Don't guess on money logic.

## Your goals
1. **Restructure the repo** into a clean monorepo (structure below). Propose it before moving anything.
2. **Build the new mobile app** from `design/`, from scratch. The test-harness app is reference only, for wallet, chain and IDL helpers.
3. **Merge with the backend.** Wire the app to the real API and program where the backend already supports a feature; use a typed mock where it doesn't.
4. **Keep `docs/BACKEND_GAPS.md` current.** It's the handoff for the backend developer: every place the backend or program must change to match the design.

## Target structure (proposed; refine it and justify any changes)
```
/apps
  /mobile            new Expo app (TypeScript strict), built from design/
  /api               the Express + Prisma backend, moved from backend/src (+ prisma/, test/, scripts/)
/programs
  /kept              the Anchor program, moved from backend/kept-example/program
/packages
  /shared            zod schemas + API contract types, shared by mobile and api
  /engine            pure TS: HP, cost per miss, daily distribution, Rematch recovery, kept rate, odds; plus test vectors (JSON) also used by the Rust tests
  /config            shared constants (objects, gestures, stakes, lengths) + tsconfig/eslint presets
/design              unchanged
/docs                ARCHITECTURE.md, BACKEND_GAPS.md, DECISIONS.md, API.md
/legacy              old harness app, V3/Aura code (kept for reference, not built)
```
- Use **pnpm workspaces** (or npm workspaces if pnpm causes problems with Expo or Anchor), and Turborepo only if it clearly helps.
- Use `git mv`, not delete-and-recreate, so history is kept. The repo has no commits yet, so **make an initial commit of the current state before restructuring.**
- Never commit secrets. Keep `.env.example` files only.

## Mobile stack
- **Expo** (latest stable SDK), React Native, TypeScript strict, Android only. Use a **development build** (Expo Go can't run the wallet adapter or the camera).
- **Navigation:** follow `design/flows.md`. expo-router or React Navigation are both fine; pick one and say why. It must support deep links (`kept://join/<code>`) and transient signing screens that replace themselves in the stack.
- **Data:** TanStack Query for server state, Zustand for client state (`session`, `balances`, `drafts`, `ui`), Zod for every API response.
- **Look and motion:** react-native-svg, Reanimated, Gesture Handler, expo-haptics, expo-linear-gradient, Geist and Geist Mono fonts, MaterialCommunityIcons. The Keeper is a parametric `react-native-svg` component (PNGs as a fallback), per `design/assets.md`.
- **Device:** a camera library for live capture only, no gallery (evaluate expo-camera vs react-native-vision-camera); the Solana Mobile Wallet Adapter; expo-notifications.
- **Tests:** Jest + React Native Testing Library; Maestro for end-to-end flows.
- Check current docs before adding any dependency, and keep the list short.

## Mobile code rules
- **Theme:** generated from `design/tokens.json`. Never hardcode colors, sizes, radii or durations.
- **Text:** all strings from `design/copy.json` via a typed `t()` helper. No hardcoded strings.
- **Components:** build them first, from `design/components.md`, with a dev-only **Gallery** screen showing every state.
- **Screens are thin:** they compose components and call feature hooks. No money or HP math in components; it comes from `packages/engine`.
- **API layer:** one interface (`KeptApi`) with two implementations, `http` (the real backend) and `mock` (fixtures plus a dev scenario switcher). Pick one per feature with a flag, so features the backend lacks still work end to end in the app.
- **Chain layer:** a `TxService` interface for create, join, start, cancel, claim, fund a Bounty and join a Rematch, built on the existing program IDL, also mockable.
- **States:** every screen handles loading (skeletons per `screens.md`), empty, error (M2/M3/M4, C7·no, C7·fail) and success.
- **Money:** integers in base units, formatted only at the edge, with ≈ $ from the price API.
- **Accessibility:** labels, 48dp touch targets, Reduce Motion fallbacks.
- **Build order:** components → navigation → screens in groups A, B, F, C, D, E, J, L, R, G, H, I, K, N, W, M. Compare each screen with `design/reference/` before moving on.

## Engine rules (implement exactly as `design/rules.md`)
- **HP:** starts at 100. At the end of each day: −20 per missed member (−35 solo), then +10, capped at 100. At 0 the Oath breaks.
- **Cost of a miss:** `stake / days × 1.5^k` for the member's k-th miss, capped at their remaining balance.
- **Distribution:** each day, 10% fee from the money lost; 90% to that day's keepers, weighted by days kept so far.
- **Rematch:** 50% of each loss is held; it's recovered by members who keep every day of a Rematch that doesn't break.
- **Kept rate and odds:** per `rules.md` §7–8.
- **Required test:** 4 × 1,000 SKR over 3 days with the pattern in rules.md → 1,468.75 / 779.17 / 1,468.75 / 166.67, fee 116.67. Export the test vectors as JSON so the Rust program can be tested against the same numbers later.

## Backend work in this repo
- Move the backend into `apps/api` with its tests passing. Don't change its behavior unless a task says so.
- You may add **read-only aggregation routes** the app needs (e.g. `GET /api/me/oaths`, an Oath view with grid, HP and balances computed by `packages/engine`). Put them behind clear names and list them in `docs/API.md`.
- **Don't change the Anchor program or money-moving logic.** Write the needed change into `docs/BACKEND_GAPS.md` for the backend developer.

## Definition of done (per screen)
- matches the design
- uses tokens and copy keys only
- handles every state in `screens.md`
- navigates as in `flows.md`
- has component tests
- runs on a physical Android device, on the mock or the real backend
- `docs/BACKEND_GAPS.md` is updated if the backend doesn't support the screen yet
