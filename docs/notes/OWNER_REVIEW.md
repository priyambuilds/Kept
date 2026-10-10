# Owner review: every open decision on one page

Everything in `docs/DECISIONS.md` still marked **ASSUMED** or **ASK** (plus copy waiting for review),
one line each with what I recommend. Reply with the numbers you disagree with; everything else becomes
CONFIRMED. Status as of 2026-10-10. There are no **ASK** items left; the two blocking questions are Q1 and
Q2 at the bottom.

## Decisions (ASSUMED)

| # | What was assumed | Recommend |
|---|---|---|
| D-35 | DEVNET badge in a 24 dp row under the real status bar (long-press = Dev menu in dev builds) | Confirm |
| D-36 | Unbuilt screens show a map placeholder | **Close as obsolete**: every screen is built and the placeholder was removed |
| D-37 | A join link while signed in opens E1 on top of the current stack | Confirm |
| D-38 | Sign-in is two wallet hand-offs (connect, then sign) | Confirm; one hand-off was unreliable on Android in the harness |
| D-39 | Other sign-in errors: back to A2 with the backend's message as a toast | Confirm (D-89 adds a plain-language toast for "no wallet app") |
| D-40 | The avatar from A4 lives on the device until profiles exist (P1-9) | Confirm |
| D-41 | Dev menu can swap in a mock wallet (dev builds only) | Confirm |
| D-42 | ESLint 9, because eslint-config-expo 57 crashes on 10 | Confirm; revisit on the next Expo SDK |
| D-43 | Real Oaths: day 1 starts at Start, 24 h windows (program today) | Confirm until the program change (P0-4) |
| D-44 | Which Oath screen a card opens (D1 / D2 / D3 / D4 by state) | Confirm |
| D-45 | Which Today state wins with several Oaths (B4 > B2 > B3 > B1) | Confirm |
| D-46 | "Riya kept" without a time (no proof times yet, P0-2) | Confirm |
| D-47 | Nudge only people with nothing in today, not someone in review | Confirm |
| D-48 | Streak chips left out until the backend has streaks | Confirm |
| D-49 | Keeper lines are static, even where they name prototype people | Confirm for launch; data-aware lines are a later feature |
| D-50 | Results open once, the first time a settled / broken Oath is seen | Confirm |
| D-51 | "Settle now" fallback on D2 when a real Oath's last day is over | Confirm |
| D-53 | A Rematch and a Bounty entry are ordinary Oaths in the app | Confirm |
| D-54 | Group review: majority of the others approves; tie rejects; 48 h expiry = miss | Confirm |
| D-55 | The broken-Oath sample uses different misses so it can actually reach 0 HP | Confirm (fixture only, rules unchanged) |
| D-56 | Where each inbox item leads | Confirm |
| D-57 | Numbers as digits ("7 days kept"), not words | Confirm |
| D-58 | "{name} keeps **their** Oaths private" (no pronouns known) | Confirm |
| D-59 | Devnet swap quote and amounts (mock) | Confirm (Demo only; hidden in Live) |
| D-60 | Copy for states the design shows one sample of (`additions.bounty.*`, `additions.wallet.*`) | Review the copy once |
| D-61 | Settings, socials, follows kept on the device; cover upload "coming later" | Confirm until the backend stores them |
| D-62 | W1 totals: "Locked in Oaths" excludes Rematches and Bounties | Confirm |
| D-63 | M1 is a static screen of push texts until real pushes | Confirm |
| D-64 | R4 / R4·lost show Fee 0 (the fee is inside the money lost) | Confirm; it's what rules.md §3 says |
| D-66 | Solo Oaths start right after create (no Start step) | Confirm |
| D-67 | "Day 1 starts Saturday" when day 1 isn't tonight | Confirm |
| D-68 | Invite link is `kept://join/<code>` until the web link exists | Confirm; switch when P1-19 lands |
| D-69 | Per-screen ambient light / Keeper placement generated from the design | Confirm |
| D-70 | Sheet buttons at 54 dp (the PDF squeezes them) | Confirm |
| D-71 | DEVNET row sits 24 dp under the status bar (PDF puts it in the bar) | Confirm |
| D-72 | Flow-screen Keeper note behaviour | **Close**: superseded by D-81 (never opens by itself) |
| D-73 | B1 shows the Bounty entry as a second card (PDF) | **Close**: superseded by D-85 (one swipeable deck) |
| D-80 | Live / Demo picker (A1·m) and its copy | Confirm the copy in `additions.mode` |
| D-87 | Crash recover screen and the "That didn't work" toast | Confirm; review `additions.recover` |
| D-88 | Demo "Skip to tomorrow" in Settings (+24 h on the demo clock) | Confirm; review `additions.mode.skip*` |
| D-89 | Live resilience: timeouts, M2 for loads that fail, expired token, no wallet app | Confirm; review `additions.session`, `additions.loadFailed`, `additions.wallet.noWalletApp` |

## Copy waiting for review

| Where | Keys |
|---|---|
| Mode picker, Demo settings | `additions.mode.*` (D-80, D-88) |
| Today's card deck | `additions.deck.*` (D-85) |
| Crash safety | `additions.recover.*` (D-87) |
| Live errors | `additions.session.expired`, `additions.loadFailed.*`, `additions.wallet.noWalletApp` (D-89) |
| Live Bounty brand | `additions.bounty.liveBrand` ("KEPT", Q3) |

## Still blocking (from `LIVE_DEMO_PLAN.md` §4)

| # | Question | Recommend |
|---|---|---|
| Q1 | Proof in Live: the backend expects an on-device check the app doesn't have | **(c)**: ask the backend developer to restore the server-side check; it's what the design says ("checked by AI on our server") and needs no 2.6 GB download |
| Q2 | Money and HP in Live: the chain pays rules v1, not the design's HP / cost-per-miss | **(a)** for launch: keep the engine numbers labelled as estimates and show the on-chain payout on J1; decide the v2 fee screens when v2 is switched on |
