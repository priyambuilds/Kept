# KEPT: Architecture

**Status:** proposal, waiting for approval. Nothing has been moved yet.
**Inputs:** `CLAUDE.md`, `design/*`, `backend/*` (as of 2026-10-09).
**Companion docs:** `BACKEND_GAPS.md` (what the backend must change), `DECISIONS.md` (assumptions to confirm), `BUILD_PLAN.md` (phases and phone milestones).

---

## 1. Monorepo structure

```
/                         pnpm workspace root (package.json, pnpm-workspace.yaml, .npmrc, .gitignore)
├─ apps/
│  ├─ mobile/             NEW Expo app (TypeScript strict, Android only), built from design/
│  └─ api/                Express + Prisma backend   ← backend/{src,prisma,test,scripts,package.json,tsconfig.json,.env.example,assetlinks.json,temp_public}
├─ programs/
│  └─ kept/               Anchor workspace           ← backend/kept-example/program (Anchor.toml, Cargo.*, programs/kept_test, tests/)
├─ packages/
│  ├─ config/             constants (objects, gestures, stakes, lengths, limits) + tsconfig / eslint presets
│  ├─ engine/             pure TS rules: HP, miss cost, daily distribution, Rematch recovery, kept rate, odds
│  │  └─ test-vectors/    JSON vectors (worked example + edge cases), also read by Rust tests later
│  ├─ shared/             zod schemas + API contract types (requests, responses, error codes)
│  └─ chain/              NEW: program client: IDL, PDAs, account decoder, instruction builders, error map
├─ design/                unchanged, read-only
├─ docs/                  ARCHITECTURE, BACKEND_GAPS, DECISIONS, BUILD_PLAN, API (added in Phase 0)
└─ legacy/                kept for reference, not built, not in the workspace
   ├─ harness-app/        ← backend/kept-example/app
   ├─ v3-app/             ← backend/kept-example/legacy-app
   ├─ v3-aura/            ← backend/legacy
   ├─ v3-program-tests.ts ← backend/kept-example/legacy-program-tests-v3.ts
   └─ docs/               ← backend/BACKEND_PART_1.md, backend/kept_backend.md, backend/README.md, backend/kept-example/README.md
```

### Changes from the structure in CLAUDE.md, and why

| Change | Why |
|---|---|
| **Added `packages/chain`** | The Oath account is decoded by hand with byte offsets in two places today (`backend/src/routes/v4.ts:362-376` and `backend/kept-example/app/src/chain/oaths.ts:20-27`), and the instruction discriminators are hashed by hand in the API (`v4.ts:326`, `v4.ts:379`). One package that owns the IDL, PDAs, decoder and instruction builders gives the mobile `TxService` and the app's on-chain reads one source. The backend can adopt it later if the backend developer wants to (`apps/api` is read-only for us). |
| **Program crate keeps the name `kept_test`** (folder is `programs/kept`) | Renaming the crate changes the IDL file name, `metadata.name` and the generated `KeptTest` type. The program ID (`6iXX…MUh`) and the discriminators don't depend on the crate name, but there's no benefit to the churn, and CLAUDE.md says not to change the program. A rename can go to the backend developer as a P2 item. |
| **Anchor workspace root is `programs/kept`, not `programs/`** | `Anchor.toml`, `Cargo.toml`, `Cargo.lock` and `tests/` move as one unit, so `anchor build` / `cargo test` keep working unchanged from that folder. |
| **IDL lives in `packages/chain/idl/`** | Today it's copied into the app (`kept-example/app/scripts/sync-idl.js`). One copy, synced from `programs/kept/target/` by a script in `packages/chain`. |
| **The harness app goes to `legacy/harness-app`**, not deleted | CLAUDE.md marks it reference-only. Its useful parts (MWA session + `signAndSend`, Hermes `Buffer` polyfill, PDA helpers) are **ported** into `packages/chain` and `apps/mobile`, not imported. Note that `chain/idl.ts` and `chain/errors.ts` there are stale V3 code (see BACKEND_GAPS P2-6). |
| **V3 docs go to `legacy/docs/`** | `BACKEND_PART_1.md` calls itself the source of truth, but it describes V3 (Soul, XP, Aura, `buy_soul`), which the V4 code no longer contains. Keeping it at the top level would mislead the next reader. |
| **`docs/BUILD_PLAN.md`** added | The phase plan you asked for. `docs/API.md` is created in Phase 0 from the existing routes. |
| **No Turborepo** | Five TS packages and two apps. `pnpm -r` plus `tsc -b` project references cover build order and caching well enough. I'll add Turbo only if CI time becomes a problem. |

