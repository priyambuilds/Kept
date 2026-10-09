# Fidelity pass: make the app match the design 1:1

Paste the prompt below into a **new Claude Code session** at the repo root.

---

```
Read CLAUDE.md, docs/SESSION_HANDOFF.md, docs/SHAKEDOWN.md, docs/DECISIONS.md, then the WHOLE design folder: design/Design.pdf (all pages), README.md, DESIGN.md, tokens.json, components.md, screens.md, flows.md, motion.md, copy.json, assets.md, and the prototype in design/reference/ (KEPT Play.dc.html, kept-kit.js, kept-screens-1…6.js, Keeper.dc.html).

The owner has used the app and says it is NOT 1:1 with the design: visuals differ, motion and transitions are missing, states aren't smooth, and some things don't work. This session is a fidelity, motion, performance and logic pass. Frontend only, as always. Commit in small steps on local main and push. Don't open PRs.

## Source of truth
- design/Design.pdf is the final visual reference. The prototype (design/reference, open it in Chromium via Playwright) is the reference for layout, behaviour and motion. The .md files are the written spec.
- Where they conflict, follow Design.pdf and the prototype, and list each conflict in docs/DECISIONS.md.

## Problems the owner reported (fix these first)
1. Tab bar: the active tab is a square white box. Per components.md › TabBar it's a pill:
   - item height 52, radius 26, the bar itself radius 32
   - active: white bg, #131313 fg, flex 1.7 with icon + label
   - inactive: icon only, flex 1
   - flex animates over 200 ms and the label fades in
   - the + button sits to the right
   Match Design.pdf exactly.
2. The Keeper takes up screen space. In the design, the Keeper normally lives in the KeeperMark (the K logo in the header and nav bar):
   - the mark **knocks** (shakes, with a light-green unread dot) when the screen has a line
   - tapping it drops the **KeeperNote** paper card
   - the line is dynamic per screen
   The app currently renders big inline Keepers between components on regular screens. Rules:
   - Go through Design.pdf screen by screen. Render an inline KeeperPlacement ONLY where Design.pdf actually shows the character in the layout (big moments). Everywhere else, use the KeeperMark + KeeperNote only.
   - Produce a table in docs/DECISIONS.md: screen id → mark only / inline, as seen in the PDF.
3. The KeeperNote stays on screen across navigation and never goes away. Implement components.md › KeeperNote behaviour exactly:
   - Tab screens never auto-open it. When there's a line, the mark shows the dot and knocks (3×) until opened. Tapping the mark toggles the note.
   - Flow screens auto-open it once on entry, auto-close it after 4800 ms, then it lives behind the mark.
   - Tapping the card closes it. The action pill cycles lines and re-arms the timer.
   - It ALWAYS closes on navigation, tab change, sheet open and back. It never appears on sheets.
   - It drops with the `note` animation (420 ms springSoft from the mark's origin).
4. Missing motion and transitions: implement design/motion.md in full (see below).
5. Things that aren't smooth or don't work: find and fix them (see the audit below).

## Step 1: audit (write docs/FIDELITY_AUDIT.md before fixing)
Use the existing tooling (dev deep link, shoot script, compare page) and extend it:
- Render every page of Design.pdf to PNG (pdftoppm or similar), and map pages to screen ids. Add them as a third column on artifacts/compare.
- For EVERY screen id, list the differences between the app and Design.pdf/prototype:
  - layout, spacing, sizes, radii, typography, color, shadows, glows, icons, copy
  - missing elements
  - Keeper placement
  - empty, loading and error states
- **Motion:** record each signature moment in the prototype (Playwright video) and in the app (`adb shell screenrecord`):
  - screen enter choreography
  - HP damage and heal
  - money count-up and coins
  - day kept, broken, payout, Rematch comeback
  - proof scan pass and fail
  - signing ring
  - toasts, sheets, tab change, option select, button press
  - KeeperMark knock and KeeperNote drop

  Compare timing and feel. List everything missing or wrong.
- **Routing:** check every edge in flows.md's route table and happy paths.
  - Every "Goes to" must be reachable, and every screen must be reachable from its "Entered from".
  - Back behaviour on each screen (hardware back and the nav back button).
  - Signing screens replace themselves; moments (L*, J1·ok, C7·ok, K5·ok, F5) have no back gesture until settled.
  - Sheets close correctly.
  - Deep links from cold and warm start.
  - The tab state is kept per tab.
  - No duplicate screens stacking up.
- **Logic flaws:** review the screens' data and state.
  - Do engine outputs match what's displayed?
  - Are balances, HP, day counts and timers consistent across Today, D2, recap and results?
  - Do mock scenarios produce states the rules allow?
  - Stale caches after actions, double submissions, timers that keep running off-screen.
  - The KeeperNote and toast hosts leaking across screens.
  - Inbox "done" state, and the drafts stores resetting correctly.
- **Performance:** in a RELEASE build (dev builds are slow and misleading):
  - frame drops on scroll and transitions (Perf Monitor / systrace)
  - JS-thread animations that should be on the UI thread
  - unnecessary re-renders (React DevTools profiler)
  - heavy lists not virtualized
  - large images and SVGs
  - startup time

  Record the numbers before and after.

Rank every finding P0 (broken or wrong) / P1 (visibly off) / P2 (polish).

## Step 2: fix systemically, then per screen
1. **Chrome first:** TabBar + PlusButton, Header, NavBar + StepBar, KeeperMark, KeeperNote host, Toast host, BottomSheet, the ambient background/glow layer. Exact per components.md and the PDF.
2. **Motion system:**
   - Build reusable Reanimated (UI-thread) primitives from motion.md: easing tokens, the keyframe library (pop, bubble, note, knock, float, scan, ping, shake, count-up, stagger helpers), screen-enter choreography and haptics.
   - Respect Reduce Motion.
   - Then apply them screen by screen exactly as motion.md specifies (delays, staggers, durations).
3. **The Keeper:**
   - Port reference/Keeper.dc.html to a parametric react-native-svg component driven by Reanimated (moods, props, anims, blink and breathing), with the PNGs as a fallback only.
   - Use the bust inside the KeeperNote and the inline placement only where the PDF shows it.
4. **Navigation:** native-stack transitions per flows.md (slide for flows, fade for moments, sheets as sheets, transient signing screens replaced). Fix every routing issue from the audit.
5. **Per-screen fixes:** work through the audit list group by group (A, B, C, D, E, F, G, H, I, J, K, L, M, N, R, W) until each screen matches the PDF.
6. **Performance fixes:** reach a steady 60 fps on scroll and transitions in release on the emulator. Use memoization, FlashList for long lists, UI-thread animations, image and SVG caching, and lazy screens.
7. **Logic fixes,** each with a test.

## Step 3: verify
- Re-shoot all screens, update artifacts/compare (app | prototype | PDF), and re-record the motion moments.
- Add automated route tests generated from flows.md (every edge), plus tests for KeeperNote behaviour (opens and closes per the rules, never leaks across navigation).
- typecheck, lint, all tests, the release bundle, and a release build on the emulator.
- Update docs/FIDELITY_AUDIT.md (fixed / remaining), SHAKEDOWN.md, BUILD_PLAN.md (this replaces most of Phase 5's motion and Keeper work) and DECISIONS.md.

Work through the whole list without stopping, committing as you go. If you run low on context, write the exact next steps into docs/FIDELITY_AUDIT.md so a fresh session can continue. At the end, give me a short summary, the compare page path, and what's left.
```

---

## Notes for the owner
- **Model:** start the audit (Step 1) with **Claude Fable 5.1**, falling back to **Opus 5.5**. Do the systemic fixes (Step 2.1–2.4) on **Opus 5.5**. The per-screen fixes (Step 2.5) can go to **Sonnet 5.5** once the chrome and motion system are right.
- **Judge smoothness on a release build, not the dev build.** Dev builds are much slower.
- This is a big job. Expect several sessions. FIDELITY_AUDIT.md is the checklist that carries progress between them.
