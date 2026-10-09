# KEPT: Decisions and assumptions

Every open decision from `design/rules.md`, plus everything else I found ambiguous, with the assumption I'll build with.
**Status:** `ASSUME` = I build with this unless you say otherwise · `ASK` = touches money or core-loop behavior, or the design contradicts itself. I need your answer before the phase shown. Nothing here changes the design; where the build differs from the design, it's also in `BACKEND_GAPS.md`.

Quick list of the **ASK** items: **D-6** (day boundary, Phase 3) · **D-9** (Rematch recovery formula, Phase 4) · **D-10** (what happens to money on the breaking day, Phase 1 engine) · **D-14** (which numbers J1 shows while the program is all-or-nothing, Phase 3) · **D-16** (Oath names, Phase 3) · **D-24** (install the Rust/Anchor toolchain here?, Phase 0).

---

## A. Open decisions listed in rules.md

| # | Question | Build with | Status |
|---|---|---|---|
| D-1 | Solo miss damage, and where a solo member's lost SKR goes (there are no keepers) | **−35 HP per solo miss.** Lost SKR goes to the **broken-pot destination** (D-2), minus nothing (no fee, since there's no distribution). The engine exposes this as a `toDestination` amount per day. | ASSUME |
| D-2 | Broken-pot destination | **"Burned, nobody gets it"** (as the copy says). Engine output: `burned`. On chain it'll be the treasury or a burn, the backend developer's call; it doesn't change any screen. | ASSUME |
| D-3 | A miss that costs more than the remaining balance | **Capped at the remaining balance.** The member's balance floors at 0, and they can keep proving. | ASSUME |
| D-4 | Rounding | Integer math in base units (SKR = **6 decimals**, `scripts/v4-setup.ts:31`), `bigint` everywhere. Miss cost `floor(stake·3^k / (days·2^k))`. Fee `floor(lost·10%)`. Each keeper's share `floor(pool·w_i/Σw)`. **All dust goes to the fee.** Checked by hand on the worked example: A 1,468,750,000 · B 779,166,667 · C 1,468,750,000 · D 166,666,667 · fee 116,666,666 → sum exactly 4,000,000,000; displayed at 2 dp it matches rules.md. | ASSUME |
| D-5 | Heal on a day someone missed | **+10 every day after damage**, capped at 100 (but see D-10: no heal if the damage reached 0). | ASSUME |
| D-6 | **Day boundary.** rules.md says local midnight; the program uses 24 h windows from the moment of Start (`lib.rs:137-140`) and ignores the stored time zone. The design itself also says "Day 1 begins when the creator presses Start." | **The app never computes days itself.** It shows `dayEndsAt` / `secondsToReset` from the API, so whichever rule the backend uses, the UI is right, except that some copy literally says "midnight". Mock and engine assumption: **day 1 = Start → next midnight in the creator's time zone (fixed at creation); later days midnight to midnight.** I need you to pick (a) that, or (b) keep 24 h windows and accept "midnight" in the copy is approximate. | **ASK** before Phase 3 |
| D-7 | Deadline reminder threshold | **2 hours** (B4, push). Already what the backend does (`v4.ts:286`). | ASSUME |
| D-8 | Daily recap | Shown **once after the day ends**, the first time the app opens that day (stored per device). | ASSUME |

## B. Money and rules, not covered by rules.md

