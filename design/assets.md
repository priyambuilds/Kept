# Assets

Everything under `assets/`. Naming is `<family>-<name>[-variant].<ext>`. Raster files use `-2x` / `-3x` suffixes because the export tool can't write `@`; **rename `-2x.png` → `@2x.png` and `-3x.png` → `@3x.png` when you drop them into the Expo project** so Metro picks the right density (e.g. `keeper-happy.png`, `keeper-happy@2x.png`, `keeper-happy@3x.png`).

## Brand — `assets/brand/`
| File | Use |
|---|---|
| `kept-mark-dark.svg` (+ png 1/2/3x) | Check-K on dark: stem + leg `#F2F0EA`, check `#C5F25C`, stroke 15 |
| `kept-mark-small.svg` | Same, stroke 18, for ≤ 32 dp (header KeeperMark uses stroke 16 at 25 dp) |
| `kept-mark-ink.svg` | All `#131313`, for lime tiles |
| `kept-wordmark-dark.svg` | Check-K + "EPT" (Geist 900). Convert text to outlines before shipping if you use it outside the app |
| `kept-app-icon.svg` / `.png` (512) | Store / launcher icon: lime tile (`#DAFF80 → #B4E53F`) + ink mark |
| `kept-app-icon-foreground.svg` | Android adaptive-icon foreground (432 canvas, 66 % safe zone); background colour `#C5F25C` |

## Keeper — `assets/keeper/`
- `svg/` — 37 vector files (viewBox `-16 -16 192 212`, i.e. the 160×180 character with 16 dp padding for raised hands; busts use `28 4 104 104`).
  - Moods (full body): `keeper-{neutral|smug|happy|wink|stern|soft|bored|side|shocked|shades}.svg`. (The design's default look wears the shades on the hood; `neutral` is the resting face.)
  - Busts (notifications, Keeper note, inbox, seats): `keeper-bust-{mood}.svg`.
  - With props (the mood each prop is used with in the app): `keeper-happy-seal`, `keeper-side-ledger`, `keeper-neutral-lens`, `keeper-smug-coin`, `keeper-shades-sack`, `keeper-bored-cup`, `keeper-side-whisper`, `keeper-stern-scythe`.
  - Key poses (frame at t = 0.6 s of each animation): `keeper-pose-{wave|point|tap|thumbs|jump|shrug|flip|peek|popin}.svg`.
  - Name aliases if you prefer moment names: cheer → `keeper-pose-thumbs`, payout → `keeper-shades-sack` / `keeper-pose-jump`, warn → `keeper-pose-tap`, burn → `keeper-stern-scythe`, gossip → `keeper-side-whisper`, judge → `keeper-neutral-lens`, comfort → `keeper-pose-shrug`.
- `png/` — every SVG above at 1x / 2x / 3x, transparent background.
- `anim/keeper-anim-{idle|wave|point|tap|thumbs|jump|shrug|flip|peek|popin}-strip.png` — 24-frame horizontal sprite strips, 192×212 per frame, **12 fps**, transparent; timing in `anim/strips.json`. Mood per strip is listed there.
- `keeper-contact-sheet.png` — overview of all full-body exports.
- **Lottie / Rive: not included.** The character is parametric (eye/mouth paths, blink, tilt and hand poses are computed per frame in `reference/Keeper.dc.html`). Two ways to ship it:
  1. **Recommended:** port the logic class to `react-native-svg` and drive `t` with Reanimated `useFrameCallback` — every mood × prop × anim, any size, crisp. The template is plain SVG with ~76 bound attributes.
  2. Interim: play the PNG strips with a sprite component (Reanimated `translateX` over the strip at 12 fps), or rebuild the rig in Rive from the layered SVGs (groups: shadow, scythe, body/cloak, sleeves, head (tilt), ace card, hood, skull, eyes, mouth, visor, shades, hands).
- Interactive props `coin`/`flip` render the lime coin; scythe is drawn behind the body.

## Objects — `assets/objects/`
The 8 proof objects as the app renders them: 3D icon tile (40×40, radius 12, palette gradient 150°, 1.5 dp top highlight, 3 dp bottom shade, ink glyph).
`object-dumbbell`, `object-book`, `object-water-bottle`, `object-guitar`, `object-running-shoe`, `object-plant`, `object-skipping-rope`, `object-yoga-mat` — `.svg` + png 1/2/3x. Plain white glyphs (24×24): `object-*-glyph.svg`. Palette per object in `tokens.json › color.objectTile`.

## Gestures — `assets/gestures/`
`gesture-thumbs-up`, `gesture-victory-sign`, `gesture-open-palm` — the white 62 dp camera badge with the ink glyph (`.svg` + png 1/2/3x), plus `*-glyph.svg` (24×24).

## Money — `assets/money/`
`coin-skr.svg` (+ png 1/2/3x): the lime coin used in the coin burst / falling coins (radial `#F4FFD0 → #C5F25C → #8FB52E`, 3 dp hard drop `#5E7A14`).

## Icons — `assets/icons/`
`icon-<mdi-name>.svg` — every Material Design Icon used by the prototype (24×24, single path, `currentColor`-free: set `fill` when importing). In code, prefer `MaterialCommunityIcons` from `@expo/vector-icons` with the same names; the SVGs are for anything outside the icon font (notifications, widgets, store art). License: Pictogrammers MDI, Apache 2.0.

## 3D renders
There are **no rendered 3D images** in the final design. All "3D" is drawn: gradient tiles with highlight/shade insets, coin gradients, drop shadows (see `DESIGN.md › Elevation`). The PNGs above are transparent and can stand in where a bitmap is easier (widgets, notifications, share cards).

## Avatar system
User avatars are generated from an 8-digit config (base, skin, eyes, hat, fit, fit colour, extra, background). Source: `reference/Avatar.dc.html`; palettes `AVC` in `reference/kept-kit.js`. Port as an SVG component; no bitmap exports needed.

## Fonts
Geist 400–900, Geist Mono 500/600 — `@expo-google-fonts/geist`, `@expo-google-fonts/geist-mono` (SIL OFL).
