# Handoff: KEPT — React Native (Expo) app for the Solana Seeker

## Overview
KEPT turns habits into commitments with real stakes. You swear an **Oath** (solo or with friends), stake SKR, and prove the habit every day with two photos. Each Oath has a shared **HP bar**; misses cost you part of your stake (paid to the people who kept) and too many misses break the Oath for everyone. **Bounties** are free public challenges funded by a creator. A public **kept rate** shows how reliably someone keeps their word. **The Keeper** — a half-warden, half-bookie reaper — holds the pot, judges proof and comments at key moments.

This package documents the final, approved design: 116 screens and states (A0–W4), the full component system, tokens, motion, copy and rules, so a new Expo Android app can be built from it.

## About the design files
Everything in `reference/` is a **design reference built in HTML** (a playable prototype), not production code. Recreate it in **React Native (Expo, TypeScript)** with idiomatic libraries — don't embed the HTML. Suggested stack: React Navigation (native stack + custom tab bar), Reanimated 3, react-native-svg, expo-linear-gradient, expo-haptics, expo-camera, react-native-qrcode-svg, `@expo/vector-icons` (MaterialCommunityIcons), `@expo-google-fonts/geist` + `geist-mono`, Solana Mobile Wallet Adapter.

To open the prototype: serve the `reference/` folder (e.g. `npx serve reference`) and open `KEPT Play.dc.html`. The left rail jumps to any screen; ← → step through all; the right rail lists "From here", "Simulate an outcome" and "Leads here from" for the current screen.

## Fidelity
**High-fidelity.** Colours, type, spacing, radii, shadows, copy and motion are final. Match them exactly (1 CSS px = 1 dp at a 390×844 frame). Sample names, balances and dates are placeholders — bind real data.

## What's in the package
| File | What |
|---|---|
| `DESIGN.md` | The design system: every token explained, layout grid, elevation recipes, brand |
| `tokens.json` | Same tokens, machine-readable, same names (`color.*`, `type.*`, `space.*`, `radius.*`, `size.*`, `shadow.*`, `gradient.*`, `motion.*`, `z.*`) |
| `components.md` | Every component: purpose, props, variants, states, exact dimensions, where it's used |
| `screens.md` | Every screen ID: layout, components, all copy (with keys), actions → destinations, states, data fields, entry points |
| `flows.md` | Navigation model, route table for all 116 screens, happy paths, Mermaid diagrams per area |
| `copy.json` | Every user-facing string with stable keys + Keeper lines per screen and per moment + avatar-builder quips + toasts |
| `motion.md` | Easing tokens, keyframe library, screen choreography and the signature animations (HP damage/heal, money, day kept, broken, payout, Rematch) with haptics |
| `rules.md` | Product rules: HP, cost of each miss, distribution, fee, Rematch, review modes, proof, Bounties, kept rate — with the worked example and open decisions |
| `assets.md` + `assets/` | Keeper (37 SVG + PNG 1/2/3x + 10 animation strips), objects, gestures, coin, brand, 130+ icons |
| `reference/` | The HTML prototype and its screen definitions (`kept-screens-*.js` are the most precise spec of every block on every screen) |

## Screens / views (summary — details in `screens.md`)
- **A Onboarding:** A0 Splash · A1 Welcome · A2 Connect wallet → A2·s signing / A2·e rejected · A3 Seeker verified / A3·no not eligible · A4 Pick a look.
- **B Today (tab):** B1 active · B2 all done · B3 empty (featured Bounty) · B4 deadline close · B5 daily recap (sheet) · `+` New sheet.
- **C Create an Oath:** C1 Goal · C2 Object · C3 Length · C4 Solo/Group + stake · C5 Review mode · C6 Terms · C7 Signing (ok / rejected / failed) · C8 Invite.
- **D Oaths (tab) + detail:** D0 list · D1 open (creator / member / cancel) · D2 active (+ low HP) · D3 broken · D4 ended · D5 history.
- **E Join:** E1 enter invite · E2 preview · E2·s signing · E3 errors (code, started, joined, eligibility, SKR).
- **R Rematch:** R1 offer · R2 signing · R3 lobby · R·act active · R4 result (+ recovery lost).
- **F Daily proof:** F1·perm · F1 photo 1 · F2 checking · F2a failed · F2b unavailable · F2c expired · F3 photo 1 done · F4 photo 2 · F4·chk · F4a 3 fails (AI only / group) · F5 day kept.
- **G Group review:** G1 vote · G2 waiting · G3 approved / rejected.
- **H Bounties (tab):** H1 Discover / Joined / Created · H2 detail (+ not eligible) · H3 joined · H4 eliminated · H5 ended · H6 my created Bounty · H7 browse/search.
- **I Profiles (tab):** I1 me · I2 someone (+ how others see you, private) · I3 creator · I4 settings · I5 activity · I7 visibility · I8 edit profile · I9 avatar builder.
- **J Claim:** J1 · J1·p signing · J1·ok claimed · J1·f failed.
- **K Create a Bounty:** K1 basics · K2 pool · K3 branding · K4 requirements · K5 review & fund · K5·p · K5·ok.
- **L Results (full-screen moments):** L1 kept every day · L2 missed some · L3 broken · L4 solo kept / missed / broken · L5 Bounty survived/out · L6 Rematch kept.
- **M System:** M1 notifications (lock screen) · M2 offline · M3 not enough SOL · M4 not enough SKR.
- **N Inbox:** N1. **W Wallet:** W1 wallet · W2 add SKR · W3 swap SOL→SKR (+ signing, done) · W4 receive.

