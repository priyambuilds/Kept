# KEPT: Decisions and assumptions

Every open decision from `design/rules.md`, plus everything else I found ambiguous, with the assumption I'll build with.
**Status:** `DECIDED` = answered by the product owner (2026-10-09) · `ACCEPTED` = my assumption, accepted by the product owner on 2026-10-09 · `ASSUMED` = made during a build phase, not yet reviewed · `ASK` = still open. Where the build differs from the design, it's also in `BACKEND_GAPS.md`.

All six questions were answered on 2026-10-09 (D-6, D-9, D-10, D-14, D-16, D-24), and every other assumption was accepted. Phase 2 added D-35 to D-42 (section E) for review.

## Rules amendments (owner-approved, 2026-10-09)
`design/` is read-only in this repo (CLAUDE.md), so these amendments to `design/rules.md` live here. They override rules.md where they conflict, and `packages/engine` implements them.
1. **Day boundary (rules.md §1 "Day", open decision 6):** days run midnight to midnight in the **creator's time zone, fixed at creation**. Starting an Oath doesn't start day 1 straight away: **day 1 begins at the first midnight after Start.** Between Start and that midnight the Oath is started but waiting, and no proof is accepted.
2. **Breaking day (rules.md §2–3):** on the day HP reaches 0 there's **no heal, no keeper payout and no fee**. The whole remaining pot (every balance, including that day's miss costs) splits in two: **50 % is held for the Rematch**, and **50 % goes to the KEPT treasury**. Held money that isn't recovered is also released to the treasury. Copy can still say the pot is "lost" or "burned".
3. **Rematch recovery (rules.md §4):** each member who keeps every day of a Rematch that doesn't break gets back **50 % of their own balance at the moment of the break** (exactly the amount held for them).
4. **Claim and results numbers:** J1, L1–L6 and D4 show **what the chain will actually pay**. Engine numbers appear only on the live Oath views (B1, D2, B5), labelled as estimates.
5. **Oath names:** generated from object + length (e.g. "Iron Week"). The creator can **rename** while the Oath is Open.

## Copy additions (owner-approved)
These strings aren't in `design/copy.json`. They go in `apps/mobile/src/copy/additions.json`, which `t()` reads alongside copy.json. Each one is listed here and nowhere else:
- `"Starts tonight at midnight"`: D1 / D2 / B1 state between Start and day 1 (amendment 1).
- `"Win back half of what you had left."`: R1 Rematch offer (amendment 3).
- `additions.placeholder.*`: dev-only note on screens not built yet (D-36). Removed once every screen exists.
- Rename: creator action on D1 (sheet title, field label, save button), plus the generated-name word table (D-16). Exact wording to be proposed in Phase 3 for your review.

---

## A. Open decisions listed in rules.md

| # | Question | Build with | Status |
|---|---|---|---|
| D-1 | Solo miss damage, and where a solo member's lost SKR goes (there are no keepers) | **−35 HP per solo miss.** Lost SKR goes to the **KEPT treasury** (D-2), with no separate fee (there's no distribution). The engine reports it per day as `toTreasury`. | ACCEPTED |
| D-2 | Broken-pot destination | **Decided via D-10:** 50 % of the remaining pot is held for the Rematch, 50 % goes to the **KEPT treasury**, and unrecovered held money is also released to the treasury. The copy keeps saying "lost" / "burned". | DECIDED |
| D-3 | A miss that costs more than the remaining balance | **Capped at the remaining balance.** The member's balance floors at 0, and they can keep proving. | ACCEPTED |
| D-4 | Rounding | Integer math in base units (SKR = **6 decimals**, `scripts/v4-setup.ts:31`), `bigint` everywhere. Miss cost `floor(stake·3^k / (days·2^k))`. Fee `floor(lost·10%)`. Each keeper's share `floor(pool·w_i/Σw)`. **All dust goes to the fee.** Checked by hand on the worked example: A 1,468,750,000 · B 779,166,667 · C 1,468,750,000 · D 166,666,667 · fee 116,666,666 → sum exactly 4,000,000,000; displayed at 2 dp it matches rules.md. | ACCEPTED |
| D-5 | Heal on a day someone missed | **+10 every day after damage**, capped at 100 (but see D-10: no heal if the damage reached 0). | ACCEPTED |
| D-6 | **Day boundary.** rules.md says local midnight; the program uses 24 h windows from the moment of Start (`lib.rs:137-140`) and ignores the stored time zone. | **Decided:** midnight to midnight in the creator's time zone (fixed at creation); **day 1 starts at the first midnight after Start** (new copy "Starts tonight at midnight"). The app shows `dayEndsAt` / `secondsToReset` from the API and never computes days on the device. The program change is BACKEND_GAPS P0-4. | DECIDED |
| D-7 | Deadline reminder threshold | **2 hours** (B4, push). Already what the backend does (`v4.ts:286`). | ACCEPTED |
| D-8 | Daily recap | Shown **once after the day ends**, the first time the app opens that day (stored per device). | ACCEPTED |