Dead V3 Rust files inside `programs/kept_test/src/` (`constants.rs`, `day.rs`, `errors.rs`, `events.rs`, `instructions/`) are **not compiled** (`lib.rs:4` declares only `mod state`). I'll move them unchanged with the program and flag them for the backend developer; I won't delete them myself.

---

## 2. Package manager and workspace setup

- **pnpm workspaces** (pnpm 12.6 is installed here). `pnpm-workspace.yaml` lists `apps/*`, `packages/*`, `programs/kept` (for its TS LiteSVM tests only). `legacy/` is excluded.
- **`nodeLinker: hoisted`** (in `pnpm-workspace.yaml`; pnpm 12 ignores `.npmrc` for this). React Native autolinking, Gradle and Metro are most reliable with a flat `node_modules`, and the Anchor TS tests expect it too. If Expo still has trouble, the fallback is npm workspaces (per CLAUDE.md); the layout stays the same.
- **Build scripts:** Prisma, esbuild and the native modules need install scripts. They're allowlisted in `pnpm-workspace.yaml`, replacing the npm-11 `allowScripts` block in `backend/package.json`.
- **Node:** `engines.node >= 20` (the backend's current constraint). Local Node is 26.7.
- **Internal package format:** packages are TypeScript source. Each one has `exports` with a `react-native` condition pointing at `src/index.ts` (Metro compiles it directly) and a `default` condition pointing at `dist/` built by `tsc -b` (for any Node consumer; `apps/api` doesn't use these packages today and is the backend developer's code).
- **Root scripts:** `pnpm typecheck`, `pnpm lint`, `pnpm test` (all packages), `pnpm api:dev`, `pnpm mobile:android`, `pnpm idl:sync`, `pnpm theme:gen`.
- **Rust is outside pnpm.** `programs/kept` keeps its Cargo workspace. `cargo`, `anchor` and `solana` are **not installed on this machine**, so I can't build or run the program's tests here. See DECISIONS D-24.
- **Secrets:** a root `.gitignore` covers `.env*` (except `.env.example`), keypairs, `target/`, `android/`, `.DS_Store`, `node_modules/` and `dist/`. I checked: there are no `.env` or keypair files in the tree today.

---

## 3. How the pieces depend on each other

```
                 ┌──────────────┐
                 │ packages/    │  objects, gestures, stakes, lengths,
                 │ config       │  limits, tsconfig + eslint presets
                 └──────┬───────┘
          ┌─────────────┼──────────────────┐
          ▼             ▼                  ▼
   ┌────────────┐ ┌────────────┐    ┌────────────┐
   │ engine     │ │ shared     │    │ chain      │  IDL, PDAs, decoder,
   │ pure rules │ │ zod + API  │    │            │  ix builders, errors
   │ (bigint)   │ │ contract   │    └─────┬──────┘
   └─────┬──────┘ └─────┬──────┘          │
         │   test-vectors/*.json          │
         │──────────────────────────────► programs/kept (Rust tests, later)
         ▼              ▼                 ▼
   ┌──────────────────────────────────────────────┐
   │ apps/mobile   uses engine + shared + chain   │──HTTP──► apps/api (read-only for us)
   │                                              │◄─RPC───► Solana Devnet ◄── programs/kept (deployed)
   └──────────────────────────────────────────────┘
```

Rules:
- **Apps depend on packages; packages never import apps.**
- **`engine` has no runtime dependencies** (only `config`): no zod, no I/O, no clock. All amounts are `bigint` base units (SKR has 6 decimals, per `scripts/v4-setup.ts:31`).
- **`shared` doesn't depend on `engine`.** Schemas describe what crosses the wire, and amounts travel as decimal strings of base units.
- **`chain` depends on `config`** (object index ⇄ `object_id` on chain, which must match `OBJECT_IDS` at `v4.ts:22`) and `@solana/web3.js` + `@anchor-lang/core`.
- **Mobile signs transactions itself** (MWA) and calls the API for everything off-chain. The API only signs as the verifier (check-ins, settlement) and the faucet.

---

## 4. Mobile stack

Versions checked on the npm registry on 2026-10-09. Expo `latest` is **SDK 57 (57.0.27)**, the same SDK the harness already uses. Exact versions are pinned by `npx expo install` at scaffold time.

| Concern | Choice | Reason |
|---|---|---|
| Runtime | **Expo SDK 57**, RN 0.86, React 19.2, New Architecture, **dev build** (`expo-dev-client`) | Latest stable; the harness proved MWA + camera work on it; Expo Go can't load MWA. |
| Language | **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | Money and screen-ID maps need the strictest checks. |
| Navigation | **React Navigation 7** (native stack + bottom tabs with a custom `tabBar`) | See §5. |
| Server state | **TanStack Query 5** | Caching, retries, `onlineManager` for M2, invalidation after a tx confirms. |
| Client state | **Zustand 5**: stores `session`, `balances`, `drafts`, `ui` | Small, no providers, persists drafts easily. |
| Validation | **Zod 4** on every API response (mock included) | Keeps mock fixtures honest and catches backend drift at the edge. |
| Animation | **Reanimated 4** (+ `react-native-worklets`), **Gesture Handler** | motion.md is written for Reanimated 3; v4 keeps the same `withTiming/withSpring/withSequence` API and is what SDK 57 ships. |
| Drawing | **react-native-svg**, **expo-linear-gradient** | Keeper rig, Check-K, HP segments, rings; gradients for tiles, buttons and cards. |
| Haptics | **expo-haptics** | Mapped 1:1 to motion.md's haptic calls. |
| Fonts | **@expo-google-fonts/geist**, **@expo-google-fonts/geist-mono** | Named in DESIGN.md §3. |
| Icons | **@expo/vector-icons** `MaterialCommunityIcons` | Icon names match the prototype's `mdi-*` exactly. |
| Camera | **expo-camera** (chosen over react-native-vision-camera) | We only need live preview + `takePictureAsync` + a QR scanner (E1); there's no gallery path by construction. The checking is server-side, so vision-camera's frame processors (and its Nitro modules dependency) buy nothing. |
| QR | **react-native-qrcode-svg** | QRCard; already proven in the harness. |
| Wallet | **@solana-mobile/mobile-wallet-adapter-protocol-web3js 3.0** (peer `@solana/web3.js ^1.99`) | Latest MWA. The harness uses 2.3; if 3.0 regresses on the Seeker wallet, pin 2.3. Verified in Phase 2. |
| Chain | **@solana/web3.js 1.99**, **@anchor-lang/core 1.2**, **@solana/spl-token 0.4** | Anchor's TS client still requires web3.js v1; same stack as the working harness. |
| Polyfills | `react-native-get-random-values`, `buffer` + the Hermes `Uint8Array` fix from `harness/src/polyfills.ts` | That fix was a real bug (BACKEND_PART_1 §15). |
| Secure storage | **expo-secure-store** for the API session token and the MWA `auth_token` | The harness keeps both in AsyncStorage. They're credentials, so they move to the Android keystore. |
| Plain storage | **@react-native-async-storage/async-storage** | Drafts, "results shown once" flags, dev scenario choice. |
| Network status | **@react-native-community/netinfo** → TanStack `onlineManager` | Drives the global M2 state. |
| Notifications | **expo-notifications** (FCM) | The backend already sends FCM v1. |
| Links / clipboard | **expo-linking**, **expo-clipboard** | `kept://join/<code>`, copy invite. |
| Unit / component tests | **jest-expo**, **@testing-library/react-native 14** | Standard for Expo. |
| E2E | **Maestro** | Flows on a real device, YAML, no app changes. |
| Lint | ESLint flat config + typescript-eslint, plus a custom rule banning color/number literals in `style` and raw strings in `<Text>` | Enforces the "tokens and copy keys only" rule mechanically. |

**Not adding:** Skia, Lottie/Rive (none supplied), NativeWind, axios, i18n frameworks, date libraries (`Intl` is enough), react-native-shadow-2 (elevation + inset Views per DESIGN §6).

### Theme and copy
- **`pnpm theme:gen`** reads `design/tokens.json` and writes `apps/mobile/src/theme/tokens.gen.ts` (typed, `as const`, checked in). A test fails if the generated file is out of date. Components only read `theme.*`.
- **Copy:** `t(key, vars?)` is typed against `design/copy.json`, so an unknown key is a compile error. copy.json strings contain **sample values**, not placeholders (its own `$meta.note` says so). So `apps/mobile/src/copy/templates.json` maps the keys that need data to a templated form (e.g. `screens.D2.b1.text` → `"{timeLeft} left today · first miss −{cost} SKR"`). A unit test renders every template with the sample values and asserts the output equals copy.json **exactly**, so a template can never drift from the design copy. See DECISIONS D-17.

### App layout (`apps/mobile/src`)
```
app/          navigation (RootStack, Tabs, linking, route ids ⇄ design ids)
screens/      one file per design screen id, thin: compose components + call feature hooks
components/   everything in components.md, plus Gallery (dev-only)
features/     hooks per area (useToday, useOath, useCreateOath, useProof, useClaim, …)
api/          KeptApi interface, http/, mock/ (fixtures, scenarios), flags
chain/        TxService interface, mwa/ (real), mock/
state/        zustand stores
theme/        tokens.gen.ts, typography, elevation helpers
copy/         t(), templates.json
lib/          money formatting, time, errors
```

---

## 5. Navigation choice: React Navigation 7

Picked over expo-router because:
1. **flows.md is already written as a React Navigation tree** (RootStack, Tabs with a custom TabBar, modal sheets, full-screen flows, fade "moments"). The implementation maps to it one to one.
2. **116 screen IDs as typed route names** (`RootStackParamList`, IDs made ASCII: `C7·no` → `C7_no`) plus a lookup table back to design IDs for the Gallery and the dev "jump to screen" menu. With expo-router that would be 116 files named after IDs, and the modal, transient and moment patterns would fight the file tree. We don't target web, so file routes give us nothing.
3. **Transient signing screens:** a `useSigningFlow()` hook calls `navigation.replace(resultRoute)` when the wallet result arrives. There's never a back stack entry pointing at a pending state (A2·s, C7, D1·go, D1·xs, E2·s, R2, J1·p, K5·p, W3·s).
4. **Deep links:** a `linking` config maps `kept://join/:code`. Signed out: store `session.inviteFlag = code` and continue onboarding, then the `cont:` rule sends the user to E1 with the code filled in. Signed in: E1, then resolve the code, then E2. Android App Links (`https://…/join/:code`) can be added later using the existing `assetlinks` route.

Shape:
- **Root native stack** (`headerShown:false`) holds Splash, the Onboarding group, `Tabs`, and every flow screen (`slide_from_right`).
- **Moments group** (L1–L6, C7·ok, J1·ok, K5·ok, F5): `animation:'fade'`, `gestureEnabled:false`, and hardware back is blocked until the screen calls `settle()`. "Shown once per settlement" is tracked in AsyncStorage per `oathId:outcome`.
- **Sheets group** (+, B5, D1·x, M3, M4): `presentation:'transparentModal'` rendering our own `BottomSheet` (scrim, grabber, swipe down via Gesture Handler).
- **Global hosts** mounted once above the navigator: ToastHost, KeeperNoteHost, FXLayer, OfflineHost (M2), DevnetBadge.

---

## 6. API layer: mock or http, per feature

```ts
interface KeptApi {
  auth: AuthApi;        // nonce, verify, me
  today: TodayApi;      // today items, recap
  oaths: OathsApi;      // list, view (grid/HP/balances), details, watch, nudge
  invites: InvitesApi;  // create, resolve
  proof: ProofApi;      // challenge, submit (two-photo)
  reviews: ReviewsApi;  // request, list, vote
  rematch: RematchApi;
  bounties: BountiesApi;
  profiles: ProfilesApi;
  inbox: InboxApi;
  wallet: WalletApi;    // balances, faucet, swap quote, price
}
```

- **Two implementations per slice:** `http/` (fetch + bearer token, the backend's error mapped to a typed `ApiError`) and `mock/` (in-memory store seeded from `copy.json › sampleData` fixtures, with simulated latency).
- **Both validate** with the zod schemas in `packages/shared` before data reaches a hook.
- **Per-feature flags** (`api/flags.ts`): `Record<Slice, 'http' | 'mock'>`. Defaults come from `EXPO_PUBLIC_API_MODE` (`mock` | `hybrid` | `http`). `hybrid` is the default for real-device testing: http where the backend supports the feature, mock elsewhere (the table in BUILD_PLAN). `createApi(flags)` composes the slices. In dev builds, a **Dev menu** (long-press the DEVNET badge) can override any slice and persists the choice.
- **Mock scenarios** (dev menu): `fresh` (B3), `activeGroup` (B1/D2), `deadlineClose` (B4), `allDone` (B2), `lowHp` (D2·low), `broken` (D3/L3/R1), `settledKept` / `settledMissed` (L1/L2/J1), `rematchActive`, `bountyJoined`, `bountyOut`, `notEligible` (A3·no), `offline` (M2), `walletRejected` (C7·no), `txFailed` (C7·fail), `noSol` (M3), `noSkr` (M4). The mock keeps a **virtual clock** with "end day" / "advance to deadline" controls, and computes HP, balances and settlement with `packages/engine`, so mock and real numbers use the same rules.
- **Hybrid rule for money:** where a screen mixes chain truth with engine estimates (for example a real Oath whose program still settles all-or-nothing), the claim screen (J1) shows the **on-chain payout**, and live balances are labelled as estimates. See DECISIONS D-14.

## 7. Chain layer: `TxService`

```ts
interface TxService {
  createOath(i: CreateOathInput): Promise<TxResult<{ oath: string }>>;
  joinOath(oath: string): Promise<TxResult>;
  startOath(oath: string): Promise<TxResult>;
  cancelOath(oath: string): Promise<TxResult>;
  claim(oath: string): Promise<TxResult<{ amount: bigint }>>;
  settle(oath: string): Promise<TxResult>;       // permissionless on chain; fallback if the scheduler is late
  fundBounty(i: FundBountyInput): Promise<TxResult>;   // mock only: no program support
  joinRematch(i: JoinRematchInput): Promise<TxResult>; // mock only: no program support
}
type TxError = 'rejected' | 'failed' | 'insufficientSol' | 'insufficientSkr' | 'offline';
```
- **Real implementation:** `packages/chain` builders plus the ported MWA session (silent re-authorize with a stored `auth_token`, simulate before sign, `minContextSlot`, wait for foreground). Errors are classified into `TxError`, which maps to C7·no / C7·fail / M3 / M4 / M2.
- **Mock implementation:** scripted results per scenario, with the same delays as the SignStatus timing.
- After a confirmed create, the app calls `POST /api/oaths/details`, then `POST /api/invites` (group), then `POST /api/oaths/watch`, as the harness does. Watch registration is what makes the backend scheduler settle the Oath at all (BACKEND_GAPS P0-9).

## 8. Money and time
- Amounts are `bigint` base units end to end, strings on the wire, formatted only in `lib/money.ts` (`1,043 SKR`, `≈ $10.43`) using the price from `GET /api/price`.
- Day boundaries in the UI always come from the server (`dayEndsAt`, `secondsToReset`), never from the device clock. See DECISIONS D-6.
