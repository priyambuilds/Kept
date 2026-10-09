# Fidelity audit (2026-10-09)

The checklist for the fidelity, motion, performance and logic pass (`docs/FIDELITY_PASS.md`). Written **before** fixing; each item is ticked or moved to "Remaining" as it lands. Ranks: **P0** broken or wrong · **P1** visibly off · **P2** polish.

## Tooling
| What | Command | Output |
|---|---|---|
| Design.pdf → one PNG per screen id | `python3 apps/mobile/scripts/pdf-screens.py` (needs `brew install poppler`, Pillow) | `artifacts/pdf/<id>.png`, `artifacts/pdf/pages.json` (id → PDF page) |
| App screens | `pnpm --filter @kept/mobile shoot [--out dir] [--ids a,b]` | `artifacts/screens/` (baseline for this pass: `artifacts/before/`) |
| Prototype screens | `pnpm --filter @kept/mobile shoot:reference` | `artifacts/reference/` |
| Compare page | `pnpm --filter @kept/mobile compare` | `artifacts/compare/index.html`: **app · prototype · Design.pdf** per id |

Design.pdf is the 116-screen book: a cover, then three phones per page in `routes.gen.json` order (40 pages). The PDF has no text layer (outlined), so the comparison is visual.

---

## 1. Systemic findings (fix once, every screen benefits)

