# Components

Every reusable component in the final prototype, with exact values. Names map to the prototype's block kinds (`k: 'card'` etc.) so you can trace any screen back to `reference/kept-screens-*.js` and the renderer in `reference/KEPT Play.dc.html`.

States legend: **default · pressed · disabled · loading · error**. "pressed" is `scale(0.98)` for buttons and `scale(0.92–0.95)` for round icon buttons unless stated. Hit area is never below 44 dp (pad invisibly if needed).

Shared types:
```ts
type Route = string;            // screen id, e.g. 'D2'; see flows.md for special forms
type Tone = 'lime'|'red'|'vio'|'ora'|'grey'|'g'|'dark'|'white';
type IconName = string;         // MaterialCommunityIcons name
type MemberKey = string;        // member id
```

---

## Chrome

### StatusBar
48 dp. Left: time `type.statusBar`; then **DevnetBadge** (18 h, padding 0/6, radius 5, `devnetBadge` colours, `type.devnet`, text "DEVNET") — shown only on devnet. Right: system icons (use the real Android status bar; keep the badge as an overlay row under it).
Screens: all.

### AppHeader (tab screens)
Row at y 56, h 42, gap 8.
- **KeeperMark** 36×36, radius 12, `surface.2`, 1 dp `line.hairline2`; contains Check-K 25 dp (stroke 16). Unread dot 11 dp lime at top-right −3/−3 with 2.5 dp `bg.app` ring. When the Keeper has a new line for this screen the mark plays `knock` (2.6 s, 3×, delay .8 s, transform-origin 50% 90%). Tap → opens **KeeperNote**.
- Title `type.headerTitle`, margin-left 2.
- **BalanceChip**: 36 h, padding 0/11/0/9, radius 18, `surface.2` + hairline; `sack` icon 17 lime, amount 14/600, `plus-circle` 15 `#6A6A6A`. Tap → W1 (Wallet).
- **Bell**: 36 round `surface.2` + hairline, `bell-outline` 19. Count badge: min 19×19, radius 10, lime bg, `#131313` 11/700, 2.5 dp `bg.app` ring, top/right −4, pops in (`pop` 400 ms springHard). Hidden at 0. Tap → N1.
- Optional extra button 34 round `surface.2` (e.g. Profile → settings `cog-outline` → I4).
Props: `title, balance:number, unreadCount:number, keeper:{hasNew:boolean}, extra?:{icon, to}`.
Screens: B1–B4, D0, H1, H1·j, H1·c, I1.

### NavBar (flow screens)
Row at y 56, h 42, gap 12. Back button 40 round `surface.2`, icon 22 (`chevron-left`, or `close` for modal flows). Centre: either title 14/600 `#BDBDBD` (ellipsis) or **StepBar**. Right: mono label 11/600 `#8A8A8A` min-width 40 (e.g. "Day 3/7", "2/6") + optional KeeperMark (same as header, only when the screen has a Keeper line).
**StepBar**: n segments, flex 1, height 5, radius 3, gap 4. Done `#FFFFFF`, current `#C5F25C` with glow `0 0 12 rgba(197,242,92,.6)`, upcoming `#2E2E2E`; colour transition 400 ms. Right label auto = "k/n".
Props: `title?, steps?:[current,total], right?, close?:boolean, keeper?`.

### TabBar + PlusButton
TabBar: `left 20, right 96, bottom 28`, h 64, radius 32, `surface.1`, shadow `tabBar`, padding 6, gap 2. 4 items: Today `white-balance-sunny`, Oaths `cards-outline`, Bounties `trophy-outline`, Profile `account-circle-outline`. Item h 52, radius 26. Active: bg `#FFFFFF`, fg `#131313`, flex 1.7, shows icon + label (`type.tab`); inactive: transparent, fg `#8A8A8A`, flex 1, icon only. Flex animates 200 ms.
PlusButton: 64 round lime, shadow `plus`, icon `plus` 30 `#131313`, ambient `glow` loop 2.6 s (lime ring 0→9 dp at .14). Pressed scale .95. Tap → `+` sheet.
Fade: 120 dp gradient under the bar (`gradient.tabFade`).
Screens: all `tab:` screens.

