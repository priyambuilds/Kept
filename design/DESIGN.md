# KEPT — Design system (final)

Source of truth: `reference/KEPT Play.dc.html` (the playable prototype, 116 screens). Every value below is lifted from it. Token names match `tokens.json` exactly (e.g. `color.lime.base`, `type.title`, `radius.card`).

Units: the prototype is drawn at 390×844 CSS px. Treat 1 px = 1 dp on Android. Use `PixelRatio`/`useWindowDimensions` only for full-bleed decor; all component sizes are fixed dp.

Platform: React Native (Expo), Android, Solana Seeker. Dark only.

---

## 1. Principles that the tokens encode

1. **Near-black canvas, one action colour.** Lime `#C5F25C` means "do this / you're safe / money in". Red `#F87171` means loss. Orange `#FB923C` means warning or Rematch. Violet `#A78BFA` means review or "in progress". Nothing else carries meaning.
2. **Tactile, not glassy.** Raised things use a 1.5 dp top highlight + a 3 dp bottom shade (the "3D tile"). No glassmorphism, no blur on surfaces.
3. **One primary action per screen**, pinned at the bottom (`PinnedActions`) or on the hero card.
4. **The Keeper is the voice, the Check-K is the brand.** He appears at most once per screen.
5. **Motion is spring-y and short** (300–600 ms); ambient loops are slow (5–19 s) and low-contrast.

---

## 2. Colour

### 2.1 Backgrounds & surfaces
| Token | Value | Use |
|---|---|---|
| `color.bg.app` | `#131313` | Every screen background |
| `color.bg.outer` | `#0B0B0C` | Splash outside safe area / system nav bar |
| `color.bg.lock` | `#1E1E26 → #0B0B0E` (180°) | Lock-screen mock (M1) |
| `color.surface.1` | `#1C1C1C` | Panels, rows, sheets, inputs, segmented track |
| `color.surface.2` | `#222222` | Header buttons, secondary button bg, nav back |
| `color.surface.3` | `#262626` | Profile action chips, selected avatar option |
| `color.surface.4` | `#2A2A2A` | Neutral chips, icon tile fallback, empty cells |
| `color.surface.sunken` | `#161616` | Open seat |
| `color.surface.cardTop/Bottom` | `#272727 → #1D1D1D` (180°) | Hero card fill |
| `color.surface.stack1/2` | `#1D1D1D` / `#1A1A1A` | The two "cards behind" a stacked hero card |
| `color.scrim` | `rgba(0,0,0,0.62)` | Behind sheets |

### 2.2 Lines
`line.hairline` 0.05 · `line.hairline2` 0.06 · `line.hairline3` 0.08 · `line.strong` 0.10 (all white alpha). Always drawn as a 1 dp **inner** border (RN: `borderWidth: 1` with `borderColor`; the prototype uses inset box-shadow so nothing shifts layout — keep the same outer size).

### 2.3 Text
`text.primary #FFFFFF` · `text.paper #F2F0EA` (Keeper note card bg, ink-on-paper moments) · `text.soft #D4D4D4` (bio) · `text.muted #BDBDBD` (nav title, avatar labels) · `text.secondary #8A8A8A` (subtitles, meta) · `text.tertiary #6A6A6A` (mono labels, notes, chevrons) · `text.quaternary #4A4A4A` (version line) · `text.ghost #3A3A3A` (title under a sheet) · `text.onLime #131313` · `text.onLimeDeep #1A2600` (on lime money pill / pops).

### 2.4 Semantic accents
| Family | Base | Tints used | Meaning |
|---|---|---|---|
| Lime | `#C5F25C` | hi `#DAFF80`, lo `#B4E53F`, lo2 `#B0E03C`, deep `#8FB52E`, shadow `#5E7A14`, edge `#7FA02A`; alpha .07/.10/.14/.20/.45 | Primary action, kept, money in, brand |
| Red | `#F87171` | .12/.14/.16/.22 | Missed, money lost, destructive, HP ≤ 20 |
| Orange | `#FB923C` | .13/.16/.25, soft `#FDBA74` | Deadline, HP 21–40, Rematch, devnet badge |
| Violet | `#A78BFA` | .13/.16/.20/.25 | Group review, photo 1 done |
| Sky | `#38BDF8` | — | Ambient only (Bounties, Join) |

### 2.5 People colours (`color.member`)
You `#C5F25C` · Riya `#F9A8D4` · Arjun `#FDE68A` · Dev `#93C5FD`. Used as avatar fallback fill and grid row chip. Real users get their avatar background colour (see Avatar).

### 2.6 Object / icon tile palette (`color.tilePalette`)
Each entry is `[start, end, ink]`, linear 150°. Mapping in `color.objectTile`: dumbbell→lime, book→vio, water bottle→sky, guitar→amber, running shoe→pink, plant→lime, skipping rope→pink, yoga mat→vio, sword-cross (Rematch)→orange, trophy→lime, sack→lime. Anything unmapped → white.

