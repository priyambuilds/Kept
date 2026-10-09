# Product rules

The rules the screens are built on. Where the brief left something open, it's listed under **Open decisions** with the value the prototype assumes. Don't invent backend behaviour beyond this; confirm the open items first.

---

## 1. Oaths

| Rule | Value |
|---|---|
| Lengths | 3, 7 or 14 days |
| Objects | dumbbell, book, water bottle, guitar, running shoe, plant, skipping rope, yoga mat |
| Stake (per member) | 500 / 1,000 / 2,500 SKR (≈ $5 / $10 / $25 — Devnet placeholder price) |
| Solo | 1 member, has a stake and an HP bar, always **AI only** review |
| Group | 2+ members, all stake the same amount; join by link, QR or code; needs a verified Seeker (Genesis) |
| Creator powers | Start or Cancel before day 1 (cancel refunds everyone); chooses review mode |
| Leaving | Members may leave before Start (stake refunded). After Start there is no way out. |
| Day | Local midnight to midnight (prototype copy says "resets in hh:mm:ss"). Both photos must be in before midnight. |

### Review modes (set by the creator)
- **AI only:** a failed check is final. After 3 failed photo-2 checks the day counts as missed at midnight (F4a).
- **AI + group review:** after 3 failed photo-2 checks the user may send photo 2 to the group (F4a·g → G2). A **majority of the other members** must approve; **a tie rejects**. Each member votes once (G1). Photos sent for review are kept until the decision, **48 hours max**, then deleted.
- Solo Oaths are always AI only.

## 2. HP

- Every Oath starts at **100 HP**.
- At the end of each day, in this order:
  1. **−20 HP for each member who missed** (solo Oaths: **−35** per miss — prototype assumption for "heavier damage").
  2. **+10 HP heal**, capped at 100.
- At **0 HP the Oath breaks**: every member loses their whole remaining balance (the pot burns).
- UI thresholds: HP ≤ 40 bar turns orange; ≤ 20 red + warning "One more miss breaks it." when the next miss would reach 0.
- Example (from D2 / B5): Arjun misses day 2 → 100 − 20 = 80 → heal → 90.

## 3. Money

### Cost of a miss
- 1st miss: `stake ÷ days`. Each later miss by the same member: **1.5 ×** that member's previous miss.
- Formula: `cost(k) = stake / days × 1.5^k` for the member's k-th miss (k starts at 0).
- Prototype display values (rounded): 1,000 SKR / 7 days → **143, 214, 321**; 1,000 / 3 → **333.33, 500, 750**.

### Distribution of a day's lost money
- **10 % fee** to KEPT.
- The remaining **90 %** goes to the members who **kept that day**, split **in proportion to how many days each has kept so far (including that day)**.
- Missed members get nothing from that day's pool.
- Balances move daily, are shown as **estimates** ("live balance") and are **claimed at settlement** (J1).

### Settlement
- Oath completes (HP > 0 after the last day) → each member claims their final balance.
- Oath breaks (HP 0) → everyone loses everything; the Rematch offer opens (§4).
- Breakdown shown per member: start, lost, won, fee, final (D4, L1, L2, J1).

### Worked example — 4 members × 1,000 SKR, 3 days
Members: A, B, C, D (demo names: You, Riya, Dev, Arjun). Cost of a miss: 333.33, then 500, then 750.

| Day | What happens | Lost | Fee 10 % | To keepers | Split (days kept so far) | HP |
|---|---|---|---|---|---|---|
| 1 | B and D miss (1st miss each) | 333.33 + 333.33 = **666.67** | 66.67 | 600.00 | A 1 : C 1 → **A +300.00, C +300.00** | 100 − 40 = 60, +10 → **70** |
| 2 | Everyone keeps | 0 | 0 | 0 | — | +10 → **80** |
| 3 | D misses (2nd miss → 333.33 × 1.5) | **500.00** | 50.00 | 450.00 | A 3 : B 2 : C 3 (of 8) → **A +168.75, B +112.50, C +168.75** | 80 − 20 = 60, +10 → **70** |