### BottomSheet
Inset 8 left/right/bottom, radius 38, `surface.1`, padding 12/20/22, max-height 780, scroll inside. Grabber 36×5 radius 3 `rgba(255,255,255,.25)`, centred. Scrim `rgba(0,0,0,.62)` over a dimmed placeholder of the parent screen (title in `text.ghost`). Content is the same block system. Pinned actions are rendered inline (no pin) in sheets.
Open: slide up + fade 300 ms `enter`. Close: tap scrim, swipe down, or a "Close/Not now" button (route `<`).
Screens: B5, `+`, D1·x, M3, M4 (and any `sheet:` screen).

### Toast
Top 58, centred, h 44, padding 0/18/0/8, radius 22, white bg, `#131313` 14/600, shadow `toast`. Leading 30 round `#131313` disc with `check-bold` 17 lime. Pops in (`pop` 400 ms springHard), auto-hides after **1900 ms**. Triggered by routes `toast:<text>` and by `do:` routes with a message.

### FX layer
Full-screen, pointer-events none, z 50, keyed per navigation so it replays on entry.
- **coins**: 14 burst coins (24 dp) from (183,430) fanning upward (angles −90° ± 13° steps, distance 260–440), `burst` 1.3 s burst-easing, 25 ms stagger; then 12 falling coins (20/26/32 dp) looping `fall` 2.8–4.6 s linear, delay 1.2–4.2 s.
- **embers**: 22 particles 4/6/8 dp, `#FB923C` (2 of 3, with 8 dp orange glow) or `#6A6A6A`, rising from the bottom, `rise` 3–5.1 s ease-out, staggered.
- **pops**: up to 3 lime "value pills" (h 42, padding 0/17/0/11, radius 21, `gradient.moneyPill`, `#1A2600` 16/700, icon 17) at (34,500), (206,450), (120,580), rotated ±4°, `kUp` 2.8 s, delays .6/1.1/1.6 s.
Screens: B2, C7·ok, F5, G3, H5, J1·ok, K5·ok, L1, L2, L4, L6 (coins); D3, L3, L4·b (embers).

---

## Keeper (mascot)

### Keeper (character)
Vector character, base viewBox 160×180 (bust: `28 4 104 104`). Props: `mood: neutral|smug|happy|wink|stern|soft|bored|side|shocked|shades`, `prop: none|seal|ledger|lens|coin|sack|cup|whisper|scythe`, `anim: idle|none|peek|popin|flip|wave|point|tap|thumbs|jump|shrug`, `size` (width dp; height = size×1.125), `bust:boolean`, `animate:boolean`. Exports per mood/prop/anim in `assets/keeper/`; parametric source in `reference/Keeper.dc.html` (the logic class computes eye/mouth paths, tilt and hand poses per frame from `t` seconds — port it 1:1 to `react-native-svg` + Reanimated `useFrameCallback` if you want the live version).

### KeeperPlacement (`kp` block)
In-content placement for big moments (size ≥ 120). Props: `mood, line, prop, anim, size=120, side:'l'|'r'|'c', h, chips?, orbs?, lines?:string[]`.
Layout inside a 350 dp wide column: Keeper at x = 0 (l), 350−size (r) or centred (c); bottom-aligned (ky = h − size·1.14 − 2).
- Floor shadow: ellipse w = size·.7, h 22, `rgba(0,0,0,.6)` blur 9, at y = h − 22.
- Mood glow: radial `closest-side` circle, diameter size·1.55, colour `color.keeperGlow[mood]`, centred on the Keeper chest.
- Speech bubble: white, `#131313` `type.keeperLine`, padding 10/13, radius `17 17 17 4` (left/centre) or `17 17 4 17` (right), rotated −3° (left) / +2° (right), shadow `float`; positioned beside the head (side l/r: starts at size−6 dp; max-width 350−size−2) or above (c: max-width 176). Enters with `bubble` 500 ms springHard, delay 450 ms.
- Floating chips (`chips`): Chip (30 h) at absolute x/y with rotation, `float` 4.5 s loop, staggered .7 s.
- Orbs (`orbs`): floating 3D object tiles/coins (size 28–50), `float` 5–7 s.
- `lines`: tapping the Keeper cycles through variants; the bubble then shows a mono hint "tap ›" (10/600 `#8A8A8A`).
Screens: A1, A2·e, B2, B3, C7·no, E3·*, F2, F2a, F2b, F4a, F5, G1, G3·no, H3, H4, J1·ok, L1–L6, M2, R1, R·act, and more (see screens.md).