### 2.7 HP colour
20 segments, 5 HP each. Filled segment colour:
- HP > 40: gradient across the bar, segment `i` (0–19) = `rgb(94+103·t, 234+8·t, 212−120·t)` with `t = i/19` (teal `#5EEAD4` → lime `#C5F25C`).
- 21–40: all filled `#FB923C`. ≤ 20: all filled `#F87171`.
- Empty: `#2E2E2E` on cards, `#262626` on the HP panel.
- Lost-today segments: empty fill + 1.5 dp inner ring `#F87171`, pulsing (`beat`).

### 2.8 Ambient light (per screen)
Two blurred radial orbs (420 dp and 380 dp, `closest-side` radial to transparent) drifting slowly behind content; colours in `color.ambient`. Top-anchored (left −120/top −160 and right −140/top 20) except `ember` which sits at the bottom (top 560 / 420). Default by screen group: A lime, C vio, K vio, H sky, E sky; a screen's `tone` overrides. A full-screen `toneWash` (`color.toneWash`) is layered under it. Optional **beam** (Welcome, Day kept, Results): white trapezoid light from the top, blur 14, opacity pulsing .7↔1 over 5 s.

### 2.9 Decor icons
Some screens show 2–3 huge outline icons (`#1E1E1E`, 70–130 dp, rotated ±8–14°) behind content (e.g. Welcome: sack + cards). Positions: `{x:-26,y:120,s:130,r:-14}`, `{x:290,y:420,s:96,r:12}`, `{x:30,y:660,s:70,r:8}`.

---

## 3. Typography

Fonts: **Geist** (400–900) and **Geist Mono** (500, 600). Expo: `@expo-google-fonts/geist`, `@expo-google-fonts/geist-mono`. Default letter-spacing for sans text is −0.2 dp. Numbers that change use tabular figures (`fontVariant: ['tabular-nums']`).

| Token | Size / LH | Weight | Tracking | Notes |
|---|---|---|---|---|
| `type.displayLg` | 72/72 | 700 | −2.5 | Claim amount |
| `type.display` | 56/56 | 700 | −2.5 | Money moments, balances (fs varies 40–64 per screen; spec in screens.md) |
| `type.lockClock` | 84/92 | 600 | −4 | M1 only |
| `type.titleXl` | 40/44 | 600 | −1.8 | Any title ≥ 40 uses −1.8 |
| `type.title` | 30/33 | 600 | −1.1 | Default screen title (balanced wrap) |
| `type.titleSm` | 26/29 | 600 | −1.1 | Sheet titles |
| `type.headerTitle` | 28/34 | 700 | −1 | Tab screen header |
| `type.hpNumber` | 36/40 | 700 | −1.5 | HP panel |
| `type.ringValue` | 32/36 | 700 | −1.5 | Kept-rate ring |
| `type.coverMsg` | 22/26 | 700 | −0.7 | Bounty cover message |
| `type.profileName` | 22/28 | 700 | −0.7 | |
| `type.cardName` | 17/22 | 600 | −0.2 | |
| `type.cardLine` | 16/22 | 500 | −0.2 | |
| `type.button` | 16/20 | 600 | −0.2 | Pinned + card buttons |
| `type.buttonSm` | 15/20 | 600 | −0.2 | Inline button rows |
| `type.body` | 15/22 | 400 | −0.2 | Title subtitle, `#8A8A8A` |
| `type.rowTitle` | 15/20 | 600 | −0.2 | |
| `type.keeperNote` | 15/19 | 600 | −0.2 | Keeper note card |
| `type.keeperLine` | 14/18 | 600 | −0.2 | Speech bubble |
| `type.chipMd` / `type.tab` | 13/16 | 600 | −0.2 | |
| `type.chip` | 12/16 | 600 | −0.2 | Tags, chips |
| `type.caption` | 12/16 | 400 | −0.2 | Meta lines `#8A8A8A` |
| `type.note` | 12/17 | 400 | −0.2 | Footnotes `#6A6A6A`, centred |
| `type.monoLabel` | 11/14 mono | 600 | +1.4 | Section labels, UPPERCASE, `#6A6A6A` |
| `type.monoValue` | 12/16 mono | 600 | 0 | HP "90 / 100", handles |
| `type.monoCode` | 20/24 mono | 600 | +0.5 | Invite code |
| `type.monoMicro` | 10/12 mono | 600 | +0.8 | Day numbers, stamps, slot status |
| `type.devnet` | 9/12 mono | 600 | +0.8 | DEVNET badge |
| `type.wordmark` / `wordmarkSm` | 44 / 30 | 900 | −2 / −1.4 | "KEPT" |

Inline mono: body text may contain `<m>…</m>` spans rendered in Geist Mono `#FFFFFF` (or `#F87171` for `<m class="r">`), e.g. "2 of 3 left · resets in **09:18:42**".

---

## 4. Spacing & layout

