# Motion spec

Implement with **Reanimated 3** (`withTiming`, `withSpring`, `withSequence`, `withDelay`, `withRepeat`) and **expo-haptics**. CSS cubic-béziers below map 1:1 to `Easing.bezier(x1,y1,x2,y2)`. Overshooting béziers (y > 1) are intentional — keep them as béziers rather than springs to match the prototype timing exactly.

Reduce Motion (`AccessibilityInfo.isReduceMotionEnabled`): every animation jumps to its end state; loops don't start; count-ups show the final number; FX layers are not rendered.

## Easing tokens
| Token | Bézier | Feel |
|---|---|---|
| `spring` | (.3, 1.5, .5, 1) | pop with ~8 % overshoot |
| `springSoft` | (.3, 1.45, .5, 1) | Keeper note drop |
| `springHard` | (.3, 1.6, .5, 1) | badges, bubbles, toast |
| `enter` | (.2, .8, .2, 1) | screen/block entrance |
| `burst` | (.15, .7, .3, 1) | coin burst |
| `rise` | (.2, .7, .3, 1) | value pops floating up |
| `draw` | (.5, 0, .3, 1) | logo check stroke |

## Keyframe library (name → definition)
| Name | Keyframes | Default |
|---|---|---|
| `enter` (kInA/kInB) | opacity 0→1, translateY 16→0, scale .98→1 | 500 ms `enter` |
| `in` (kIn) | opacity 0→1, translateY 10→0 | 250–400 ms ease-out |
| `pop` (kPop) | scale .4→1.08 (65 %)→1, opacity 0→1 (65 %) | 300–600 ms `spring` |
| `bubble` (kBub) | scale .6 + translateY 8 → none, opacity 0→1 | 500 ms `springHard` |
| `bubbleR` (kBubR) | scale .6 rotate −6° → rotate 4°, opacity 0→1 | 550 ms `springHard` |
| `note` (kDrop) | translateY −16, scale .72, opacity 0 → none | 420 ms `springSoft` |
| `knock` (kKnock) | rotate 0 → −14° (6 %) → 11° (12 %) → −6° (18 %) → 0 (24 %, hold) | 2.6 s ease-in-out ×3, delay .8 s, origin 50 % 90 % |
| `breath` | translateY 0 → −4 → 0 | 7 s loop |
| `float` | translateY 0 → −9 → 0 | 4.5–7 s loop |
| `drift` | translate(0,0) scale 1 → (40,30) scale 1.18 → back | 16 s / 19 s (reverse, −6 s offset) |
| `beat` | opacity 1 → .4 → 1 | 1 s (lost HP), .9 s (broke cell), 1.8 s (pending cell) |
| `ping` | scale 1→1.7, opacity .7→0 | 1.8 s ease-out loop |
| `spin` | rotate 360° | 1.1 s linear loop |
| `shine` | translateX −120 % → 320 % (by 55 %), rest | 3.4 s loop delay 1 s (buttons), 5 s delay 1.2 s (covers) |
| `glow` | lime ring 0 → 9 dp (.14) → 0 | 2.6 s loop (Plus button) |
| `scan` | scan line top 14 % → 84 % | 1.5 s ease-in-out, alternate |
| `beam` | opacity .7 → 1 → .7 | 5 s loop |
| `draw` (kDraw) | strokeDashoffset 100 → 0 (pathLength 100) | 320 ms `draw` |
| `burst` | translate 0 → (dx,dy) + rotate, scale .3→1; opacity 0→1 (12 %) →1 (75 %) →0 | 1.3 s `burst` |
| `fall` | translateY −80 → 920, rotate 0 → 540° | 2.8–4.6 s linear loop |
| `rise` (embers) | translateY 0 → −520; opacity 0 → 1 (15 %) → 0 | 3–5.1 s ease-out loop |
| `kUp` (value pop) | translateY 30 scale .5 op 0 → (18 %) 0 / 1.06 / 1 → (30 %) scale 1 → (80 %) op 1 → translateY −240 op 0 | 2.8 s `rise` |
| `countUp` | number 0 → value, ease-out cubic `1−(1−t)^3` | 900 ms |

## Screen-level choreography (every screen)
1. Screen mounts → ambient orbs start drifting (already running if same tone).
2. Blocks enter top→bottom with `enter`, delay **40 + 65·i ms**.
3. Pinned actions enter with `enter`, delay 200 ms.
4. FX layer (if any) starts on mount; it's keyed per navigation so it replays every visit.
5. Flow screens with a Keeper line: KeeperNote drops (`note`) right away, auto-hides at 4.8 s.

---

## Signature animations

### 1. Splash / brand reveal (A0)
| t (ms) | What |
|---|---|
| 0 | Lime tile `pop` 550 ms `spring` |
| 350 | Check stroke `draw` 320 ms |
| 600 | Stem `in` 250 ms |
| 750 | Leg `in` 250 ms |
| 900 | "KEPT" `in` 400 ms |
| 1050 | "Keep your word." `in` 400 ms |
| 2000 | Navigate to A1 (fade) |
Haptic: `impactLight` at 350 ms (check lands).

### 2. HP damage (D2 on the day after a miss, D2·low, cards)
Trigger: an Oath screen opens with an unseen HP change < 0.
1. HP number counts **down** from the previous value (900 ms ease-out cubic) — prototype counts up from 0 on every visit; for live data animate from the last-seen value.
2. Lost segments (from new HP up to old HP): fill fades to empty (200 ms) and gains a 1.5 dp red ring; ring then `beat`s (1 s loop) for the rest of the day.
3. If HP ≤ 40 / ≤ 20 the remaining segments tween to orange / red (300 ms) and the last filled segment beats.
4. Warn strip "One more miss breaks it." `pop`s in when the next miss would break it.
Haptic: `notificationWarning` once at step 2.