## B. Money and rules, not covered by rules.md

| # | Question | Build with | Status |
|---|---|---|---|
| D-9 | **Rematch recovery formula.** "50 % of what they lost in the original" vs. funding "half of each member's lost money is held". When an Oath breaks, everyone's final balance is 0, so "what they lost" is ambiguous, and the literal reading (50 % of the stake) can need more than was held. | **Decided:** recovery_i = held_i = 50 % of member i's balance at the moment of the break. Solvent by construction. R1 copy: "Win back half of what you had left." | DECIDED |
| D-10 | **The breaking day.** If damage takes HP to 0, is there a heal, a distribution or a fee that day? | **Decided.** Order per day: misses → miss costs → damage → **if HP ≤ 0: break**: no heal, no keeper payout, no fee. The remaining pot (every balance, including that day's miss costs) splits 50 % held for the Rematch (per member, D-9) and 50 % to the KEPT treasury. Otherwise: fee → distribution → heal. | DECIDED |
| D-11 | Max members | **4**, matching the program (`state.rs:3`) and D1's four seats. | ACCEPTED |
| D-12 | Kept rate formula (rules.md §7 gives only the properties) | Over every day outcome (Oaths + Bounties) with weight `0.97^ageInDays`; each clean finish adds 2 kept pseudo-days; prior of 5 pseudo-days at 80 %. `rate = (Σw·kept + 4) / (Σw + 5)`. Shows **"New"** under 10 real days, else `"92% · 64 days"` (64 = real days counted). Display only. | ACCEPTED |
| D-13 | Odds (display only, §8) | `p = keptRate`, +0.10 if photo 1 is in today, −0.15 if < 2 h left and nothing is in, clamped to [0.05, 0.95]. Hidden for members who have kept today. `p ≥ .5` → `"<Name> 1-to-<round(p/(1−p))>"` (tone `g`); `p < .5` → `"<Name> <round((1−p)/p)>-to-1 to miss"` (tone `ora`); in review → `"<Name> in review"` (tone `vio`). | ACCEPTED |
| D-14 | **Which numbers J1/L1/L2/D4 show while the program still settles all-or-nothing** (BACKEND_GAPS P0-6) | Live balances on D2/B1 are **engine estimates** (the design already labels them "live balance"). For settled real Oaths, J1 and the results screens show **what the chain will actually pay** (`member.payout`), with the breakdown derived from it, never an engine number that won't be paid. Mock mode uses the engine everywhere, but still labels live numbers as estimates. | DECIDED |
| D-15 | A day where **nobody** keeps (all members miss) | The day's lost money goes to the KEPT treasury (no keepers to pay); no separate fee. | ACCEPTED |
| D-19 | Bounty pool split | Survivors split equally (`floor`, dust to the fee). No survivors: the pool returns to the creator, fee not refunded. Mock only (no program support). | ACCEPTED |

## C. Product and UI ambiguities

| # | Question | Build with | Status |
|---|---|---|---|
| D-16 | **Oath names.** Every screen shows a name ("Iron Week", "Hydra 14", "Hydrate Week"), but C1–C6 never ask for one. | Generate `<object word> <length>`, where object word = dumbbell **Iron**, book **Page**, water bottle **Hydrate**, guitar **Riff**, running shoe **Stride**, plant **Green**, skipping rope **Skip**, yoga mat **Flow**, and length 7 → **Week**, 3 / 14 → the number (e.g. "Iron Week", "Page 14"). The words go in `copy/templates.json` (D-17), not in code. **Decided:** generated names, plus a **Rename** action for the creator while the Oath is Open. Stored in `OathDetails` once the backend has a field (BACKEND_GAPS P1-7); kept on the device until then. | DECIDED |
| D-17 | copy.json contains sample values ("9h 18m left"), not placeholders | `apps/mobile/src/copy/templates.json` maps the data-bearing keys to templates. A test renders every template with the sample data and must reproduce copy.json **exactly**, so templates can't drift. `t()` reads copy.json for everything else. | ACCEPTED |
| D-18 | Non-Seekers (A3·no "Solo Oaths only") | They get the full app. Group create (C4 "Group" option), Join (E1) and Bounty join show the designed not-eligible states (disabled option, E3·elig, H2·no). | ACCEPTED |
| D-25 | A2 lists Seeker Wallet / Phantom / Solflare | MWA lets Android choose the wallet. Every row opens the same MWA authorize; the rows describe options, they aren't separate integrations. | ACCEPTED |
| D-26 | Notifications screen M1 (lock-screen mock) | Not a real screen. It's our push content and channel spec; the Gallery shows it for review. | ACCEPTED |
| D-27 | Bounty requirement "token held" | Mock only: any SPL mint address plus a minimum amount, checked against the user's token accounts client-side. | ACCEPTED |
| D-28 | HoldToConfirm | **Not built** (components.md marks it optional; stakes confirm with the wallet signature). | ACCEPTED |
| D-29 | "Results shown once" (L screens) | Per device, keyed `oathId:outcome` in AsyncStorage; D3/D4 always show the outcome after that. | ACCEPTED |

## D. Engineering

| # | Question | Build with | Status |
|---|---|---|---|
| D-20 | Group-only Genesis gating isn't enforced on chain | Accept on Devnet. The app and the backend gate it; recorded in BACKEND_GAPS P0-8. | ACCEPTED |
| D-21 | Devnet "Add SKR" and swap | W2 "Add SKR" = the backend faucet (single-use today; the button hides after use). W3 swap = **mock** on Devnet. | ACCEPTED |
| D-22 | Android package and scheme | Package **`app.kept.mobile`** (already listed in `backend/assetlinks.json`, so it looks like the intended ID), scheme `kept`. The harness (`com.kept.backendtest`) can stay installed side by side. | ACCEPTED |
| D-23 | Real proof before the backend checks photos | Dev builds in `http` proof mode send photo 2 with the target as the "detection" (the same thing the harness does). Photo 1 is mocked (the backend has no step 1). Release builds keep proof on the mock. Clearly marked in the Dev menu. | ACCEPTED |
| D-24 | **Rust / Solana / Anchor aren't installed on this machine** | Phase 0 moves the program, but its build and its LiteSVM + Rust tests can't run here. **Decided: install.** Installed 2026-10-09: Rust stable (rustup, minimal profile), Solana CLI (Agave stable, from release.anza.xyz) + Homebrew `libusb`, and `anchor-cli` 1.2.0 built from the official repo tag (`cargo install --git https://github.com/solana-foundation/anchor --tag v1.2.0`). Not `avm`: the crate named `avm` on crates.io is an unrelated project. | DECIDED |
| D-30 | Solo Oaths on the real program (stake must be 0 today) | `http` mode creates solo Oaths with stake 0 and C6 shows the stake row as 0 SKR; `hybrid` mode keeps solo on the mock so the designed flow (with a stake) is testable. | ACCEPTED |
| D-31 | Cancelled Oaths need a per-member claim (BACKEND_GAPS P1-4) | After a cancel, members see a claim row for the refund in J1; the creator's D1·xs → D0 also triggers their own claim. | ACCEPTED |
| D-32 | Reanimated version | v4 (what SDK 57 ships). motion.md's APIs are unchanged. | ACCEPTED |
| D-33 | The Keeper character | Phases 1–4 use the supplied PNG busts and poses (`assets/keeper/png`). Phase 5 ports the parametric rig from `reference/Keeper.dc.html` to `react-native-svg`, with the PNGs as the Reduce Motion / low-end fallback. | ACCEPTED |
| D-34 | MWA 3.0 vs 2.3 | Start on 3.0 (latest, peer `@solana/web3.js ^1.99`); fall back to 2.3 if the Seeker wallet misbehaves. | ACCEPTED |

## E. Phase 2 (navigation shell, mock API, sign-in)
New assumptions made while building Phase 2. None touches money logic; all are easy to change.

| # | Question | Build with | Status |
|---|---|---|---|
| D-35 | Where the DEVNET badge sits on a real phone (components.md: "keep the badge as an overlay row under" the real status bar) | A 24 dp row under the system status bar on every screen, badge on the left. Long-press opens the Dev menu in development builds. | ASSUMED |
| D-36 | Unbuilt screens | Every one of the 116 ids is registered. Unbuilt ones show their id, name and a row per screen they lead to (from flows.md), so the full map can be walked on a phone. Copy for that note is in `additions.placeholder` (dev-only). | ASSUMED |
| D-37 | A `kept://join/<code>` link while signed in | Opens E1 with the code directly on top of the current stack. While signed out the code is kept and the `cont:` rule opens E1 after A4 (flows.md). | ASSUMED |
| D-38 | Sign-in round trips | Two wallet hand-offs like the harness: connect (to learn the address the nonce is for), then sign. Silent re-authorization makes the second one a single approval. Folding both into one session would need the nonce fetched while the wallet is in front, which the harness found unreliable on Android. | ASSUMED |
| D-39 | Errors on A2·s other than a declined signature or no network | Back to A2 with a toast carrying the backend's message (there's no designed screen for e.g. a 500 during sign-in). | ASSUMED |
| D-40 | The avatar picked on A4 | Saved on the device (session store) and in the mock profile until profiles exist (BACKEND_GAPS P1-9). | ASSUMED |
| D-41 | Mock wallet | The Dev menu can swap MWA for a mock wallet (for emulators with no wallet app). It only pairs with mock auth: the real backend rejects its signature. | ASSUMED |
| D-42 | ESLint version | ESLint 9 in `apps/mobile`: `eslint-config-expo` 57 crashes on ESLint 10. | ASSUMED |