Final balances:
| Member | Start | Lost | Won | Final |
|---|---|---|---|---|
| A | 1,000.00 | 0 | 468.75 | **1,468.75** |
| B | 1,000.00 | 333.33 | 112.50 | **779.17** |
| C | 1,000.00 | 0 | 468.75 | **1,468.75** |
| D | 1,000.00 | 833.33 | 0 | **166.67** |
| **Fee** | | | | **116.67** |

Check: 1,468.75 + 779.17 + 1,468.75 + 166.67 + 116.67 = 4,000.01 (the 0.01 is display rounding of thirds; exact values sum to 4,000).

## 4. Rematch (the only win-back)
- When an Oath breaks, every member gets **one Rematch** of the same Oath: same goal, object and length.
- Must be **started within 7 days** of the break. One Rematch per broken Oath. **A Rematch can't be rematched.**
- Any members of the broken Oath can join. Group Rematch needs **≥ 2**; a broken solo Oath gets a solo Rematch.
- Everyone **stakes the same amount as the original**.
- All normal rules apply (HP, miss cost, payouts, fee, it can break again).
- **Recovery bonus:** at the end, each member who **kept every day** of a Rematch that **didn't break** also gets back **50 % of what they lost in the original Oath**. A member's recovery is lost the moment they miss.
- **Funding:** when an Oath breaks, half of each member's lost money is **held for 7 days + the Rematch length** instead of going to the broken-pot destination. If not recovered, it is released to the normal broken-pot destination.
- Start: the creator of the original starts it, or anyone once 2+ have joined (R3).

## 5. Daily proof
1. **Photo 1:** the object + a requested gesture (thumbs up, victory sign or open palm).
2. **Do the activity.** No forced wait between photos.
3. **Photo 2:** the object + a *different* gesture.
4. Both photos before midnight.
5. Photos are checked by **AI on the server**, then discarded; only a fingerprint (hash) is kept. Group-review photos are kept until the decision (48 h max).
6. A challenge can **expire** (the app asks for a new one, F2c). Check outages show F2b with time left.
7. No on-device checking, no gallery uploads (live camera only).

## 6. Bounties
- Anyone can create one. The creator funds the pool and sets: object, length, join deadline, branding (cover, message, one link) and optional requirements (**minimum kept rate**, **token held**).
- Public and discoverable. **Joining is free**, needs a verified Seeker, and **closes after day 1**.
- Same two-photo proof. **Miss a day and you're out.** Survivors split the pool equally.
- KEPT takes a **10 % fee when the pool is funded** (creator pays pool × 1.10; K2/K5).

## 7. Kept rate
- Based on every day kept or missed across Oaths and Bounties, plus how many were finished cleanly. **Recent days count more.** New users start at a neutral baseline.
- Always shown with its evidence: **"92% · 64 days"**. Under 10 days it shows **"New"**.
- Shown wherever people decide who to trust: Oath preview (E2), lobby (D1), balances list (D2), profiles (I1/I2), Bounty requirements (H2).

## 8. Odds (display only)
D2 shows OddsChips ("Riya 1-to-9", "Arjun 3-to-1 to miss") and the Keeper quotes odds. They are **flavour, derived from kept rate and today's status**, never a market and never used for money. Suggested: `p(keep) = keptRate` adjusted by today's status (photo 1 in → +; deadline < 2h and nothing → −); odds = `round(p/(1−p))`.

## 9. Not in the app
XP, levels, ranks, NFTs, a marketplace, any win-back other than the Rematch, forced waits between photos, viewing others' proof photos (except during review), on-device checking.

---

## Open decisions (prototype assumption in **bold**)
1. **Solo miss damage −35 HP**; where a solo member's lost SKR goes (no keepers) — prototype shows it simply as "lost"; recommend: same as the broken-pot destination.
2. Broken-pot destination (who receives a burned pot): not specified — **"burned, nobody gets it"** in copy.
3. Miss cost larger than the remaining balance (e.g. D's 3rd miss = 750 > 166.67): recommend **cap at remaining balance**.
4. Rounding: recommend integer math in the token's smallest unit, round each share down, put dust into the fee.
5. Heal on a day someone missed: brief says always +10 after damage — **applied every day**.
6. Day boundary for groups across time zones: prototype uses the device's local midnight; recommend the creator's time zone fixed at creation.
7. Deadline reminder threshold **2 hours** (B4, notifications).
8. Daily recap shown **once after midnight** (B5).