### KeeperNote (drop-down)
Replaces small placements (size < 120) on full screens. A paper card that drops from the KeeperMark.
`left/right 14, top 106 (header) | 104 (nav)`, padding 9/12/9/9, radius 24, bg `#F2F0EA`, fg `#131313`, shadow `note`, z 45. Left: 58×58 tile radius 18 with `material.keeperNoteTile` and the Keeper **bust** (size 58, mood from the line). Middle: eyebrow (Check-K ink 12 dp + "THE KEEPER", mono 10/600 +1.2 `#6A6A6A`) and the line `type.keeperNote`. Right (optional): action pill h 34, padding 0/12, radius 17, `#131313` bg, lime 12/600 text (e.g. "tap ›" to cycle lines).
Animation: `note` 420 ms springSoft from translateY −16, scale .72, opacity 0; transform-origin at the mark (30 dp from the left for headers, 30 dp from the right for nav).
Behaviour:
- Tab screens: never auto-opens. If the screen has a line → mark shows the dot + knock until opened. Tap mark toggles. If no screen line, tapping shows the tab's idle line (`copy.keeper.idle.<tab>`).
- Flow screens: auto-opens once on entry, auto-closes after **4800 ms**, then lives behind the nav mark.
- Tap the card → close. Tap the action → cycle line / perform the action, timer re-arms.
- Not used on sheets (sheets keep inline placements).

---

## Actions