### 3. HP heal (+10)
Trigger: unseen HP change > 0 (end of day).
1. Healed segments pop in left→right (`pop` 300 ms, 28 ms stagger), coloured by the HP gradient.
2. Number counts up 900 ms. Note line updates ("…then +10 heal").
Haptic: `impactLight`.

### 4. Money moving (live balance / recap / payouts)
- **Value pills** (`pops` on a screen): lime pills "+43 SKR", "3 of 3 kept", "Streak 13" float up with `kUp` 2.8 s at delays .6 / 1.1 / 1.6 s from positions (34,500), (206,450), (120,580), rotated ±4°.
- **Balance rows** (D2, D4, B5): numbers count up 900 ms; gains lime, losses red.
- **BalanceChip** in the header: when the balance changes, count from old→new 900 ms and `pop` the chip (scale 1→1.08→1, 300 ms).
Haptic: `impactLight` per pill.

### 5. Day kept (F5)
| t (ms) | What |
|---|---|
| 0 | Tone lime + beam fade in; coin **burst** — 14 coins (24 dp) from (183,430), angles −90° ± 13°·k, distance 260–440 dp, `burst` 1.3 s, 25 ms stagger |
| 40+ | Blocks enter: Keeper (happy, thumbs anim) → "Day 3 kept." → DayStrip (kept cells `pop` from 250 ms, 70 ms stagger; today cell rotated −6°) → rows → Brand stamp |
| 600 / 1100 | Value pills "Kept" and "Streak 13" `kUp` |
| 1200+ | Falling coins loop (12 coins, 2.8–4.6 s, linear) |
Haptic: `notificationSuccess` at 0.

### 6. Oath broken (D3, L3, L4·b)
| t (ms) | What |
|---|---|
| 0 | Tone **ember** (warm glow from the bottom, ambient orbs anchored low) |
| 0+ | 22 embers rise from the bottom edge (`rise` 3–5.1 s, staggered by 290 ms modulo 3 s), 2 of 3 orange with glow, 1 of 3 grey ash |
| 40+ | Keeper (stern, scythe prop) enters; HP panel at 0 (all segments empty); MoneyMoment "−1,000" in red with red glow counts up |
| — | Grid: the breaking cell (`x`, red with `fire`) beats .9 s |
| 200 | Pinned "Rematch · win back 50%" (lime) enters |
Haptic: `notificationError` at 0, then `impactHeavy` 150 ms later.

### 7. Payout (L1, L2, L4, J1·ok, H5)
| t (ms) | What |
|---|---|
| 0 | Tone lime + beam; coin burst (as Day kept) |
| 40+ | Keeper **shades** mood with **sack** prop and `jump` anim; floating sack orbs |
| 200 | MoneyMoment pill (lime, −3°) `pop` 600 ms `spring`; number counts up 900 ms |
| 600 / 1100 | Value pills ("+186 SKR", "7 of 7") |
| last block | Brand stamp "KEPT · IRON WEEK · 7 OF 7" |
Haptic: `notificationSuccess` at 200, `impactLight` per value pill.

### 8. Rematch comeback (L6)
Payout choreography plus: orange "REMATCH" chip floating on the Keeper, recovered line "+500 SKR recovered" highlighted lime in the Breakdown, stamp "REMATCH · COMEBACK".
Haptic: `notificationSuccess` then a second `impactMedium` 250 ms later ("double knock").

### 9. Proof check (F2, F4·chk)
Corners turn lime; scan line sweeps (`scan` 1.5 s alternate); pill "Checking…" with spinning `loading`. Pass → navigate (F3/F5). Fail → corners red, gesture badge shakes (translateX 0 → −6 → 6 → −3 → 0, 300 ms), pill red with reason. Haptic: success `notificationSuccess`, fail `notificationError`.

### 10. Signing (SignStatus)
Pending: conic 22 % ring spinning 1.1 s. Success: ring fills lime, icon `pop` 600 ms `springHard` delay 150, two lime rings `ping` (second +600 ms). Fail: red ring, alert icon. Haptic: success `notificationSuccess`; fail `notificationError`.

### 11. Keeper presence
- KeeperMark `knock` when a new line exists (×3), unread dot.
- KeeperNote `note` drop from the mark; auto-close 4.8 s on flows.
- Inline placement: bubble `bubble` 500 ms delay 450 ms; chips `float` 4.5 s; mood glow static.
- Character idle (blink, breathing, hand gestures) is computed per frame in `reference/Keeper.dc.html` (`anim` prop); see assets.md for the frame strips.

### 12. Micro-interactions
| Element | Motion |
|---|---|
| Button press | scale .98, 100 ms |
| Round icon button | scale .92–.95 |
| Option select | rotate to ±2°, raise (`optionOn` shadow), 250 ms `spring` |
| Toggle | knob x 3↔21, track colour, 150 ms |
| Tab change | flex 1 → 1.7, 200 ms; label fades in |
| Grid cells | kept/missed `pop` 350 ms, delay 250 + 60·row + 40·col |
| HP segments | `pop` 300 ms, delay 200 + 28·i (panel) / 300 + 22·i (card) |
| Seat slots | avatar `pop` 450 ms, delay 150 + 90·i |
| Toast | `pop` 400 ms `springHard`, hide after 1.9 s (fade 200 ms) |
| Inbox badge | `pop` 400 ms `springHard` |
