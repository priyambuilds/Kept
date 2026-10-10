# Accessibility pass (2026-10-10)

Emulator (Pixel-class, 1080 × 2400, 420 dpi), Demo, all 117 design screens.

## What was checked, and how

| Check | How | Result |
|---|---|---|
| Every button has a name for TalkBack | Jest: `src/__tests__/a11y.test.tsx` opens all 117 screens and reads every button's label or text. Device: `node scripts/shoot.mts --dump` then `node scripts/a11y.mts` (uiautomator trees) | 0 unnamed of 714 clickables on the device; the Jest audit passes and now guards it |
| 48 dp touch targets | Jest checks fixed-size buttons with their hit slop. Since this pass, every `PressScale` sized by its content (chips, text links, short rows) measures itself and extends its hit slop to 48 dp (no visual change) | Fixed: "See all", "Mark all read" (16 dp tall), filter and segment chips (36–38 dp), short rows (40–44 dp). Header controls (Back / Close 40 dp, bell and Keeper mark 36 dp, balance chip, deck arrows) already had a `hit` size |
| Reduce Motion | Code audit of every Reanimated animation; release build with Settings › Accessibility › Remove animations (A1, A4, Today, Oaths, D2, + sheet) | Every animation already had a Reduce Motion path except the flow step bar's 400 ms colour ease (fixed). With animations removed every screen settles at once; skeletons hand over normally |
| 1.3× system font size | All 117 screens shot at `font_scale 1.3` (`artifacts/a11y-130/`, debug build). About 65 show settled content; the rest were still on their skeletons when shot (the debug build loads a dev-link screen in 6–15 s) | On the ~65 checked (onboarding, Today states, create, join, Oath screens, proof, review, Rematch, sheets): no clipped buttons, overlapping text or text running off cards; long lines wrap. On the release build at 1.3× also: I1 Profile, I4 Settings, I8 Edit profile, W1 Wallet (fine). Not checked at 1.3×: Bounty detail (H2–H7), results (L1–L6), K1–K5, I2/I3/I5 |

## Not fixed (needs a design decision)

1. **Tertiary text contrast.** `text.tertiary` `#6A6A6A` is 3.4:1 on the app background `#131313` and
   2.9–3.2:1 on surfaces `#1C1C1C` / `#222222`, under WCAG AA's 4.5:1 for small text. It's used for notes,
   captions and hints such as "Swipe for your next one". `text.secondary` `#8A8A8A`
   passes (4.6–5.4:1). Suggestion: lift tertiary to about `#808080` (4.6:1 on `#131313`), a design token change.
2. **Visual size under 48 dp.** Back / Close (40 dp), the bell and Keeper mark (36 dp), chips (36–38 dp) and
   the text links draw smaller than 48 dp; their touch areas are 48 dp through hit slop. Android doesn't let
   a hit slop reach past its parent's bounds, so a control at the very edge of a tight row can lose part of
   that area. Making them look 48 dp is a design change; I'd leave them.
3. **The DEVNET badge** (18 dp tall) is a long-press target in development builds only; in release it's
   plain text and not focusable as a button.

## Not verified
- TalkBack read-through by ear on a phone (the label checks are structural).
- 1.3× on a small phone (360 dp wide): screens were shot at 1080 × 2400 only for this pass.
