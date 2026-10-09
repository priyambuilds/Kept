# Session handoff: KEPT mobile app (Phases 0–4)

Give this file to a new Claude Code session to pick up where the last one stopped. Read `CLAUDE.md` first: it holds the project rules and wins over anything here. Then read this file, then `docs/BUILD_PLAN.md`.

Last updated: 2026-10-09, after Phase 4.

---

## 1. Where things stand

| Phase | What | State |
|---|---|---|
| 0 | Restructure into a pnpm monorepo (`git mv`, history kept) | done, merged |
| 1 | `packages/*`, theme from tokens, `t()` copy helper, every component, dev Gallery | done, merged (PR #1) |
| 2 | Navigation shell, mock/http `KeptApi`, `TxService`, real wallet sign-in (A0–A4) | done, merged |
| 3 | Core loop: B, C, D, E, F, J, L screens, camera, real program and API | done, merged (PR #2) |
| 4 | R, G, H, K, I, N, W, M1 screens, mostly on mocks | **done, in PR #3 (open, not merged)** |
| 5 | Motion, haptics, parametric Keeper, accessibility, performance, Maestro | **next** |

- **Branch:** `main-3ay2tj`. Develop and push only there (`git push -u origin main-3ay2tj`). Base branch is `main`.
- **PR #3:** https://github.com/priyambuilds/Kept/pull/3 (Phase 4). The owner merges PRs; once it's merged, restart `main-3ay2tj` from the new `main` before Phase 5 work.
- **Every one of the 116 design screens is now built.** No placeholders remain (`screens/Placeholder.tsx` only shows for unknown ids).
- **Checks at the end of Phase 4:**
  - `pnpm typecheck` and `pnpm lint` pass.
  - Mobile Jest passes, 82 tests. Engine (15), shared (3) and chain (4) tests pass.
  - `npx expo export --platform android` builds.
  - `programs/kept` tests fail without an Anchor build (`target/idl` missing). That's expected: it's backend code and wasn't touched.
- **Not yet run on a physical phone:** nothing since Phase 1. The owner runs it.

## 2. Rules that matter most (summary of CLAUDE.md)
- **Frontend only.** Never edit `apps/api` or `programs/kept`. Read them freely. Every backend need goes into `docs/BACKEND_GAPS.md` with the exact request/response shape the app is coded against. The owner said: "just write into the md file for my backend guy to know what to add, remove or fix."
- **Design is the source of truth:** `design/` is read-only. Rule changes live in `docs/DECISIONS.md` › Rules amendments.
- **Strings:** never hardcode them. Every string goes through `t()` from `design/copy.json`. New strings go in `apps/mobile/src/copy/additions.json` and must be listed in DECISIONS.
- **Theme:** never hardcode colours, sizes, radii or durations. Use the theme generated from `design/tokens.json`.
- **Money and HP math** come from `packages/engine`, never from components. Amounts are `bigint` base units (SKR has 6 decimals), formatted only at the edge.
- **Never** commit secrets or deploy with the keypair in `target/deploy`.
- **Commit trailer** (no model names in commits or code):
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01RzTTchR5Ugk8uudVnJGQnW
  ```
  If your own session gives you a different attribution, use that instead.
- Don't open PRs unless asked.
- **End of each phase:**
  1. Run typecheck, lint, tests and the Android bundle.
  2. Update BACKEND_GAPS, DECISIONS, BUILD_PLAN and README.
  3. Commit and push.
  4. Tell the owner how to run it on a phone, with a real-vs-mocked table.

## 3. How the app is built (where to look)
Stack: Expo SDK 57, React Native 0.86, TypeScript strict, React Navigation 7, TanStack Query 5, Zustand 5 (persisted to AsyncStorage), Zod 4, Reanimated 4, expo-camera, Mobile Wallet Adapter 3.0, `@solana/web3.js` 1.99. Design notes are in `docs/ARCHITECTURE.md`.

**`apps/mobile/src/` layout**
- `app/`: navigation.
  - `RootNavigator.tsx` has the `BUILT` map from design id to component, plus the tab list.
  - `routes.ts` assigns each id a presentation: tab, sheet, moment, signing, modal or flow. `routes.gen.json` is generated from `flows.md` (`pnpm --filter @kept/mobile routes:gen`).
  - `nav.ts`: `useGo()` (go / replace / back / reset), `useParams`, `navigateTo`, `navigationRef`.
  - `useSigningFlow.ts`: signing screens replace themselves with their outcome.
- **Route names are ASCII:** "C7·no" becomes "C7_no", "R·act" becomes "R_act", "+" becomes "Plus". Code always uses design ids.
- `api/`: the `KeptApi` interface (`types.ts`) has slices `oaths, proof, bounties, rematch, reviews, auth, wallet, inbox, invites, notify, profile`.
  - Each slice has an `http/` and a `mock/` implementation.
  - `BACKEND_HAS` says which slices the default `hybrid` mode sends to http. The Dev menu can override any slice.
  - `api/mock/scenarios.ts` holds the scenarios; `api/mock/clock.ts` is the virtual clock.
  - `errors.ts` maps HTTP status plus route to `ApiErrorCode`.
- `chain/`: `TxService`. `realTx.ts` runs on MWA and the program IDL; `mock.ts` runs on the mock store. `getTx(source)` sends chain Oaths to the real one and everything else to the mock.
- `features/`: data and domain logic.
  - `oaths/model.ts`: `OathFacts` plus the engine give `oathView` (life, HP, cells, balances, results, claimable).
  - `oaths/mockStore.ts`: the seeded mock Oaths per scenario.
  - `bounties/mockStore.ts`, `reviews/mockStore.ts`.
  - `phase4.ts`: hooks and actions for Bounties, Rematch, reviews, profiles and wallet.
- `screens/<group>/*.tsx` hold the screens; they stay thin. `screens/shared/Signing.tsx` has `SigningScreen`, `failureOutcome` (errors to C7·no, C7·fail, M2, M3, M4), C7·no, C7·fail, M3 and M4.
- `components/` holds everything from `design/components.md`. `dev/Gallery.tsx` shows every state; `dev/DevMenu.tsx` is opened by long-pressing the DEVNET badge.
- `copy/`:
  - `index.ts`: `t(key, vars)`.
  - `templates.json`: data-bearing keys. **Each template's `sample` must reproduce copy.json exactly; a test enforces it.**
  - `additions.json`: new strings.
  - **Gotcha:** `t(key, vars)` on a key with no template returns the design's sample text and ignores `vars`. Every data-bearing key needs a template.
- `state/`: Zustand stores (`session`, `dev`, `ui`, `drafts`, `settings`).

**Packages**
- `packages/engine`: HP, miss cost, distribution, Rematch, kept rate, odds. Test vectors are in `test-vectors/oath-vectors.json`.
- `packages/shared`: Zod schemas for existing routes. Proposed routes live in `src/proposed.ts`.
- `packages/chain`: IDL, PDAs, decoder, instruction builders.
- `packages/config`: constants.

**Modelling choices (DECISIONS D-53)**
- A Rematch is an Oath with `rematchOf` and `recovery`.
- A Bounty entry is a stake-0 solo Oath with `bountyId`.
- This lets proof, the grid, D2 and claims be reused.
- Settled chain Oaths show the chain's payout (D-14).

**Mock scenarios**
- `fresh`, `activeGroup`, `deadlineClose`, `allDone`, `lowHp`
- `broken`, `rematchActive`, `settledKept`, `settledMissed`
- `bountyJoined`, `bountyOut`, `proofFail`, `proofUnavailable`
- `notEligible`, `offline`, `walletRejected`, `txFailed`, `noSol`, `noSkr`

Mock Oath ids are `mock-oath-N` in seed order. Some tests depend on that order, so add new seeded Oaths at the **end** of `seed()`.

## 4. Testing gotchas (Jest)
- Mocks are set up for Reanimated (Reduce Motion on), AsyncStorage, MWA and expo-camera. `@solana` `.mjs` files are transformed, and `rpc-websockets` is mapped to its browser build.
- Navigation tests set `gcTime: Infinity`, or Jest hangs on React Query's garbage-collection timers.
- The React Hooks lint rules are strict:
  - No `Date.now()` in render (use `useNow`).
  - No writing refs during render.
  - No conditional hooks.
  - No side effects in `useMemo`.
- `src/__tests__/navigation.test.tsx` has a `Phase 4 on mocks` block whose `signedIn(scenario)` helper seeds the scenario and marks every result moment as already seen. Reuse it for new flow tests.

## 5. What Phase 4 added (PR #3)
- **Screens:**
  - Rematch: R1–R4·lost, L6.
  - Group review: G1–G3·no.
  - Bounties: H1·j, H1·c, H2–H7, L5.
  - Create a Bounty: K1–K5·ok.
  - Profiles and settings: I1–I9.
  - Inbox: N1. Notifications: M1.
  - Wallet: W1–W4, W3·s, W3·ok. W2 is a sheet.
- **Real in hybrid mode:** balances (RPC), faucet, price. Everything else above runs on the mock.
- **API errors** `INSUFFICIENT_SOL` and `INSUFFICIENT_SKR` now open M3 / M4 during signing.
- **Inbox data:** the mock inbox resolves each item's `ref` against the mock store. `InboxItem.ref.oath` is now any string, and `ref.code` was added.
- **Copy:** 131 new templates. The scan and verify scripts lived in the old session's scratchpad and are gone. To check a template, interpolate its `sample` into `template` and compare with copy.json; the copy drift test does the same.
- **Decisions D-53 to D-63.** The owner still has to review:
  - **D-55:** the design's broken example can't reach 0 HP with four members. Only the demo data was changed.
  - **D-58:** "his" became "their" in I2·p.
  - **D-60:** the new strings.
- **BACKEND_GAPS:** every P1 item has an "App today (Phase 4)" note with route shapes. The checklist at the top is the backend developer's to-do list.

## 6. Next: Phase 5 (from `docs/BUILD_PLAN.md`)
- **Signature animations** from `design/motion.md` (HP damage and heal, money count-up, day kept, broken, payout, Rematch), with expo-haptics and Reduce Motion fallbacks.
- **The parametric Keeper** in `react-native-svg`, ported from `design/reference/Keeper.dc.html`, with the PNGs as fallback (D-33). Keeper lines that react to data (D-49).
- **Accessibility pass:** labels, 48 dp touch targets.
- **Performance:** list virtualisation and a startup-time pass.
- **Maestro smoke flows** in `.maestro/` (onboarding, create, join, proof, claim) on mock scenarios. Maestro must be installed on the owner's machine.
- **Phone milestone:** the full app with motion; `maestro test .maestro/` passes on a connected phone.

## 7. Open items and known limits
- No PR #3 review feedback yet. Check it first if it's still open.
- **Number words** in copy ("Seven days kept") show as digits (D-57).
- **K4 "token held"** is collected but not checked; new Bounties are sent with no token requirement (D-27).
- **Stored on the device only:** settings, visibility and follows (D-61).
- **Waiting on the backend:** the G1 photo, the K3 cover upload and the swap (BACKEND_GAPS P1-1, P1-10, P1-12).
- **Real-program flows** (create, join, start, proof, settle, claim on Devnet) are wired up but haven't been tried on phones.

## 8. Commands
```bash
pnpm install
pnpm typecheck && pnpm lint
pnpm --filter "./packages/*" --filter @kept/mobile test   # skip programs/kept (needs an Anchor build)
cd apps/mobile && npx expo export --platform android --output-dir /tmp/kept-export   # bundle check
pnpm mobile:android                                      # build and install on a USB phone
```
Phone setup and per-feature test steps are in `README.md`.