| # | Question | Build with | Status |
|---|---|---|---|
| D-9 | **Rematch recovery formula.** "50 % of what they lost in the original" vs. funding "half of each member's lost money is held". When an Oath breaks, everyone's final balance is 0, so "what they lost" is ambiguous, and the literal reading (50 % of the stake) can need more than was held. | **recovery_i = held_i = 50 % of member i's balance at the moment of the break** (what burned from them). It's solvent by construction, and it's what R1 and R4 display. | **ASK** before Phase 4 |
| D-10 | **The breaking day.** If damage takes HP to 0, is there a heal, a distribution or a fee that day? | Order per day: misses → miss costs → damage → **if HP ≤ 0: break**: no heal, no distribution, no fee. Every remaining balance, including that day's miss costs, goes to D-2, with 50 % of each member's held for the Rematch (D-9). Otherwise: fee → distribution → heal. | **ASK** (engine is written in Phase 1; I'll make it a single function, easy to change) |
| D-11 | Max members | **4**, matching the program (`state.rs:3`) and D1's four seats. | ASSUME |
| D-12 | Kept rate formula (rules.md §7 gives only the properties) | Over every day outcome (Oaths + Bounties) with weight `0.97^ageInDays`; each clean finish adds 2 kept pseudo-days; prior of 5 pseudo-days at 80 %. `rate = (Σw·kept + 4) / (Σw + 5)`. Shows **"New"** under 10 real days, else `"92% · 64 days"` (64 = real days counted). Display only. | ASSUME |
| D-13 | Odds (display only, §8) | `p = keptRate`, +0.10 if photo 1 is in today, −0.15 if < 2 h left and nothing is in, clamped to [0.05, 0.95]. Hidden for members who have kept today. `p ≥ .5` → `"<Name> 1-to-<round(p/(1−p))>"` (tone `g`); `p < .5` → `"<Name> <round((1−p)/p)>-to-1 to miss"` (tone `ora`); in review → `"<Name> in review"` (tone `vio`). | ASSUME |
| D-14 | **Which numbers J1/L1/L2/D4 show while the program still settles all-or-nothing** (BACKEND_GAPS P0-6) | Live balances on D2/B1 are **engine estimates** (the design already labels them "live balance"). For settled real Oaths, J1 and the results screens show **what the chain will actually pay** (`member.payout`), with the breakdown derived from it, never an engine number that won't be paid. Mock mode uses the engine everywhere. | **ASK** before Phase 3 |
| D-15 | A day where **nobody** keeps (all members miss) | The day's lost money goes to D-2 (no keepers to pay); no fee. | ASSUME |
| D-19 | Bounty pool split | Survivors split equally (`floor`, dust to the fee). No survivors: the pool returns to the creator, fee not refunded. Mock only (no program support). | ASSUME |

## C. Product and UI ambiguities

| # | Question | Build with | Status |
|---|---|---|---|
| D-16 | **Oath names.** Every screen shows a name ("Iron Week", "Hydra 14", "Hydrate Week"), but C1–C6 never ask for one. | Generate `<object word> <length>`, where object word = dumbbell **Iron**, book **Page**, water bottle **Hydrate**, guitar **Riff**, running shoe **Stride**, plant **Green**, skipping rope **Skip**, yoga mat **Flow**, and length 7 → **Week**, 3 / 14 → the number (e.g. "Iron Week", "Page 14"). The words go in `copy/templates.json` (D-17), not in code. Stored in `OathDetails` once the backend has a field (BACKEND_GAPS P1-7); computed client-side until then. | **ASK** before Phase 3 |
| D-17 | copy.json contains sample values ("9h 18m left"), not placeholders | `apps/mobile/src/copy/templates.json` maps the data-bearing keys to templates. A test renders every template with the sample data and must reproduce copy.json **exactly**, so templates can't drift. `t()` reads copy.json for everything else. | ASSUME |
| D-18 | Non-Seekers (A3·no "Solo Oaths only") | They get the full app. Group create (C4 "Group" option), Join (E1) and Bounty join show the designed not-eligible states (disabled option, E3·elig, H2·no). | ASSUME |
| D-25 | A2 lists Seeker Wallet / Phantom / Solflare | MWA lets Android choose the wallet. Every row opens the same MWA authorize; the rows describe options, they aren't separate integrations. | ASSUME |
| D-26 | Notifications screen M1 (lock-screen mock) | Not a real screen. It's our push content and channel spec; the Gallery shows it for review. | ASSUME |
| D-27 | Bounty requirement "token held" | Mock only: any SPL mint address plus a minimum amount, checked against the user's token accounts client-side. | ASSUME |
| D-28 | HoldToConfirm | **Not built** (components.md marks it optional; stakes confirm with the wallet signature). | ASSUME |
| D-29 | "Results shown once" (L screens) | Per device, keyed `oathId:outcome` in AsyncStorage; D3/D4 always show the outcome after that. | ASSUME |

## D. Engineering

| # | Question | Build with | Status |
|---|---|---|---|
| D-20 | Group-only Genesis gating isn't enforced on chain | Accept on Devnet. The app and the backend gate it; recorded in BACKEND_GAPS P0-8. | ASSUME |
| D-21 | Devnet "Add SKR" and swap | W2 "Add SKR" = the backend faucet (single-use today; the button hides after use). W3 swap = **mock** on Devnet. | ASSUME |
| D-22 | Android package and scheme | Package **`app.kept.mobile`** (already listed in `backend/assetlinks.json`, so it looks like the intended ID), scheme `kept`. The harness (`com.kept.backendtest`) can stay installed side by side. | ASSUME |
| D-23 | Real proof before the backend checks photos | Dev builds in `http` proof mode send photo 2 with the target as the "detection" (the same thing the harness does). Photo 1 is mocked (the backend has no step 1). Release builds keep proof on the mock. Clearly marked in the Dev menu. | ASSUME |
| D-24 | **Rust / Solana / Anchor aren't installed on this machine** | Phase 0 moves the program, but its build and its LiteSVM + Rust tests can't run here. Should I install Rust stable, the Solana CLI and Anchor 1.2.0 (via `avm`)? That's several GB and changes your toolchain, so I won't do it without a yes. Without it, Phase 0 reports the program tests as "not run". | **ASK** before Phase 0 |
| D-30 | Solo Oaths on the real program (stake must be 0 today) | `http` mode creates solo Oaths with stake 0 and C6 shows the stake row as 0 SKR; `hybrid` mode keeps solo on the mock so the designed flow (with a stake) is testable. | ASSUME |
| D-31 | Cancelled Oaths need a per-member claim (BACKEND_GAPS P1-4) | After a cancel, members see a claim row for the refund in J1; the creator's D1·xs → D0 also triggers their own claim. | ASSUME |
| D-32 | Reanimated version | v4 (what SDK 57 ships). motion.md's APIs are unchanged. | ASSUME |
| D-33 | The Keeper character | Phases 1–4 use the supplied PNG busts and poses (`assets/keeper/png`). Phase 5 ports the parametric rig from `reference/Keeper.dc.html` to `react-native-svg`, with the PNGs as the Reduce Motion / low-end fallback. | ASSUME |
| D-34 | MWA 3.0 vs 2.3 | Start on 3.0 (latest, peer `@solana/web3.js ^1.99`); fall back to 2.3 if the Seeker wallet misbehaves. | ASSUME |