### Button
Height 54 (kind `t`: 44; inside OathCard: 50), radius = height/2, label `type.button` (inline button rows: `type.buttonSm`), optional leading icon 19, gap 8, no wrap. All solid buttons carry a **shine** sweep (40 % wide white gradient, `shine` 3.4 s loop, delay 1 s) on pinned/card buttons.
| kind | bg | fg | shadow |
|---|---|---|---|
| `p` primary | `gradient.buttonPrimary` (#FFF→#E9E9E9) | `#131313` | `buttonPrimary` |
| `l` lime (money / commit) | `gradient.buttonLime` (#DAFF80→#B4E53F) | `#131313` | `buttonLime` |
| `s` secondary | `#222222` | `#FFFFFF` | 1 dp inner `line.hairline3` |
| `t` text | transparent | `#8A8A8A` | none |
| `d` destructive | `rgba(248,113,113,.14)` | `#F87171` | none |
States: pressed scale .98 · disabled: bg `#222`, fg `#5A5A5A`, no shine, not tappable (e.g. H2·no "Join free") · loading: label replaced by spinner (`loading` icon spinning 1.1 s) — only used where a signature is pending; the prototype instead routes to a SignStatus screen · error: shown by the screen (Banner red), not the button.
**PinnedActions**: column of Buttons, left/right 20, bottom 34, gap 6, enters with the screen (500 ms, delay 200 ms).
**ButtonRow** (`btns`): row or column of Buttons, gap 8, each flex 1.
**RowButton**: h 36, padding 0/14–16, radius 18, 13/600 — inside rows and inbox items; uses the same kinds.

### HoldToConfirm (optional — not in the final playable flow)
The final flow confirms stakes, claims and funding with the **wallet signature** (SignStatus screens), so no hold gesture is required. If you add one before the wallet prompt (as in the approved onboarding round), use: 140 dp round button, 4 dp ring track `rgba(255,255,255,.14)`, lime progress stroke, fingerprint icon 56; hold **2000 ms** to complete; haptic `impactLight` at 25/50/75 %, `notificationSuccess` at 100 %; release early → ring drains at 2.5× speed; label "PRESS AND HOLD" → "HOLD · n%" (mono 11 +2) → done state lime fill with `check-bold`.

---

## Content blocks

### Title (`t`)
Props: `h, sub?, fs=30, al='left'|'center', pt=8, ls?, hc='#FFFFFF'`. Heading weight 600, line-height 1.1, letter-spacing −1.1 (−1.8 when fs ≥ 40), balanced wrap, `\n` respected. Sub: margin-top 8, `type.body`.

### BodyText (`tx`)
15/21 `#8A8A8A` with inline `<m>` mono spans (white or red). Mono variant (`mono:1`): `type.monoLabel`, margin-top 4 — used as section labels ("ACTIVE · 2").

### Note
Centred row, icon 14 + text `type.note` (`#6A6A6A`), padding 0/12. Default icon `information-outline`.

### Banner (`ban`)
Row, padding 14, radius 20, gap 12. Icon tile 38×38 radius 12. Title 15/600, sub 13/18 `#BDBDBD`. Colours `color.bannerTone[tone]` ([bg, tile]). Optional chevron when tappable.
Screens: D2 (review request), D1·m, R4, G-series, H2, C3, etc.

### Chip / ChipRow (`chips`) and **OddsChip**
Chip: h 30, padding 0/11/0/9, radius 15, 12/600, icon 14, gap 5, optional rotation (−2…+2°). Colours `color.chipTone`. Tag (inside cards): h 24, padding 0/9/0/7, radius 12, icon 13.
**OddsChip** = Chip with icon `cards-playing-outline`, text "<Name> <a>-to-<b>" (e.g. "Riya 1-to-9", "Arjun 3-to-1 to miss"). Tone `g` when likely to keep, `ora` when likely to miss, `vio` for "in review". Shown on D2 under the grid. Odds come from `member.odds` (see rules.md › Odds — display only).

### BalanceChip
Header version above. Card tag version: Tag `['1,043 SKR','sack','lime']`.

### OathCard (`card`)
Props: `ic, name, meta, to?, line?, tags?:[text,icon,tone][], hp?:number, warn?:string, btn?:Button, fl?:[text, memberKey], stack?:boolean, tilt?:deg, mt?, sm?:boolean, lime?:boolean, dim?:boolean`.
- Container radius 26, padding 16. Default fill `gradient.card` + shadow `card` + sheen overlay, ambient `breath` loop (translateY 0→−4, 7 s). `sm`: `surface.1` + hairline, no breath. `lime`: `lime.tint07` + 1.5 dp `lime.ring45` ring. `dim`: opacity .55.
- `stack`: two cards peek behind (left/right 11 → top −10, `#1D1D1D`, radius 25; left/right 22 → top −20, `#1A1A1A`, radius 24), each 60 high with hairline.
- Header row (tappable when `to`): 3D icon tile 40, radius 12, `tilePalette` gradient, icon 22, rotated −4°; name `type.cardName`; meta `type.caption`; chevron when tappable.
- `line`: margin-top 12, `type.cardLine`.
- Tags: margin-top 10 (12 without line), wrap, gap 6.
- HP: margin-top 12; row "Oath HP" 12 `#8A8A8A` · "90 / 100" mono (red when ≤ 20); HPBar mini.
- `warn`: margin-top 12, padding 10/12, radius 14, `red.tint12`, `#F87171` 13/600 + `alert` icon. e.g. "Miss today: −333 SKR · Oath −20 HP".
- `btn`: Button h 50 margin-top 12.
- `fl` (friend float): white pill h 34 at top −22 right 14, rotated 4°, avatar tile 26 (member colour, initial 11/700) + text 13/600; enters `bubbleR` 550 ms delay 600 ms. e.g. "Riya kept 07:12".
Screens: B1, B4, D0, D3, H1·j, H3, E2, etc.

### HPBar (mini) and HPPanel (`hp`)
HPBar mini: 20 segments, gap 2, h 8, radius 2. Fill rules in DESIGN §2.7. Segments pop in left→right (`segPop` 300 ms spring, 300 ms + 22 ms·i).
HPPanel: padding 16, radius 24, `surface.1` + hairline. Row: "OATH HP" monoLabel `#8A8A8A` · spacer · value `type.hpNumber` (white; red ≤ 20) counting up 900 ms ease-out-cubic · "/ 100" 14 `#6A6A6A`. Bar: 20 segments, gap 3, h 18, radius 4, empty `#262626`. Lost-today (`lost` n): the n segments right after the fill are empty with red ring and `beat` 1 s loop. At ≤ 20 the last filled segment also beats. Note (12 `#8A8A8A`) e.g. "Arjun missed day 2: −20, then +10 heal." Warn strip (red tint .14, `heart-broken`): "One more miss breaks it."
Props: `v:number, lost?:number, note?, warn?`. Data: `oath.hp, oath.hpLostToday, oath.lastDayNote`.
Screens: D2, D2·low, D3, R·act, (cards everywhere).

### DayMemberGrid (`grid`)
Props: `n (days), today (1-based), rows: Record<MemberKey, string>` where each char is a cell state: `k` kept · `m` missed · `p` pending · `h` photo 1 done · `r` in review · `x` broke the Oath · `f`/missing = future.
Panel padding 14, radius 24, `surface.1` + hairline. CSS grid: first column 64 dp (7-day) / 26 dp (14-day, names hidden), then n equal columns; gap 4 (3). Header row: day numbers mono 10, today `#FFFFFF`, others `#6A6A6A`. Row label: member chip 22×22 radius 7 (member colour, initial 10/700 `#131313`) + name 12/600 ellipsis. Cell h 26 (18), radius 7 (5), icon 13 (10). Cell colours `color.gridCell`. Animation: kept/missed cells pop (`cellPop` 350 ms spring, delay 250 + 60·row + 40·col); pending/review beat 1.8 s; broke beats .9 s. Legend row: 10×10 swatches + "kept / missed / pending / in review" 11 `#8A8A8A`, gap 12.
Data: `oath.days, oath.today, members[].days[]`. Tap a row → I2 (member profile) when wired.
Screens: D2, D2·low, D3, D4, R·act.

### MoneyMoment (`big`)
Props: `v (string, e.g. '+186', '1,186', '−1,000'), l (caption), fs=56, c`.
- Plain: `type.display` at fs, colour c, tabular; count-up from 0 over 900 ms (ease-out cubic) keeping prefix/suffix; caption 14 `#8A8A8A` margin-top 8. Red (`#F87171`) or lime numbers get a soft text glow (`0 0 40 rgba(...,.35)`).
- **Pill** (when `c` is lime and the value starts with "+"): becomes the lime money pill — fs min(fs, 50), text `#1A2600`, bg `gradient.moneyPill`, padding 14/30/14/22, radius pill, shadow `moneyPill`, rotated −3°, leading `sack` icon at fs·.8. Pops in (`money` 600 ms spring, delay 200 ms).
Screens: H3, H5, J1, L1, L2, L3, L4*, L6, R4*, W-series, K2.

### ProofCamera (`cam`) + Shutter
Props: `n:1|2, obj (icon), g:'thumb'|'peace'|'palm', state:'idle'|'check'|'fail'|'review'|'scan'|'off', label, h=410`.
Frame: radius 30, `gradient.camera`, overflow hidden. Top-left pill "Photo n of 2" (h 30, padding 0/11, radius 15, white .12, 12/600, camera icon). Four corner brackets 34×34, 3 dp stroke, inset 18, outer radius 14, colour per state. Centre: object icon (124 dp when h ≥ 340, else 92; `rgba(255,255,255,.42)`) with the gesture badge (62 round white disc, gesture icon 32 `#131313`, rotated 10°, at right −30 / bottom −14; blurred 1.2 in review). Scan line (check & scan states): 2 dp lime line with glow, sweeping 14 %→84 % top, 1.5 s ease-in-out alternate. Bottom pill (h 36, padding 0/14, radius 18, 13/600) with state icon + label.
| state | corners | pill bg / fg | icon |
|---|---|---|---|
| idle | `rgba(255,255,255,.65)` | `rgba(0,0,0,.6)` / #FFF | `target` |
| check | lime | `rgba(0,0,0,.65)` / lime | `loading` (spinning) |
| fail | red | red / #131313 | `close-circle-outline` |
| review | violet | violet / #131313 | `eye-outline` |
| scan (QR) | lime | `rgba(0,0,0,.6)` / #FFF | `qrcode-scan` |
| off (no permission) | `#3A3A3A` | `#2A2A2A` / #BDBDBD | `camera-off-outline` |
Shutter row: padding 6/34/0, space-between: flash 48 round `#222` (`flash-off` `#6A6A6A`), shutter 80 round with 4 dp white inner ring + 64 white disc (pressed scale .94), flip 48 round `#222`.
Data: `challenge.object, challenge.gesture, challenge.expiresAt, check.status, check.reason`.
Screens: F1, F2, F2a, F2c, F4, F4·chk, F4a·g, G1, E1 (scan).

### OptionGrid (`opts`)
Props: `id (selection key), items:{t, s?, ic?}[], mode:'tile'|'big'|'chip'|'row', cols?, small?`. Selected: bg `#FFFFFF`, fg `#131313`, shadow `optionOn`, rotation −2° (even) / +2° (odd), 250 ms spring transition. Unselected: `surface.1` + 1 dp `rgba(255,255,255,.07)`. Radius 20, gap 8.
| mode | cols | min-h | layout | title |
|---|---|---|---|---|
| tile (objects) | 4 | 84 (small 66) | column centre, icon 28 (22), gap 6 | 11/600 |
| big (length) | 3 | 124 (small 66) | column bottom-left | 46/600 −2 (small 26) |
| chip | n | 64 | centre | 20/600 −0.6 |
| row (2 cols) | 2 | 128 | column space-between, icon 28 | 18/600 −0.4 |
| row (1 col) | 1 | 80 | row, icon 26, gap 14, trailing `check-circle` / `circle-outline` | 17/600 −0.3 |
Sub text 12/16 opacity .65.
Screens: C2, C3, C4, C5, K1, K2, K4, I7.

### SentenceInput (`input`)
Panel padding 16/18, radius 22, `surface.1`, 1.5 dp lime inner ring (focused). Label 12 `#8A8A8A`. Value line (fs 22 with prefix, 20 without; 600; −0.6; mono when `mono`): prefix in `#6A6A6A` ("Every day I will"), value white, 2×22 lime caret. Counter mono 11 `#6A6A6A` right ("21 / 60"). Suggestion chips below: h 34, padding 0/13, radius 17, 13/600; selected white/#131313, else `surface.1`/#D4D4D4 + hairline. Error: ring `#F87171` + message 12 red under the panel (validation: empty / > max).
Screens: C1, E1, K1, K3, I8.

### Segmented (`seg`)
Track padding 4, radius 24, `surface.1`, gap 4. Items flex 1, h 38, radius 19, 13/600; selected white/#131313, else transparent/#8A8A8A. Can navigate (tabs like Discover/Joined/Created) or set a value.

### RowList (`rows`) + Row + Toggle
List gap 6; optional monoLabel heading. Row: min-h 60 (or per row), padding 8/12/8/8, radius 18, bg `surface.1` (override per row), hairline. Leading 40×40 tile radius 12 (tile3d-lite: highlight .22, shade .2) holding an Avatar, an initial (15/700), an icon (20), or the Check-K. Title 15/600 (pretty wrap), sub 12/16 `#8A8A8A`. Trailing: value 14/600 tabular (colour per row) + sub 11 `#6A6A6A`; or a RowButton; or chevron 20 `#6A6A6A`; or Toggle.
Toggle: 46×28 radius 14; off track `#3A3A3A` knob `#9A9A9A`; on track lime knob `#131313`; knob 22 at x 3 / 21; 150 ms.
Screens: most.

### Breakdown (`brk`)
Optional monoLabel (margin-bottom 8). Panel padding 4/16, radius 22, `surface.1` + hairline. Rows space-between, min-h 44 (total row 54), 1 dp top divider `rgba(255,255,255,.06)` from the 2nd row. Label 14 `#8A8A8A`; value 14/600 (total 18/700) tabular, colour per row (lime gains, red losses).
Data: `settlement.start, settlement.lost, settlement.won, settlement.fee, settlement.final, settlement.recovered`.

### SeatSlots (`slot`)
4-column grid, gap 8. Seat: padding 12/4, radius 20, `surface.1` + hairline, rotated ±1.5°. Avatar 44 radius 14 (tile3d), pop-in staggered 150 + 90 ms·i. Name 12/600, status mono 10 (lime; red for `r`; `#8A8A8A` dim, avatar opacity .4). Open seat: `#161616`, 1.5 dp `#262626` ring, `plus` icon, "Open seat" `#6A6A6A`, no rotation. Overflow seat: "+24 others".
Data: `oath.members[] {avatar, name, status}`, `oath.capacity`.

### QRCard (`qr`)
Panel padding 16, radius 24, `surface.1`, gap 16. QR 132×132 white, radius 18, padding 10, rotated −3°, shadow `0 10 24 rgba(0,0,0,.4)` (use `react-native-qrcode-svg` with the real link). Right: "Code" 12 `#8A8A8A`, code `type.monoCode`, "Link" label, link mono 12 ellipsis.
Data: `invite.code, invite.link`.

### BountyCover (`cover`)
h 170 (per screen), radius 26, bg = brand gradient, shadow `cover`. Giant faint object icon bottom-right. Top-left brand pill (h 32, padding 0/11/0/4, radius 16, `rgba(0,0,0,.28)`, logo square 24 white radius 8 with initial 12/800, brand 13/600, `check-decagram` when verified). Top-right tag pills (h 26, `rgba(0,0,0,.28)`, 11/600). Message bottom-left `type.coverMsg`. Shine sweep 5 s.
Data: `bounty.brand {name, logo, verified, gradient}, bounty.message, bounty.pool, bounty.joinClosesAt`.

### HScroller (`hs`)
Section header (monoLabel + "See all" lime 13/600). Horizontal list bleeding to screen edges (margin 0/−20, padding 2/20/8), gap 10. Hero cards 168×148, radius 24, `color.heroCardPalette` gradient 155°, fg per palette, shadow `inset 0 1.5 0 rgba(255,255,255,.35), 0 14 28 rgba(0,0,0,.4)`; content: icon+title 13/600, value 19/700, sub 11. Chip variant (categories): h 36, padding 0/15, radius 18, selected white.
Screens: H1.

### SearchBar
h 48, radius 24, `surface.1` + 1 dp `rgba(255,255,255,.07)`, padding 0/16, `magnify` icon, placeholder 15 `#8A8A8A`, optional trailing filter icon. Tap → H7.

### InboxList (`nt`)
Header: monoLabel + action link (lime 13/600, e.g. "Mark all read"). Item: padding 12, radius 20, `surface.1`, ring `rgba(197,242,92,.22)` when it needs action else hairline; dim (done) opacity .55. Leading 44 tile radius 14 (Avatar, Keeper bust, or palette icon) with a 22 badge bottom-right (badge palette colour, icon 13, 3 dp `surface.1` ring). Title 15/20/600, unread dot 8 lime, time 11 `#6A6A6A`; sub 13/18 `#8A8A8A`; action RowButtons (h 36) margin-top 10, gap 6. Tapping an action marks the item done (`do:` route) so it leaves "Needs you".
Data: `notification {id, type, actor?, title, body, createdAt, needsAction, actions[]}`.
Screens: N1.

### ProfileCard (`prof`)
radius 28, `surface.1` + hairline. Banner 96 high (gradient `color.banner[n]`, faint icon). Avatar 84 radius 26 at (16, 50), 4 dp `surface.1` ring, rotated −3°. Action chips top-right at y 108 (h 34, `#262626` + `line.strong`, 13/600). Body padding 48/16/16: name `type.profileName` + verified icon; handle mono 12 `#8A8A8A`; bio 14/20 `#D4D4D4`; socials chips (h 32, `#262626`, glyph or icon + handle 13/600).
Data: `profile {name, handle, avatar, banner, bio, verifiedSeeker, socials[], visibility}`.
Screens: I1, I2, I2·me, I2·p, I3.

### Avatar / AvatarBuilder (`avb`)
Avatar: 8-digit config string → layered character (base, skin, eyes, hat, fit, fit colour, extra, background). Parts and colours: `reference/Avatar.dc.html`, `tokens.json` (AVC palettes in `reference/kept-kit.js`). Builder: 200 dp preview (radius 100, rotated −2°, pops in), Shuffle button; tabs Base / Eyes / Hat / Fit / Extra / Back (Segmented); colour swatches 32 round (selected ring `0 0 0 3 #131313, 0 0 0 5 #FFF`); option grid 3 columns, tiles 122 high, 78 dp avatar previews, selected `#262626` + 2.5 dp white ring. Edit variant: 120 preview + "Build avatar" (lime) / "Use NFT or photo" (secondary) + banner picker (44×28 swatches). The Keeper comments on picks (`copy.keeper.avatar.*`).
Screens: I8, I9, A4.

### KeptRateRing (`ring`)
Panel padding 16, radius 26, `surface.1`, gap 18. Ring 118 conic (lime to p %, `#2A2A2A` rest), rotated −8°, glow `0 0 34 rgba(197,242,92,.18)`, inner disc inset 11 with value `type.ringValue` (counts up). Right: "KEPT RATE" mono 12 +1.2, line 16/21/600 ("92% · 64 days"), note 12/17 "Recent days count more. Shows "New" under 10 days."
Data: `profile.keptRate, profile.keptDays`.

### IdentityRow (`id`)
68 tile radius 22 (colour, initial 28/700) rotated −4°; name 22/700; handle mono 12; chips row.

### DayStrip (`days`)
n equal cells, gap 5. Cell h 36 radius 10: kept = lime + `check-bold` 16 (#131313), rotated ±2°; not yet = `surface.1` + 1 dp `#2E2E2E`; today = 2 dp `#131313` + 4 dp white outer ring, rotated −6°. Label under (mono 10; today white). Kept cells pop in staggered 70 ms from 250 ms.
Screens: F3, F5.

### SignStatus (`sign`)
150 dp disc. Ring: pending = conic lime 22 % on `#2A2A2A` spinning 1.1 s linear; success = solid lime + two lime rings pinging (scale 1→1.7, fade, 1.8 s, second delayed .6 s); fail = red; warn = orange. Inner disc inset 10 `surface.1` with icon 60 (`wallet-outline` / `check-bold` pop-in 600 ms springHard / `alert-outline` / `cellphone-off`). Floating white chip at (96, −8) rotated 7° with icon + text (wallet name, "Genesis verified", …).
Pending screens auto-advance after **2200 ms** (prototype) — in the app, advance on the wallet result.
Screens: A2·s, A3, A3·no, C7*, D1·xs, D1·go, E2·s, R2, J1·p/ok/f, K5·p/ok, W3·s/ok.

### BarChart (`bars`)
Panel padding 16, radius 24. Label 13 `#8A8A8A`. 120 dp tall bars, gap 6, radius 7, lime (empty days `#2A2A2A`, min 4 dp); value mono 10 `#BDBDBD` above, label 10 `#6A6A6A` below.
Screens: H6.

### UploadBox (`up`)
h 150, radius 24, 2 dp `#333` ring, hatch pattern (`gradient.uploadHatch`), icon + title 15/600 + sub 12 `#6A6A6A`. Tap → image picker.

### Brand blocks (`brand`)
- **splash** — 112 lime tile radius 28 (`gradient.brandTile`, inner highlight/shade, lime glow) with the ink Check-K 90 dp; "KEPT" `type.wordmark`; "Keep your word." 15 `#8A8A8A`. Sequence in motion.md.
- **word** — Check-K 32 (dark variant) overlapping "EPT" `type.wordmarkSm`. Top of A1.
- **stamp** — pill padding 7/12/7/7, radius 15, `surface.1` + hairline: 22 lime tile with ink mark 18, "KEPT" 13/900, mono 10 +.8 `#8A8A8A` text ("VERIFIED · DAY 3 · 9:41"). Bottom of F5, L1, L2, L6, H5, J1·ok.
- **lockup** — 44 lime tile radius 13 + "KEPT" 15/900 + "Keep your word." 12 `#6A6A6A` + mono 10 `#4A4A4A` "v0.9 · DEVNET · SEEKER". Footer of I4.

### Sheets used as components
`+` (New: Start an Oath / Join with code / Create a Bounty), D1·x (cancel confirm), B5 (daily recap), M3 (not enough SOL), M4 (not enough SKR). Specs in screens.md.