## Interactions & behaviour
- Navigation, route forms and all transitions: `flows.md`. Signing screens are transient (replace, don't push). Results (L*) are shown once per settlement.
- Toasts auto-hide after 1.9 s. Keeper note auto-hides after 4.8 s on flows; on tabs it's summoned from the Check-K mark.
- Loading: skeletons in the same geometry (rule in `screens.md`). Errors: wallet rejected → C7·no ("Nothing was charged"), tx failed → C7·fail / J1·f, offline → M2, fees → M3, balance → M4, eligibility → E3·elig / A3·no / H2·no.
- Validation: goal 1–60 chars, Bounty title required, pool > 0; disabled buttons per `components.md › Button`.
- Haptics and every animation: `motion.md`. Respect Reduce Motion.

## State management (client)
`session {wallet, seekerVerified, inviteFlag}` · `balances {skr, sol}` · `today.items[]` · `oaths{byId}` · `bounties{byId}` · `inbox[]` (with `done` set) · `drafts {oath, bounty, profile}` · `ui {toast, keeperNote, sheet}`. Field-level contracts per screen are in `screens.md › Data`. Money is computed server-side; the client shows estimates and formats them.

## Design tokens
See `tokens.json` (authoritative) and `DESIGN.md`. Core: bg `#131313`, surface `#1C1C1C`, lime `#C5F25C`, red `#F87171`, orange `#FB923C`, violet `#A78BFA`; Geist / Geist Mono; screen padding 20, block gap 14; radii 7–38 + pill; buttons 54 high.

## Assets
See `assets.md`. Icons are Material Design Icons (use `MaterialCommunityIcons`). The Keeper is best ported as a parametric `react-native-svg` component; PNGs and sprite strips are provided as a fallback. No Lottie/Rive files are included.

## Open items to confirm before building
Listed at the end of `rules.md` (solo miss damage and destination, broken-pot destination, cost cap, rounding, time zones) and at the end of `flows.md` (entry points for L-screens and system screens).

## Files
`reference/KEPT Play.dc.html` (prototype shell + renderer), `reference/kept-kit.js` (block builders + sample data), `reference/kept-screens-1…6.js` (all 116 screens), `reference/Keeper.dc.html` (mascot), `reference/Avatar.dc.html` (avatar system), `reference/KEPT Logo.dc.html` (logo sheet), `reference/support.js` (runtime needed to open the .dc.html files).

---

### Prompt for Claude Code
> Read `README.md`, then `rules.md`, `DESIGN.md`, `tokens.json`, `components.md`, `flows.md`. Scaffold an Expo (SDK latest, TypeScript) Android app. Put `tokens.json` into `src/theme/` and generate a typed theme from it; never hard-code colours or sizes. Build the components in `components.md` first (with a `DevGallery` screen showing every state), then the navigation in `flows.md`, then screens group by group in this order: A, B, F, C, D, E, J, L, R, G, H, I, K, N, W, M — using `screens.md` for layout, copy keys (`copy.json`) and data fields. Use sample data from `copy.json › sampleData` behind a mock API until the backend exists. Implement money and HP rules exactly as `rules.md` (unit-test the worked example). Compare each screen against the prototype in `reference/` before moving on.