- Screen horizontal padding `space.screenX` = **20**. Blocks in the scroll column are separated by `space.blockGap` = **14**.
- Status bar 48 high (time + DEVNET badge + system icons, 30 dp side padding).
- Header row (tab screens) at **y 56**, 42 high: Check-K button 36 · title · spacer · balance chip · bell (+ optional extra button). Content starts at **108**.
- Nav row (flows) at **y 56**, 42 high: back/close 40 · centred title or step bar · right label + optional Keeper mark. Content starts at **110**.
- Plain screens start content at 58; lock screen at 74.
- Pinned actions: `left/right 20, bottom 34`, gap 6. Content bottom inset = `34 + Σ(button heights) + 6·(n−1) + 14`.
- Tab bar: `left 20, right 96, bottom 28`, 64 high; `+` button 64 round at `right 20, bottom 28`. Content bottom inset 104. A 120 dp fade (`gradient.tabFade`) sits under it.
- Sheets: inset 8 from left/right/bottom, radius 38, padding 12/20/22, max height 780, grabber 36×5 `rgba(255,255,255,.25)`.

Spacing scale (`space.*`): 2, 4, 5, 6, 8, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 34.

## 5. Radii
`xs 2` (card HP segment) · `seg 4` (panel HP segment) · `cell 7` (grid cell 7-day; 5 for 14-day) · `sm 9` · `tile 12` (40 icon tile) · `md 14` (44 tile, warn strip) · `chip 15` · `lg 18` (rows) · `xl 20` (options, banners, inbox items) · `input 22` · `panel 24` · `card 26` · `hero 28` (profile) · `cam 30` · `sheet 38` · `phone 48` · `pill` (height/2 for every button, chip, tab).

## 6. Elevation & materials
See `tokens.json › shadow`. Android mapping: use `elevation` for the drop part and draw the inset highlight/shade as absolutely-positioned 1.5 dp / 3 dp Views (or `react-native-shadow-2` if you prefer one primitive). Named recipes:

- **card**: 1 dp hairline + `0 24 40 rgba(0,0,0,.45)`; plus a sheen overlay `linear 115° rgba(255,255,255,.07) → 0 at 38%`.
- **tile3d** (icon tiles, avatars, slots): top highlight `rgba(255,255,255,.6)` 1.5 dp, bottom shade `rgba(0,0,0,.18)` 3 dp, drop `0 6 14 rgba(0,0,0,.35)`, rotated −4°.
- **buttonLime / buttonPrimary**: see Button.
- **moneyPill**: lime gradient + 3 dp top highlight + 6 dp bottom shade + lime glow `0 22 50 rgba(197,242,92,.28)`, rotated −3°.
- **coin**: radial `#F4FFD0 → #C5F25C 52% → #8FB52E`, inner ring 3 dp white .25, 3 dp hard drop `#5E7A14`.
- Blur is only used for: the beam (14), the Keeper floor shadow (9) and the review photo (1.2). No surface blur.

## 7. Motion
All keyframes, durations and easings are in `motion.md` and `tokens.json › motion`. Defaults: element entrance = `enter` 500 ms `cubic-bezier(.2,.8,.2,1)` translateY 16→0, scale .98→1, opacity 0→1, staggered 65 ms per block from 40 ms. Pops use `spring` `(.3,1.5,.5,1)`. Reduce Motion → jump to end state.

## 8. Iconography
Material Design Icons (Pictogrammers, Apache-2.0). In RN use `MaterialCommunityIcons` from `@expo/vector-icons` — names are identical to the prototype's `mdi-*` classes. SVG copies of every icon used are in `assets/icons/`. Sizes used: 13, 14, 15, 16, 17, 19, 20, 21, 22, 26, 28, 30, 32, 60, 92, 124.

## 9. Components
Full spec in `components.md`. Inventory: StatusBar, AppHeader, NavBar(+StepBar), TabBar, PlusButton, KeeperMark, KeeperNote, KeeperPlacement, Button (5 kinds), Title, BodyText, OathCard, Row/RowList, Toggle, HPPanel, HPBar(mini), DayMemberGrid, MoneyMoment, ProofCamera, Shutter, OptionGrid (5 modes), SentenceInput, Segmented, QRCard, Breakdown, Banner, SeatSlots, BountyCover, ChipRow/Chip/OddsChip, BalanceChip, SignStatus, BarChart, Note, KeptRateRing, IdentityRow, DayStrip, UploadBox, SearchBar, HScroller, InboxList, ProfileCard, AvatarBuilder, Avatar, BrandMark/Brand blocks, BottomSheet, Toast, FX layer (coins, embers, pops), HoldToConfirm.

## 10. Brand
Check-K mark: three round-capped strokes in a 100×100 box: stem `M23 24V76`, check `M23 44L40 60L78 24`, leg `M54 45L78 76`, stroke 15 (16–18 when ≤ 32 dp). On dark: stem + leg `#F2F0EA`, check `#C5F25C`. On lime: all `#131313`. Files: `assets/brand/`.