| # | P | Finding | Where |
|---|---|---|---|
| S1 | **P0** | **Tab bar active item isn't the pill.** The `PressScale` inside each flex item has no `flex: 1`, so the white background only wraps the icon + label; the label doesn't fade; inactive items don't share the width. components.md › TabBar: item 52 h radius 26, active flex 1.7 white + label, inactive flex 1 icon only, flex 200 ms + label fade. | `components/chrome/TabBar.tsx` |
| S2 | **P0** | **Inline Keepers everywhere.** 19 screens render a `KeeperPlacement` that the design moves into the KeeperMark + KeeperNote (the prototype's rule: a `kp` block smaller than 120 becomes the note; sheets keep theirs). Table in DECISIONS › Keeper placement. | B1 B4 C1 D0 D2 D2·low R·act F2 F2a F4·chk G1 H1·c H3 I1 A4 N1 W1 I9 (+ B5, M3 are sheets: inline is right) |
| S3 | **P0** | **KeeperNote leaks across navigation.** It's a global overlay (`useUi.keeperNote`) with no close on blur, tab change, sheet or back; tab screens open it straight away; flow screens never auto-open it; there's no knock, no unread dot logic, no cycle pill. | `app/hosts.tsx`, `state/ui.ts`, `screens/tabs/TabScreen.tsx` |
| S4 | **P0** | **KeeperMark never knocks**, never shows the unread dot (always `hasNew: false`), and the NavBar never shows the mark (no screen passes `keeper`). | `KeeperUI.tsx › KeeperMark`, `Header.tsx` |
| S5 | **P0** | **DayMemberGrid "today" column is off by one.** Screens pass `dayIndex` (0-based) where the grid expects a 1-based day: D2 highlights day 2 on day 3, D2·low day 4 on day 5, R·act day 2 on day 3. | `screens/oaths/Oaths.tsx` (Active), grid callers |
| S6 | P1 | **No screen-enter choreography.** motion.md: every block enters with `enter` (500 ms, 16 dp, .98) at 40 + 65·i ms; pinned actions at 200 ms. Only A1's title does. | `components/layout/Screen.tsx` |
| S7 | P1 | **Sheets close with no animation.** Closing pops the route at once; the sheet and scrim vanish instead of sliding down / fading (300 ms `enter`). Back (hardware) also skips it. | `components/chrome/Overlays.tsx`, sheet screens |
| S8 | P1 | **No haptics at all.** motion.md lists them for splash, HP damage/heal, money, day kept, broken, payout, Rematch, proof pass/fail, signing, value pills. `expo-haptics` is installed but unused. | everywhere |
| S9 | P1 | **Keeper is a static PNG** (no blink, breathing, moods × props × poses combined, no anims). The parametric rig exists in `reference/Keeper.dc.html`. | `components/keeper/Keeper.tsx` |
| S10 | P1 | **KeeperNote animation** uses `Pop` (scale .4 → 1.08) instead of `note` (translateY −16, scale .72 → 1, 420 ms springSoft, origin at the mark: 30 dp from the left on headers, from the right on nav bars). Top is computed from the header for nav screens too. | `KeeperUI.tsx › KeeperNote` |
| S11 | P1 | **Count-ups run on the JS thread** (`requestAnimationFrame` + `setState` 60×/s for 900 ms) on HPPanel, MoneyMoment, KeptRateRing, R1 etc.: re-renders the whole block every frame. | `primitives/motion.tsx › useCountUp` |
| S12 | P1 | **Sheet action buttons**: the prototype/PDF draw sheet buttons with their icons (D1·x "Cancel Oath" `close`, M3 "Get devnet SOL" `water-outline`, M4 "Open the faucet" `water-outline`) and `+` / W2 "Close" as a secondary button; the app shows text buttons and no icons. M4's primary is lime in the app, white (`p`) in the design. | `PlusSheet`, `Signing.tsx` (M3/M4), D1·x, W2 |
| S13 | P1 | **Brand stamp under the pinned button.** The prototype appends the stamp as the **last content block** (F5, J1·ok, L1, L2, L6, H5); the app pins it under the bottom button. | Proof, Results, Rematch, Bounties |
| S14 | P1 | **KeeperPlacement orbs** (floating 3D tiles/coins, `float` 5–7 s) aren't implemented: A1 (dumbbell/book/bottle/coin), R1 (sack coins), L1/J1·ok/L6 (sack + trophy). Bubble uses `Pop` instead of `bubble` (scale .6 + 8 dp, springHard, 450 ms delay). | `KeeperUI.tsx › KeeperPlacement` |
| S15 | P1 | **Option select** jumps to its tilt; motion.md: rotate ±2° + raise, 250 ms `spring`. Toggle knob has no 150 ms slide. | `content/Inputs.tsx`, `content/Rows.tsx` |
| S16 | P1 | **Splash sequence** is only the tile pop: no check `draw` (320 ms), stem/leg `in`, "KEPT"/tagline `in` at 900/1050 ms, `impactLight` at 350 ms. | `brand/Brand.tsx` |
| S17 | P1 | **Proof fail**: no gesture-badge shake (0 → −6 → 6 → −3 → 0, 300 ms), no haptics. | `content/Camera.tsx` |
| S18 | P2 | Toast hides without its 200 ms fade; Toast/Bell badge pop use `spring` not `springHard`. | `Overlays.tsx`, `Header.tsx` |
| S19 | P2 | SignStatus success icon pops with `spring` (motion.md: 600 ms `springHard`, delay 150). | `content/Status.tsx` |
| S20 | P2 | HP damage / heal on an **unseen** change (count from the last seen value, lost segments fade + ring, heal segments pop left → right) isn't implemented: the panel always counts from 0. BalanceChip doesn't count + pop on change. | `Oath.tsx › HPPanel`, `Header.tsx` |
| S21 | P2 | DEVNET badge sits in a 24 dp row under the Android status bar (D-35), so every bar is 24 dp lower than the PDF (header at y 80 instead of 56). Kept: the real status bar can't host the badge. Logged as a conflict. | `Screen.tsx` |
| S22 | P2 | Sheet buttons in Design.pdf/prototype are drawn ~20 dp high (the sheet's flex column squeezes them; components.md says sheets render pinned actions "inline"). Kept at 54 dp (components.md › Button); logged as a conflict. | B5, M3, M4, D1·x |

## 2. Keeper placement (owner report 2)
Rule in the PDF and the prototype (`renderVals`: a `kp` block with `size < 120` becomes the note): **inline** only where the design draws the character in the layout. Full table in `docs/DECISIONS.md › I. Keeper placement`.

## 3. Per screen (app vs Design.pdf / prototype)
Differences beyond the systemic ones above. "Mark" = the screen moves its Keeper into the KeeperMark/KeeperNote (S2–S4).

| Id | P | Differences |
|---|---|---|
| A0 | P1 | Splash sequence (S16). |
| A1 | P1 | Orbs around the Keeper missing (dumbbell, book, water, coin tiles; S14); chip positions differ ("1,000 SKR pot" bottom-left, "3-to-1 on you" right). |
| A2 | P2 | Phantom / Solflare row tiles: the PDF shows each wallet's own glyph (ghost, sun) on white tiles; the app uses wallet icons. |
| A2·s | — | Matches. |
| A2·e | P2 | Keeper shocked pose; parametric Keeper (S9). |
| A3, A3·no | — | Match. |
| A4 | P1 | Mark (72). PDF nav shows the KeeperMark. |
| B1 | P1 | Mark (76) with the dot + knock. Main card should be **stacked** (two cards peeking, `stack`); Bounty entries show as a second OathCard ("31 of 40 in", "Not started", Prove) not a row. |
| B2 | P2 | Rows show "kept" not the kept time (D-46); "Streak 13" / "Kept rate 91%" chips under the rows missing (D-48). |
| B3 | — | Matches (featured cover colours differ: design sky→blue). |
| B4 | P1 | Mark (110, `tap`) with dot + knock; main card stacked. |
| B5 | P1 | Dev link opens it with no recap rows (fixture), so only the Keeper and "Got it" show. Sheet buttons (S12/S22). |
| + | P1 | "Close" is a secondary button; "Start an Oath" tile is white, "Join" icon tile dark, "Create a Bounty" lime (palette per row). |
| C1 | P1 | Mark (76, 3 lines → action pill "1/3"); PDF shows the input focused (lime ring + caret) on entry. |
| C2–C5 | — | Match (option tilt animation S15). |
| C6 | — | Matches. |
| C7 | — | Matches. |
| C7·ok | — | Matches (value pill animates). |
| C7·no | — | Matches (inline 120). |
| C7·fail | — | Matches. |
| C8 | P2 | Link `kept://join/…` vs `kept.app/o/…` (D-68). |
| D0 | P1 | Mark (76, 3 lines) with dot + knock; active cards use the default (gradient) card in the PDF. |
| D1 | — | Matches. |
| D1·m | — | Matches. |
| D1·x | P1 | "Cancel Oath" needs the `close` icon (S12). |
| D1·xs, D1·go | — | Match. |
| D2 | **P0** | Today column off by one (S5). Mark (92). Lost-today ring on 2 segments: the PDF shows none on the day after (ring only during the day of the loss). |
| D2·low | **P0** | Today column off by one (S5). Mark (100, scythe). |
| D3 | P2 | Matches (embers). |
| D4 | — | Matches. |
| D5 | — | Matches. |
| E1 | — | Matches. |
| E2 | — | Matches. |
| E2·s | — | Matches. |
| E3·* | — | Match (inline 130). |
| R1 | P1 | Chips "6d 23h left" / "+500 SKR" float around the Keeper (with sack orbs) instead of a chip row on top. |
| R2 | — | Matches. |
| R3 | — | Matches. |
| R·act | **P0** | Today column off by one (S5). Mark (90). |
| R4, R4·lost | — | Match (numbers per D-64). |
| F1·perm, F1 | — | Match. |
| F2 | P1 | Mark (100, lens). |
| F2a | P1 | Mark (100, shrug); no shake (S17). |
| F2b, F2c | — | Match. |
| F3 | — | Matches. |
| F4 | — | Matches. |
| F4·chk | P1 | Mark (100, lens). |
| F4a, F4a·g | — | Match. |
| F5 | P1 | Stamp is the last content block (S13); chips row "HP 90 · 1,043 SKR safe · Streak 13" (HP chip missing; streak D-48). |
| G1 | P1 | Mark (84, lens). |
| G2, G3 | — | Match. |
| G3·no | — | Matches (inline 120). |
| H1 | — | Matches. |
| H1·j | — | Matches. |
| H1·c | P1 | Mark (100, sack) with dot + knock. |
| H2, H2·no | — | Match. |
| H3 | P1 | Mark (92, whisper). |
| H4 | — | Matches. |
| H5 | P1 | Stamp position (S13). |
| H6 | P2 | Finisher rows: initial tiles (R, N) instead of icons. |
| H7 | — | Matches. |
| I1 | P1 | Mark (80, 3 lines) with dot + knock. "Make it yours" banner (vio, `account-edit`) above the profile card is missing. |
| I2, I2·me | P2 | Social chip glyph: "X" vs MDI twitter bird. |
| I2·p | — | Matches (D-58 wording). |
| I3 | P2 | Cover gradient (sample brand colours). |
| I4 | — | Matches. |
| I5 | P2 | Row tiles: lime money tiles / check icons per row kind. |
| I7 | P2 | Rows "Find me by name", "Let anyone invite me" have leading icons (magnify, email-outline). |
| I8 | P2 | "Banner" label before the swatches; first field focused. |
| I9 | P1 | Mark (72, point). |
| J1 | — | Matches. |
| J1·p, J1·f | — | Match. |
| J1·ok | P1 | Stamp position (S13); orbs (S14). |
| K1–K4 | — | Match. |
| K5 | P2 | New Bounty cover colour (D-known). |
| K5·p, K5·ok | — | Match. |
| L1 | P1 | Orbs (sack, trophy; S14); stamp (S13). |
| L2 | P1 | Stamp (S13). |
| L3, L4, L4·m, L4·b | — | Match (sample numbers D-65). |
| L5 | P2 | Fixture shows only "Survived"; the PDF also lists "Eliminated". |
| L6 | P1 | Stamp (S13); orbs; REMATCH chip on the Keeper. |
| M1 | — | Matches. |
| M2 | — | Matches (inline 130). |
| M3, M4 | P1 | Sheet buttons (S12). |
| N1 | P1 | Mark (76, 3 lines). Leading tiles: avatars and Keeper busts with badges (known). |
| W1 | P1 | Mark (80, sack). |
| W2 | P1 | "Close" secondary button; first tile lime. |
| W3, W3·s, W3·ok, W4 | — | Match. |

## 4. Motion (motion.md vs app)
Checked against the code and on the emulator (dev build). Prototype references: `reference/KEPT Play.dc.html` keyframes. Recordings: `artifacts/motion/` (after).

| Moment | Spec | App before | P |
|---|---|---|---|
| Screen enter | blocks `enter` 40 + 65·i; pinned 200 ms | none | P1 (S6) |
| Stack transitions | flows slide from right, moments fade, sheets as sheets | slide / fade OK; sheets pop instantly on close | P1 (S7) |
| Tab change | flex 1 → 1.7 200 ms + label fade | flex only on a collapsed pill | P0 (S1) |
| KeeperMark knock | rotate −14/11/−6°, 2.6 s ×3, delay .8 s, origin 50 % 90 % | missing | P0 (S4) |
| KeeperNote drop | `note` 420 ms springSoft from the mark | `Pop` scale .4 | P1 (S10) |
| HP damage / heal | unseen change: count from last value, ring + beat, heal pop | count from 0 every visit | P2 (S20) |
| HP segments | pop 300 ms, 200 + 28·i (panel) / 300 + 22·i (card) | ✓ | — |
| Grid cells | pop 350 ms, 250 + 60·row + 40·col; beats | ✓ | — |
| Money count-up | 900 ms ease-out cubic | ✓ but JS thread | P1 (S11) |
| Money pill | `money` 600 ms spring, delay 200 | ✓ | — |
| Coins / embers / value pills | FX layer | ✓ (keyed per navigation) | — |
| Day kept (F5) | burst + falling coins + DayStrip pops + pills | ✓ except haptic | P1 (S8) |
| Broken (D3/L3/L4·b) | embers, `notificationError` + `impactHeavy` | embers ✓, no haptics | P1 |
| Payout / comeback | coins, pills, haptics (double knock on L6) | coins ✓, no haptics | P1 |
| Proof scan | corners lime, scan line alternate 1.5 s | ✓ | — |
| Proof fail | corners red, badge shake, `notificationError` | no shake / haptic | P1 (S17) |
| Signing ring | spin 1.1 s; success fill + 2 pings + icon pop springHard | ✓ (pop easing) | P2 (S19) |
| Toast | `pop` 400 springHard, 1.9 s, fade 200 | no fade-out | P2 (S18) |
| Sheet open/close | slide + fade 300 `enter` | open ✓, close instant | P1 (S7) |
| Option select | tilt + raise 250 spring | instant | P1 (S15) |
| Toggle | knob 150 ms | instant | P2 (S15) |
| Button press | scale .98 100 ms | ✓ | — |
| Splash | tile pop, check draw, stem/leg/text in, impactLight | tile pop only | P1 (S16) |
| Keeper idle | blink, breathing, hand gestures per frame | static PNG | P1 (S9) |
| Bubble | `bubble` 500 springHard delay 450 | `Pop` | P2 (S14) |

## 5. Routing (flows.md)
Checked by reading the navigator and with the route test added in this pass (`__tests__/routes.test.tsx`, generated from flows.md's table).

| # | P | Finding |
|---|---|---|
| N1 | **P0** | KeeperNote stays up after navigating, changing tab, opening a sheet or going back (S3). |
| N2 | P1 | Sheets: closing pops instantly (S7); a sheet opened over a tab screen leaves the tab's note open (S3). |
| N3 | P1 | Signing screens: hardware back during a pending signature leaves the screen while the wallet task keeps running; flows.md: transient, replaced by their result. Back is now blocked while pending (the close button still cancels). |
| N4 | P1 | Moments (L*, J1·ok, C7·ok, K5·ok, F5) block hardware back **forever**; flows.md: "no back gesture **until settled**". |
| N5 | P2 | `kept://join/<code>` while signed in pushes a new E1 on every link (duplicates). Now navigates to the existing E1 with the new code. |
| N6 | — | Tab state is kept per tab (bottom tabs keep their screens mounted). ✓ |
| N7 | — | Every "Goes to" in the route table is reachable from its screen (route test). |

## 6. Logic
| # | P | Finding |
|---|---|---|
| L-1 | **P0** | Grid today off by one (S5). |
| L-2 | P1 | `useOath` / `useOathList` re-render every second (`useNow(1000)`) and rebuild every view, even off-screen (tabs stay mounted): timers keep running behind other screens. Now paused while unfocused. |
| L-3 | P1 | `useUi.keeperNote` is global state shared by every screen (S3); the toast host is global by design (toasts after an action that navigates, e.g. `do:` routes). |
| L-4 | P2 | D2 lost-today ring shows the last finished day's loss on the next day (the design rings it only on the day of the loss; spec says "beats for the rest of the day"). Kept: it's the day after the loss that the user first sees it. Logged. |
| L-5 | — | Engine numbers on Today / D2 / recap / results agree (same `oathView`); claim numbers per D-14. ✓ |
| L-6 | — | Drafts reset after create (C7·ok) and the Bounty draft after K5·ok. ✓ Inbox "done" set persists per item. ✓ |

## 7. Performance (release build, Pixel 8 AVD, API 34)
Measured with `adb shell dumpsys gfxinfo app.kept.mobile` (janky frames over a scripted scroll / transition) and cold start with `am start -W`.

Measured 2026-10-10 with `node apps/mobile/scripts/perf.mts <apk>` (mock release APKs, two runs each; JSON in `artifacts/perf/`). The emulator is noisy run to run; read the ranges, not single numbers. p50 frame times of 17–34 ms mean the AVD isn't holding 60 fps on any build (software GPU); confirm on a phone.

| Measure | Before (`artifacts/before/app-release-mock.apk`) | After (`artifacts/perf/app-release-mock-after.apk`) |
|---|---|---|
| Cold start, `TotalTime` (3 launches) | 1469–1516 ms | 1230–1612 ms |
| Tab switches ×8, janky | 6.0–6.6 % (p95 48–150 ms) | 1.6–6.8 % (p95 31–150 ms) |
| Bounties scroll, janky | 17.1–17.5 % (p95 150–1050 ms, p99 1.35–2 s) | 6.3–8.6 % (p95 48–65 ms, p99 77–85 ms) |
| Push / back ×4, janky | 12.2–20.1 % (p99 2–2.4 s) | 5.5–5.7 % (p99 0.75–1.2 s) |

**P-6 (P1, pre-existing, not fixed):** Reanimated 4.5.1 logs `synchronouslyUpdateUIProps failed … Unable to find SurfaceMountingManager for tag` with a full stack trace for every update to a view that isn't mounted (yet / any more): ~43k lines per perf run before, ~29k after. The logging runs on the UI thread; one "after" run hit an ANR on D2 during the push/back burst with the main thread inside that log call. Repeat visits to a screen log nothing; first mounts of busy screens (D2: segment and cell pops, enters) do. Next: reproduce in a minimal screen, then try the Reanimated patch release / `react-native-screens` freeze settings, or start entering animations one frame after mount.

Findings from the code:
| # | P | Finding |
|---|---|---|
| P-1 | P1 | Count-ups re-render on the JS thread every frame (S11). |
| P-2 | P1 | Every Oath screen re-renders once a second (`useNow(1000)`) even off-screen (L-2). |
| P-3 | P2 | Lists are plain `ScrollView` + `map` (D0, D5, H7, N1, I5): fine at today's sizes (≤ 20 rows); FlashList isn't installed and isn't needed until history/feeds paginate. |
| P-4 | P2 | Each ambient orb is an SVG radial gradient (420 / 380 dp) animated with transforms: cheap on the UI thread; kept. |
| P-5 | P2 | Keeper PNGs at 3x are ~200 KB each; the parametric Keeper replaces them on screen (PNGs stay as the fallback). |

---

## Status after session 2 (2026-10-10)

### Fixed (session 2, steps 1–11 of the session-1 list)
| Item | Fix | Commit |
|---|---|---|
| WIP | typecheck / lint / tests green; rig palette moved to `theme/keeperRig.ts`; Jest mock for `useFrameCallback` | Keeper: per-screen host… |
| S2, S3, S4, N1, L-3 | `Screen` hosts the Keeper (`useKeeperHost`): AppHeader/NavBar read the mark (dot + knock while unread); notes close on blur; `KeeperNoteHost` and `useUi.keeperNote` removed. All screens use `ScreenKeeper` (inline only at size ≥ 120 or on sheets) | same |
| S6 | Screen-enter choreography: blocks `Enter` at 40 + 65·i, pinned at 200 ms, tabs replay on focus. Note-only Keepers mount outside the block list (regression caught by the new KeeperNote test) | Screen: enter choreography…; Tests: … |
| S7, N2 | `useSheetRoute`: back / scrim / swipe / Close slide the sheet down (300 ms) before the route is removed (D-75) | Sheets: slide down… |
| S12 | + / W2 Close secondary; D1·x `close` icon; M3/M4 `water-outline`, M4 primary white; W2 swap tile lime; note icons | same |
| S5, L-1 | `gridToday(dayIndex)`; D2 / D2·low / R·act light today's day; test | Grid: today's column… |
| S11, P-1 | HPPanel, MoneyMoment, KeptRateRing count with the leaf `CountText` | Motion: leaf count-ups… |
| S15 | Option select eases its tilt (`Tilt`, 250 ms spring); Toggle already slid 150 ms | same |
| S17 | Proof fail: gesture badge `Shake` + `notificationError` | same / Haptics |
| S18, S19 | Toast fades out 200 ms, pops springHard; Bell badge springHard; SignStatus icon springHard | same |
| S16 | Splash: check draw 320 ms at 350, stem 600, leg 750, KEPT 900, tagline 1050, impactLight at 350 (checked on the emulator) | Splash… |
| S8 | Haptics: FX moments (kept / payout / broken / comeback via `playFx(…, feel)`), impactLight per value pill, signing success/fail, proof pass/fail, splash | Haptics… |
| S13 | Brand stamp is the last content block (F5, J1·ok, L1/L2/L4, L6, H5) | Brand stamp… |
| I1 | "Make it yours" banner (vio) until opened once (D-76) | I1: … |
| FX leak (new) | The FX layer was global and never cleared: falling coins from a moment looped on every later screen (seen on Today in release). FX now belong to the route that played them | FX belong to… |
| R1, A1, D0 | Keeper chips at the design's spots via `keeperAt(id, texts)`; A1 no double enter; D0 second card tilts 1° (the PDF and prototype keep the flat `sm` card) | same |
| B1, B4 (D-73) | Main card stacked; pending Bounties as a small tilted card (31 of 40 in · Not started · Prove) | B1: … |
| N3, N4, N5 | Signing blocks hardware back only while pending; moments only until settled (1.6 s, D-74); a join link pops back to the E1 in the stack with the new code | Routing: … |
| N7 + tests | `__tests__/routes.test.ts` (flows.md table: every edge wired and resolvable, every screen reachable from launch or its event, signing transient) and `__tests__/keeperNote.test.tsx` (tab never auto-opens, mark toggles, idle line, flow drops and closes at 4.8 s, closes on navigation, never leaks) | Tests: … |
| L-2, P-2 | `useNow` pauses while its screen is unfocused (`lib/focus.ts › useScreenFocused`, shared with the Keeper host) | Clocks pause… |

Checked on the emulator (dev build): B1 mark dot + knock, tap drops the note with the parametric bust; D2 drops the note on entry from the nav mark; + sheet slides down on back; splash sequence; F5 (parametric Keeper thumbs, stamp last); B1 stacked + Bounty card.

### Remaining
| # | P | What |
|---|---|---|
| S20 | P2 | HP damage / heal from the last-seen value (lost segments fade + ring, heal pop) and the BalanceChip count + pop on change. Needs a "last seen HP per Oath" store. |
| C1 | P2 | The PDF shows the input focused; not auto-focused, because the keyboard would cover the suggestion chips (D-77). |
| P2 rows | P2 | A2 wallet glyphs, B2 kept times + chips (D-46/48), H6 finisher icons, I2 social glyph, I3 cover, I5 row tiles, I7 row icons, I8 "Banner" label + focus, L5 "Eliminated" fixture, N1 leading tiles. |
| P-6 | P1 | Reanimated sync-props failure logging on first mounts (see §7); one ANR seen in release. |

### Next steps, in order
1. P-6 first (it can freeze the UI thread).
2. Check A1 / R1 chip spots on the emulator after the change (layout spots, copy texts).
3. S20 (HP last-seen store + BalanceChip pop), with a test.
4. The P2 rows above, group by group.
5. P-6: find which animated views update before mount / after unmount and stop it (see §7).
6. Re-shoot, compare, release perf again.

## Session 1 handoff (kept for history)

### Done
- Audit written (this file), Design.pdf cropped per screen (`apps/mobile/scripts/pdf-screens.py` → `artifacts/pdf/`), compare page has app · prototype · PDF columns. Baseline app shots: `artifacts/before/` (116/116, no errors).
- DECISIONS.md › I: Keeper placement table (inline vs mark, from the PDF) and conflicts D-70…D-73.
- Clean baseline release APK (mock mode): `artifacts/before/app-release-mock.apk`. Cold start (release, emulator): 4488 / 2675 / 2376 ms. Frame stats not yet recorded.
- **Committed in the WIP commit (not yet wired, not yet typechecked):**
  - `components/keeper/rig.ts` + `KeeperSvg.tsx`: parametric Keeper port (UI-thread frames via `useFrameCallback`, pauses on blur). `Keeper.tsx` now renders it (PNG via `png` prop).
  - `components/keeper/ScreenKeeper.tsx`: per-screen Keeper host (`useKeeperHost`, `ScreenKeeper`, `useScreenKeeper`, `keeperIsInline`, `isNoteOnlyKeeper`) implementing components.md › KeeperNote rules.
  - `KeeperUI.tsx`: KeeperMark (dot + `Knock`), KeeperNote (`NoteDrop` from the mark, origin left/right, cycle pill), KeeperPlacement (`Bubble`, orbs, chip spots).
  - `primitives/motion.tsx`: Pop (spring/springHard), Enter (+ `replay`), FadeIn, Bubble, NoteDrop, Knock, Shake, Loop (+ ping, glow, paused), CountText (leaf count-up), `flattenBlocks`. `lib/haptics.ts`. `lib/format.ts › groupDigits`.
  - `TabBar.tsx`: animated pill (flex 1↔1.7, white fill + label fade 200 ms, PressScale flex 1), PlusButton kGlow.
  - `gen-layout.mjs` → layout.gen.json now has Keeper `orbs` and `chips` spots; `app/layout.ts › keeperAt(id, chipTexts)`.
  - metrics/supplement additions (keeperNote.originX/below, keeperPlacement.inlineMin/bubbleDelay/chipFloatMs, tabBar.labelGap, orb colours).
  - `scripts/perf.mts` (release perf: cold start + gfxinfo for tabs/scroll/push). uiautomator can't go idle in release (loops), so taps fall back to coordinates; the last edit (fallback after 1 try) was not applied: change `tries >= 2` to `tries >= 1`.

### Emulator note
The emulator had animator scales at 0 (previous session's drive script), which Reanimated treats as **Reduce Motion**: motion looked absent. Reset with `adb shell settings put global {window_animation_scale,transition_animation_scale,animator_duration_scale} 1`. The dev build was replaced by the release APK; reinstall `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` (or `npx expo run:android`).

### Next steps, in order
1. `pnpm --filter @kept/mobile typecheck && lint && test`; fix the WIP (callers of `KeeperPlacement` still pass `keeperAt(...)`; `KeeperNote` no longer takes `autoHideMs`; TabScreen passes `keeper` to AppHeader).
2. Wire the Keeper host into `components/layout/Screen.tsx`: kind from `presentation(routeId)` (tab/flow; sheets don't use Screen), idle line for tabs (`keeperIdle(tab)`), render `note` absolutely at `insets.top + devnetRow + barGap + barHeight + keeperNote.below`, wrap with `Provider`. AppHeader/NavBar read `useScreenKeeper()` for the mark (`hasNew = fresh`, `onPress = toggle`; NavBar shows the mark only when `lines` is set). Delete `KeeperNoteHost` / `useUi.keeperNote` / `showKeeperNote` and the TabScreen idle-note code.
3. Replace every `<KeeperPlacement … {...keeperAt(id)} />` in screens with `<ScreenKeeper id="…" lines={keeperLines("…")} />` (A1/B3/R1 pass chip texts via `keeperAt(id, [...])`). Grep list in §1 S2.
4. Screen-enter choreography in Screen: `flattenBlocks(children)`, skip `isNoteOnlyKeeper`, wrap each in `<Enter index={i}>` (tab screens replay on focus); PinnedActions enter at 200 ms.
5. BottomSheet: animate close on `beforeRemove` (preventDefault → p→0 → dispatch action); sheet buttons with icons (S12), "+"/W2 Close as kind `s`.
6. Fix grid today off-by-one (S5): pass `dayIndex + 1` in Oaths.tsx Active (and R·act), add a test.
7. Swap `useCountUpText` in HPPanel / MoneyMoment / KeptRateRing for `CountText`; Option select tilt + Toggle 150 ms; Camera fail `Shake`; Splash sequence (S16); toast fade; SignStatus springHard.
8. Haptics per motion.md (F5, L*, J1·ok, D3, L6 comeback, proof pass/fail, signing, splash, HP damage).
9. Brand stamp as last content block (S13); B1/B4 stacked card + Bounty card (D-73); I1 "Make it yours" banner; remaining per-screen rows in §3.
10. Routing: block back while signing pending; moments block back only until settled; E1 deep link no duplicates; add `__tests__/routes.test.tsx` (every flows.md edge) and KeeperNote behaviour tests.
11. Pause `useNow(1000)` when unfocused (L-2).
12. Re-shoot (`pnpm --filter @kept/mobile shoot`, then `compare`), release build with `EXPO_PUBLIC_API_MODE=mock`, run `node scripts/perf.mts <apk> --out artifacts/perf/after.json`, fill §7, update SHAKEDOWN.md, BUILD_PLAN.md (Phase 5 motion/Keeper replaced by this pass), DECISIONS.md. Commit small, push to main (the backend dev also pushes; `git fetch` + merge first; push with `-c http.postBuffer=157286400`).
