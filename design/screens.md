# Screen specs

Generated from the final prototype (`reference/kept-screens-*.js`, rendered by `reference/KEPT Play.dc.html`). 116 screens/states. Component names refer to `components.md`; copy keys refer to `copy.json` (`screens.<id>.<key>`).

**Common layout.** 390×844 frame, `bg.app`. Status bar 48. Header (tab screens) or NavBar (flows) at y 56. Scroll column: x 20–370, gap 14, starts at y 108 (header) / 110 (nav) / 58 (plain). Pinned actions bottom 34. Tab bar bottom 28. Sheets: see BottomSheet. Every screen also has: Toast host, FX layer, KeeperNote host.

**States.** Each screen lists its own states. Global states that apply to every screen with network data: *loading* → skeleton blocks with the same geometry (surface.1 rounded rects, pulse opacity .5↔1 at 1.2 s) — not drawn in the prototype, use this rule; *offline* → M2; *wallet errors* → M3/M4, C7·no, C7·fail.

**Routes.** `back` = pop; `toast "…"` = stay + toast; `(marks x done)` = clears inbox item(s) x.


---

## A · Onboarding

### A0 — Splash
- **Layout:** Plain (no bar)
- **Components (top→bottom):** Brand
- **Auto:** advances to A1 after 2000 ms in the prototype (in the app: on wallet/server result).
- **Data:** —
- **Entered from:** app launch (cold start)

### A1 — Welcome
- **Layout:** Plain (no bar) · beam · decor icons: sack,cards-playing-outline
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** smug — "Step up. Place your word."
- **Copy:**
  - `b1.chip.0` "1,000 SKR pot"
  - `b1.chip.1` "3-to-1 on you"
  - `b2.title` "Bet your friends\nyou'll do it."
  - `b2.sub` "Stake SKR on a daily habit. Prove it with two photos. Miss, and the people who kept take your share."
  - `pin.0` "Get started"
  - `pin.1` "I have an invite"
- **Actions:**
  - pinned "Get started" → A2
  - pinned "I have an invite" → A2 (sets invite flag)
- **Data:** —
- **Entered from:** A0

### A2 — Connect wallet
- **Layout:** NavBar · StepBar 1/3 · back
- **Components (top→bottom):** Title, RowList, Breakdown, Note
- **Copy:**
  - `b0.title` "Connect your wallet."
  - `b0.sub` "You'll sign a short message. It's free and moves nothing."
  - `b1.r0.t` "Seeker Wallet"
  - `b1.r0.s` "Built into your Seeker"
  - `b1.r0.r` "Recommended"
  - `b1.r1.t` "Phantom"
  - `b1.r1.s` "Mobile wallet adapter"
  - `b1.r2.t` "Solflare"
  - `b1.r2.s` "Mobile wallet adapter"
  - `b2.label` "WHAT YOU'LL SIGN"
  - `b2.row0.l` "Message"
  - `b2.row0.v` "Sign in to KEPT"
  - `b2.row1.l` "Nonce"
  - `b2.row1.v` "8f3a…c21e"
  - `b2.row2.l` "Cost"
  - `b2.row2.v` "Free"
  - `b3.text` "Signing in never moves SKR or SOL."
- **Actions:**
  - row "Seeker Wallet" → A2·s
  - row "Phantom" → A2·s
  - row "Solflare" → A2·s
- **Data:** wallets[] {id, name, icon, recommended}
- **Entered from:** A1, A2·e, I4

### A2·s — Signing in
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Sign in to KEPT"
  - `b2.sub` "Check your wallet to approve the message."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to A3 after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Wallet rejected → A2·e · Not a Seeker → A3·no
- **Data:** signIn {message:"Sign in to KEPT", nonce, wallet}
- **Entered from:** A2

### A2·e — Sign-in rejected
- **Layout:** NavBar · StepBar 1/3 · back
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** shocked — "Cold feet already?"
- **Copy:**
  - `b2.title` "Signature rejected."
  - `b2.sub` "Nothing was charged. Connect whenever you're ready."
  - `pin.0` "Try again"
  - `pin.1` "Use another wallet"
- **Actions:**
  - pinned "Try again" → A2
  - pinned "Use another wallet" → A2
- **Data:** —
- **Entered from:** A2·s

### A3 — Seeker verified
- **Layout:** NavBar · StepBar 2/3 · back · beam
- **Components (top→bottom):** SignStatus, Title, ChipRow, PinnedActions (1)
- **Copy:**
  - `b1.chip` "Genesis token"
  - `b2.title` "Seeker verified."
  - `b2.sub` "Your Genesis token checks out. Group Oaths and Bounties are open to you."
  - `b3.chip.0` "Solo Oaths"
  - `b3.chip.1` "Group Oaths"
  - `b3.chip.2` "Bounties"
  - `pin.0` "Continue"
- **Actions:**
  - pinned "Continue" → A4
- **Data:** seeker {verified:true, genesisMint}
- **Entered from:** A2·s

### A3·no — Not eligible
- **Layout:** NavBar · StepBar 2/3 · back
- **Components (top→bottom):** SignStatus, Title, ChipRow, PinnedActions (1)
- **Copy:**
  - `b1.chip` "No Genesis token"
  - `b2.title` "Solo Oaths only."
  - `b2.sub` "Group Oaths and Bounties need a verified Seeker (Genesis). You can still stake on yourself."
  - `b3.chip.0` "Solo Oaths"
  - `b3.chip.1` "Group Oaths"
  - `b3.chip.2` "Bounties"
  - `pin.0` "Continue"
- **Actions:**
  - pinned "Continue" → A4
- **Data:** seeker {verified:false}
- **Entered from:** A2·s

### A4 — Pick a look
- **Layout:** NavBar · StepBar 3/3 · back
- **Components (top→bottom):** Title, AvatarBuilder, KeeperPlacement, Note, PinnedActions (2)
- **Keeper:** shocked — "A fox. Sly. I respect it."
- **Copy:**
  - `b0.title` "Pick a look."
  - `b0.sub` "No face needed. It's how friends spot you in an Oath."
  - `b3.text` "You can change it any time from your Profile."
  - `pin.0` "Looks like me"
  - `pin.1` "Customize it"
- **Actions:**
  - pinned "Looks like me" → B3 (or E1 if invite flag)
  - pinned "Customize it" → I9
- **Data:** profile.avatar (8-digit config)
- **Entered from:** A3, A3·no

---

## B · Today

### B1 — Today, active
- **Layout:** Tab screen (today) · AppHeader "Today" · TabBar + PlusButton
- **Components (top→bottom):** BodyText, Banner, KeeperPlacement, OathCard, RowList
- **Keeper:** side — "Tuesday again. You missed the last two." · side — "Photo 2 left. 9 hours. Easy money." · side — "Riya kept at 07:12. She's watching you."
- **Copy:**
  - `b0.text` "2 of 3 left · resets in 09:18:42"
  - `b1.title` "1,186 SKR ready to claim"
  - `b1.sub` "Hydra 14 ended Sunday. Tap to claim it."
  - `b3.name` "Iron Week"
  - `b3.meta` "with Riya, Arjun, Dev · Day 3/7"
  - `b3.line` "20 min with the dumbbell. Photo 2 any time before midnight."
  - `b3.tag.0` "1,043 SKR"
  - `b3.tag.1` "9h 18m left"
  - `b3.tag.2` "Photo 1 done"
  - `b3.float` "Riya kept 07:12"
  - `b3.btn` "Take photo 2"
  - `b4.name` "Hydrate Week"
  - `b4.meta` "Bounty by Drift · Day 3/7"
  - `b4.tag.0` "31 of 40 in"
  - `b4.tag.1` "Not started"
  - `b4.btn` "Prove"
  - `b5.r0.t` "Read 20 pages"
  - `b5.r0.s` "Solo · Day 9/14 · HP 100"
  - `b5.r0.r` "Kept 07:12"
- **Actions:**
  - banner "1,186 SKR ready to claim" → J1
  - card button "Take photo 2" → F4
  - card tap "(card header)" → D2
  - card button "Prove" → F1
  - card tap "(card header)" → H3
  - row "Read 20 pages" → D2
- **Other states / outcomes:** Deadline close → B4 · Everything kept → B2 · After midnight: recap → B5 · No Oaths yet → B3
- **Data:** user.balance, inbox.unreadCount, today.secondsToReset, today.items[] {kind:"oath"|"bounty", id, name, object, day, length, hp, member.balance, member.proofStatus ("notStarted"|"photo1"|"kept"), keptAt?, members[].keptToday, isSolo}, streak.current
- **Entered from:** B2, B3, B4, B5, D0, F3, F4a, F4a·g, H1, H1·j, H1·c, I1, J1·ok

### B2 — Today, all done
- **Layout:** Tab screen (today) · AppHeader "Today" · TabBar + PlusButton · tone lime · pops: 3 of 3 kept
- **Components (top→bottom):** BodyText, KeeperPlacement, Title, RowList, ChipRow
- **Keeper:** shades — "Clean sweep. I'm almost impressed."
- **Copy:**
  - `b0.text` "3 of 3 kept · resets in 05:02:10"
  - `b2.title` "All kept today."
  - `b2.sub` "Your 1,043 + 500 SKR are safe tonight."
  - `b3.r0.t` "Iron Week"
  - `b3.r0.s` "Day 3/7 · HP 90"
  - `b3.r0.r` "21:04"
  - `b3.r0.rs` "kept"
  - `b3.r1.t` "Read 20 pages"
  - `b3.r1.s` "Solo · Day 9/14"
  - `b3.r1.r` "07:12"
  - `b3.r1.rs` "kept"
  - `b3.r2.t` "Hydrate Week"
  - `b3.r2.s` "Bounty · 31 of 40 in"
  - `b3.r2.r` "13:40"
  - `b3.r2.rs` "kept"
  - `b4.chip.0` "Streak 13"
  - `b4.chip.1` "Kept rate 91%"
- **Actions:**
  - row "Iron Week" → D2
  - row "Read 20 pages" → D2
  - row "Hydrate Week" → H3
- **Data:** same as B1 (all items proofStatus="kept")
- **Entered from:** B1, F5

### B3 — Today, empty
- **Layout:** Tab screen (today) · AppHeader "Today" · TabBar + PlusButton · decor icons: cards-outline
- **Components (top→bottom):** KeeperPlacement, Title, ButtonRow, MonoLabel, BountyCover
- **Keeper:** bored — "Nothing on the table."
- **Copy:**
  - `b1.chip.0` "Photo proof"
  - `b2.title` "Put something\non the line."
  - `b2.sub` "Pick a habit, stake a little SKR, keep it with friends."
  - `b3.btn.0` "Start an Oath"
  - `b4.text` "FEATURED BOUNTY"
  - `b5.brand` "Drift"
  - `b5.msg` "Hydrate Week\n50,000 SKR pool · free to join"
- **Actions:**
  - button "Start an Oath" → C1
  - cover "Drift" → H2
- **Data:** featuredBounty {id, brand, message, pool, joinClosesAt}
- **Entered from:** B1, A4

### B4 — Deadline close
- **Layout:** Tab screen (today) · AppHeader "Today" · TabBar + PlusButton · tone red
- **Components (top→bottom):** BodyText, OathCard, KeeperPlacement
- **Keeper:** stern — "Tick tock. Your 143 is getting nervous."
- **Copy:**
  - `b0.text` "1 left · resets in 01:42:08"
  - `b1.name` "Iron Week"
  - `b1.meta` "with Riya, Arjun, Dev · Day 3/7"
  - `b1.line` "20 min with the dumbbell. Two photos before midnight."
  - `b1.tag.0` "1,000 SKR"
  - `b1.tag.1` "1h 42m left"
  - `b1.warn` "Miss today: −143 SKR · Oath −20 HP"
  - `b1.btn` "Prove now"
- **Actions:**
  - card button "Prove now" → F1
  - card tap "(card header)" → D2
- **Data:** same as B1 + item.missCostNext, item.hpLossIfMiss (=20 per member) , today.secondsToReset < 7200
- **Entered from:** B1

### B5 — Daily recap
- **Layout:** Bottom sheet over "Today"
- **Components (top→bottom):** MonoLabel, Title, KeeperPlacement, RowList, ButtonRow
- **Keeper:** side — "Petty? Me? Never."
- **Copy:**
  - `b0.text` "YESTERDAY · SETTLED AT 00:00"
  - `b1.title` "Arjun blinked.\nYou didn't."
  - `b3.r0.t` "Iron Week"
  - `b3.r0.s` "Arjun missed · HP 100 → 80 → 90"
  - `b3.r0.r` "+43 SKR"
  - `b3.r1.t` "Read 20 pages"
  - `b3.r1.s` "You kept · HP 100"
  - `b3.r1.r` "safe"
  - `b3.r2.t` "Hydrate Week"
  - `b3.r2.s` "2 knocked out · 33 of 40 in"
  - `b3.r2.r` "still in"
  - `b4.btn.0` "Open Iron Week"
  - `b4.btn.1` "Got it"
- **Actions:**
  - row "Iron Week" → D2
  - row "Hydrate Week" → H3
  - button "Open Iron Week" → D2
  - button "Got it" → B1
- **Data:** recap {date, oaths[] {id, name, keptBy[], missedBy[], hpBefore, hpAfter, moneyDelta (to/from you)}} — shown once per day after 00:00 local
- **Entered from:** B1, N1

### + — + menu
- **Layout:** Bottom sheet over "Today"
- **Components (top→bottom):** Title, RowList, Note, ButtonRow
- **Copy:**
  - `b0.title` "Put something on the line."
  - `b1.r0.t` "Start an Oath"
  - `b1.r0.s` "Solo or with friends, SKR on it"
  - `b1.r1.t` "Join with code"
  - `b1.r1.s` "Paste, scan or open a link"
  - `b1.r2.t` "Create a Bounty"
  - `b1.r2.s` "Fund a public challenge"
  - `b2.text` "Group Oaths and Bounties need a verified Seeker."
  - `b3.btn.0` "Close"
- **Actions:**
  - row "Start an Oath" → C1
  - row "Join with code" → E1
  - row "Create a Bounty" → K1
  - button "Close" → back
- **Data:** seeker.verified (gates group & bounty rows)
- **Entered from:** B1, B2, B3, B4, D0, H1, H1·j, H1·c, I1

---

## N · Inbox

### N1 — Inbox
- **Layout:** NavBar "Inbox" · back · content depends on the user's current selections
- **Components (top→bottom):** KeeperPlacement, InboxList, Note
- **Keeper:** side — "4 things on the table. Claim first." · side — "Dev needs your vote. Be fair. Or don't." · side — "I sort these so you don't have to."
- **Copy:**
  - `b1.label` "NEEDS YOU · 4"
  - `b1.inv1.t` "Riya invited you to Dawn Run"
  - `b1.inv1.s` "7 days · 1,000 SKR each · Dev is in"
  - `b1.inv1.btn0` "Accept"
  - `b1.inv1.btn1` "Decline"
  - `b1.rev1.t` "Dev wants your vote"
  - `b1.rev1.s` "Iron Week · photo 2 failed 3 times · 41h left"
  - `b1.rev1.btn0` "Review photo"
  - `b1.clm1.t` "1,186 SKR ready to claim"
  - `b1.clm1.s` "Hydra 14 ended Sunday"
  - `b1.clm1.btn0` "Claim"
  - `b1.rm1.t` "Rematch Guitar Days?"
  - `b1.rm1.s` "Win back 500 SKR · closes in 6d 23h"
  - `b1.rm1.btn0` "See Rematch"
  - `b2.label` "NEW"
  - `b2.action` "Mark all read"
  - `b2.ng1.t` "Riya nudged you"
  - `b2.ng1.s` "Iron Week · photo 2 is still due"
  - `b2.rc1.t` "Yesterday, settled"
  - `b2.rc1.s` "Arjun missed · +43 SKR to you"
  - `b2.st1.t` "Hydrate Week started"
  - `b2.st1.s` "Day 1 is today · 40 in"
  - `b2.fl1.t` "Drift posted a new Bounty"
  - `b2.fl1.s` "Hydrate Week · 50,000 SKR pool"
  - `b3.text` "Only what needs you, or happened since you last looked."
- **Actions:**
  - inbox button "Accept" → E2 (marks inv1 done)
  - inbox button "Decline" → stay + toast "Invite declined" (marks inv1 done)
  - inbox item "Riya invited you to Dawn Run" → E2
  - inbox button "Review photo" → G1
  - inbox item "Dev wants your vote" → G1
  - inbox button "Claim" → J1
  - inbox item "1,186 SKR ready to claim" → J1
  - inbox button "See Rematch" → R1
  - inbox item "Rematch Guitar Days?" → R1
  - list action "Mark all read" → stay (marks ng1,rc1,st1,fl1 done)
  - inbox item "Riya nudged you" → F4 (marks ng1 done)
  - inbox item "Yesterday, settled" → B5 (marks rc1 done)
  - inbox item "Hydrate Week started" → H3 (marks st1 done)
  - inbox item "Drift posted a new Bounty" → H2 (marks fl1 done)
- **Other states / outcomes:** Clear everything → do:inv1,rev1,clm1,rm1,ng1,rc1,st1,fl1|
- **Data:** inbox[] {id, type, actor?, title, body, createdAt, needsAction, done, actions[] {label, route}}
- **Entered from:** B1, B2, B3, B4, D0, H1, H1·j, H1·c, I1

---

## C · Create an Oath

### C1 — Goal
- **Layout:** NavBar · StepBar 1/6 · close (✕)
- **Components (top→bottom):** Title, SentenceInput, KeeperPlacement, PinnedActions (1)
- **Keeper:** soft — "Make it something you'll actually do." · soft — "Small and daily beats big and never." · soft — "I hold you to every word. Choose well."
- **Copy:**
  - `b0.title` "What will you do\nevery day?"
  - `b0.sub` "Keep it small and specific. You'll prove it daily."
  - `b1.label` "Your Oath"
  - `b1.prefix` "Every day I will"
  - `b1.sug.0` "lift for 20 minutes"
  - `b1.sug.1` "read 20 pages"
  - `b1.sug.2` "drink 2 litres of water"
  - `b1.sug.3` "practise guitar for 30 min"
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → C2
- **Data:** draft.goal (string ≤ 60)
- **Entered from:** B3, +, D3, E3·code, E3·late, E3·elig, E3·skr, H4, I2, L3, L4·b, W3·ok, I2·p

### C2 — Object
- **Layout:** NavBar · StepBar 2/6 · back
- **Components (top→bottom):** Title, OptionGrid, Note, PinnedActions (1)
- **Copy:**
  - `b0.title` "What's in the photo?"
  - `b0.sub` "Both daily photos must show it, plus a hand gesture."
  - `b1.o0.t` "Dumbbell"
  - `b1.o1.t` "Book"
  - `b1.o2.t` "Water bottle"
  - `b1.o3.t` "Guitar"
  - `b1.o4.t` "Running shoe"
  - `b1.o5.t` "Plant"
  - `b1.o6.t` "Skipping rope"
  - `b1.o7.t` "Yoga mat"
  - `b2.text` "Checked by AI on our server, then deleted. Only a fingerprint is kept."
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → C3
- **Data:** draft.object (one of 8)
- **Entered from:** C1

### C3 — Length
- **Layout:** NavBar · StepBar 3/6 · back
- **Components (top→bottom):** Title, OptionGrid, Banner, PinnedActions (1)
- **Copy:**
  - `b0.title` "How long?"
  - `b0.sub` "Longer Oaths cost less per miss, but there are more days to keep."
  - `b1.o0.t` "3"
  - `b1.o0.s` "days · sprint"
  - `b1.o1.t` "7"
  - `b1.o1.s` "days · a week"
  - `b1.o2.t` "14"
  - `b1.o2.s` "days · the real test"
  - `b2.title` "Ends Wed 15 Oct"
  - `b2.sub` "Day 1 starts when the creator presses Start."
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → C4
- **Data:** draft.length (3|7|14)
- **Entered from:** C2

### C4 — Solo or group, and stake
- **Layout:** NavBar · StepBar 4/6 · back
- **Components (top→bottom):** Title, OptionGrid, MonoLabel, Banner, PinnedActions (1)
- **Copy:**
  - `b0.title` "Who's in, and\nwhat's on it?"
  - `b1.o0.t` "Solo"
  - `b1.o0.s` "Just you. Misses hit harder."
  - `b1.o1.t` "Group"
  - `b1.o1.s` "Friends join by link. Needs a Seeker."
  - `b2.text` "STAKE PER PERSON"
  - `b3.o0.t` "500"
  - `b3.o0.s` "≈ $5"
  - `b3.o1.t` "1,000"
  - `b3.o1.s` "≈ $10"
  - `b3.o2.t` "2,500"
  - `b3.o2.s` "≈ $25"
  - `b4.title` "First miss costs 143 SKR"
  - `b4.sub` "Then 214, then 321. Each miss costs 1.5× the last."
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → C5 or C6
- **Data:** draft.mode ("solo"|"group"), draft.stake (500|1000|2500), skr.usdRate, computed missCost[0..2]
- **Entered from:** C3, M4

### C5 — Review mode
- **Layout:** NavBar · StepBar 5/6 · back
- **Components (top→bottom):** Title, OptionGrid, PinnedActions (1)
- **Copy:**
  - `b0.title` "If the AI says no?"
  - `b0.sub` "You choose once. Everyone who joins plays by it."
  - `b1.o0.t` "AI only"
  - `b1.o0.s` "A failed check is final. Simple and strict."
  - `b1.o1.t` "AI + group review"
  - `b1.o1.s` "After 3 failed photo-2 checks, the group votes. Majority approves; a tie rejects."
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → C6
- **Data:** draft.reviewMode ("ai"|"aiGroup")
- **Entered from:** C4, C4 when Group is selected

### C6 — Review terms
- **Layout:** NavBar · StepBar 6/6 · back · content depends on the user's current selections
- **Components (top→bottom):** Title, Breakdown, RowList, PinnedActions (1)
- **Copy:**
  - `b0.title` "Read it like\na contract."
  - `b1.row0.l` "Goal"
  - `b1.row0.v` "Every day I will lift for 20 minutes"
  - `b1.row1.l` "Object"
  - `b1.row1.v` "Dumbbell"
  - `b1.row2.l` "Length"
  - `b1.row2.v` "7 days"
  - `b1.row3.l` "Stake"
  - `b1.row3.v` "1,000 SKR each"
  - `b1.row4.l` "Review"
  - `b1.row4.v` "AI + group review"
  - `b2.label` "THE RULES"
  - `b2.r0.t` "HP starts at 100"
  - `b2.r0.s` "−20 for each member who misses, then +10 heal."
  - `b2.r1.t` "At 0 HP it breaks"
  - `b2.r1.s` "Everyone loses the whole pot."
  - `b2.r2.t` "One miss costs 143 SKR"
  - `b2.r2.s` "Then 214, 321… paid to whoever kept."
  - `b2.r3.t` "10% fee"
  - `b2.r3.s` "KEPT keeps 10% of lost SKR. Kept SKR is never charged."
  - `pin.0` "Sign & stake"
- **Actions:**
  - pinned "Sign & stake" → C7
- **Data:** draft (all), computed {missCost[], fee:0.10, hpRules}
- **Entered from:** C4, C5, C7·no, C7·fail

### C7 — Signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Confirm in your wallet"
  - `b2.sub` "Staking 1,000 SKR into Iron Week."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to C7·ok after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Rejected → C7·no · Failed → C7·fail · Not enough SOL → M3 · Not enough SKR → M4
- **Data:** tx {status:"pending"}
- **Entered from:** C6, C7·no, C7·fail

### C7·ok — Signed · success
- **Layout:** Plain (no bar) · beam · fx coins · pops: 1,000 staked
- **Components (top→bottom):** SignStatus, Title, PinnedActions (2)
- **Copy:**
  - `b1.chip` "1,000 SKR staked"
  - `b2.title` "Sworn.\n1,000 SKR on the table."
  - `b2.sub` "Iron Week is ready. Bring your people, then press Start."
  - `pin.0` "Invite your crew"
  - `pin.1` "Solo? Go to the Oath"
- **Actions:**
  - pinned "Invite your crew" → C8
  - pinned "Solo? Go to the Oath" → D2
- **Data:** oath.id, oath.mode
- **Entered from:** C7

### C7·no — Signed · rejected
- **Layout:** Plain (no bar)
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** soft — "Cold feet happens."
- **Copy:**
  - `b2.title` "You backed out.\nNothing was charged."
  - `b2.sub` "Your SKR never left your wallet."
  - `pin.0` "Try again"
  - `pin.1` "Edit terms"
- **Actions:**
  - pinned "Try again" → C7
  - pinned "Edit terms" → C6
- **Data:** —
- **Entered from:** C7, D1·xs, E2·s, R2, K5·p, W3·s

### C7·fail — Signed · failed
- **Layout:** Plain (no bar)
- **Components (top→bottom):** SignStatus, Title, PinnedActions (2)
- **Copy:**
  - `b1.chip` "Transaction failed"
  - `b2.title` "The transaction failed."
  - `b2.sub` "A network hiccup. Your SKR didn't move."
  - `pin.0` "Retry"
  - `pin.1` "Back to terms"
- **Actions:**
  - pinned "Retry" → C7
  - pinned "Back to terms" → C6
- **Data:** tx.error
- **Entered from:** C7, D1·go

### C8 — Invite
- **Layout:** NavBar "Invite" · close (✕)
- **Components (top→bottom):** Title, QRCard, ButtonRow, MonoLabel, SeatSlots, PinnedActions (1)
- **Copy:**
  - `b0.title` "Bring your people."
  - `b0.sub` "Everyone stakes 1,000 SKR. It starts when you press Start."
  - `b1.code` "IRON-7K2Q"
  - `b1.link` "kept.app/o/IRON-7K2Q"
  - `b2.btn.0` "Copy link"
  - `b2.btn.1` "Share"
  - `b3.text` "JOINED SO FAR · 2"
  - `b4.seat0` "joined"
  - `b4.seat1` "joined"
  - `pin.0` "Open the Oath"
- **Actions:**
  - button "Copy link" → toast "Link copied"
  - button "Share" → toast "Share sheet opened"
  - pinned "Open the Oath" → D1
- **Data:** invite {code, link, qr}, oath.members[] {avatar, name}, oath.capacity
- **Entered from:** C7·ok, D1

---

## D · Oaths

### D0 — Oaths list
- **Layout:** Tab screen (oaths) · AppHeader "Oaths" · TabBar + PlusButton
- **Components (top→bottom):** KeeperPlacement, MonoLabel, OathCard, RowList
- **Keeper:** side — "Iron Week needs your photo 2." · side — "Arjun's wobbling. 3-to-1 he misses." · side — "Two Oaths, one empty seat. Fill it."
- **Copy:**
  - `b1.text` "ACTIVE · 2"
  - `b2.name` "Iron Week"
  - `b2.meta` "Group · Day 3/7"
  - `b2.tag.0` "1,043 SKR"
  - `b2.tag.1` "Arjun pending"
  - `b3.name` "Read 20 pages"
  - `b3.meta` "Solo · Day 9/14"
  - `b3.tag.0` "500 SKR"
  - `b3.tag.1` "Kept today"
  - `b4.label` "WAITING TO START"
  - `b4.r0.t` "Iron Week (draft)"
  - `b4.r0.s` "Waiting to start · 2 of 4 in"
  - `b4.r0.r` "Open"
  - `b5.label` "RECENTLY FINISHED"
  - `b5.r0.t` "Hydra 14"
  - `b5.r0.s` "Ended Sun · claim ready"
  - `b5.r0.r` "+186"
  - `b5.r1.t` "Guitar Days"
  - `b5.r1.s` "Broke on day 6 · Rematch open"
  - `b5.r1.r` "−1,000"
  - `b6.r0.t` "All history"
  - `b6.r0.s` "50 Oaths · 41 kept · 9 broken"
- **Actions:**
  - card tap "(card header)" → D2
  - card tap "(card header)" → D2
  - row "Iron Week (draft)" → D1
  - row "Hydra 14" → D4
  - row "Guitar Days" → D3
  - row "All history" → D5
- **Data:** oaths.active[] {id, name, object, day, length, hp, myBalance, todayStatus}, invitations[] {oathId, from, name, length, stake}, open[] {oathId, joined, capacity}, history.count
- **Entered from:** B1, B2, B3, B4, D1·xs, H1, H1·j, H1·c, I1

### D1 — Open · creator
- **Layout:** NavBar "Iron Week" · back
- **Components (top→bottom):** ChipRow, Title, MonoLabel, SeatSlots, RowList, PinnedActions (2)
- **Copy:**
  - `b0.chip.0` "Waiting to start"
  - `b0.chip.1` "7 days"
  - `b0.chip.2` "1,000 SKR each"
  - `b0.chip.3` "AI + group review"
  - `b1.title` "Every day I will\nlift for 20 minutes."
  - `b1.sub` "Dumbbell + a hand gesture, two photos a day."
  - `b2.text` "JOINED · 3 OF 4"
  - `b3.seat0` "91%"
  - `b3.seat1` "94%"
  - `b3.seat2` "88%"
  - `b4.r0.t` "Copy invite link"
  - `b4.r0.s` "kept.app/o/IRON-7K2Q"
  - `b4.r1.t` "Show QR code"
  - `b4.r1.s` "Friends scan to join"
  - `pin.0` "Start Iron Week"
  - `pin.1` "Cancel Oath"
- **Actions:**
  - row "Copy invite link" → toast "Link copied"
  - row "Show QR code" → C8
  - pinned "Start Iron Week" → D1·go
  - pinned "Cancel Oath" → D1·x
- **Other states / outcomes:** View as a member → D1·m
- **Data:** oath {id, goal, object, length, stake, reviewMode, status:"open", creatorId, members[] {id, avatar, name, keptRate, keptDays}}, me.isCreator
- **Entered from:** C8, D0

### D1·m — Open · member
- **Layout:** NavBar "Iron Week" · back
- **Components (top→bottom):** ChipRow, Title, Banner, SeatSlots, PinnedActions (1)
- **Copy:**
  - `b0.chip.0` "Waiting to start"
  - `b0.chip.1` "7 days"
  - `b0.chip.2` "1,000 SKR staked"
  - `b1.title` "Every day I will\nlift for 20 minutes."
  - `b2.title` "Riya starts it"
  - `b2.sub` "Day 1 begins when she presses Start. You'll get a notification."
  - `b3.seat0` "94%"
  - `b3.seat1` "91%"
  - `b3.seat2` "88%"
  - `pin.0` "Leave · get 1,000 SKR back"
- **Actions:**
  - pinned "Leave · get 1,000 SKR back" → toast "You left. 1,000 SKR returned"
- **Data:** same as D1, me.isCreator=false, oath.canLeave
- **Entered from:** D1, E2·s

### D1·x — Cancel confirm
- **Layout:** Bottom sheet over "Iron Week"
- **Components (top→bottom):** Title, ButtonRow
- **Copy:**
  - `b0.title` "Cancel Iron Week?"
  - `b0.sub` "Riya and Dev get their 1,000 SKR back. So do you. This can't be undone."
  - `b1.btn.0` "Cancel Oath"
  - `b1.btn.1` "Keep it"
- **Actions:**
  - button "Cancel Oath" → D1·xs
  - button "Keep it" → back
- **Data:** oath.members.length, oath.stake
- **Entered from:** D1

### D1·xs — Cancel · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Confirm the cancel"
  - `b2.sub` "Refunding 3,000 SKR to 3 Keepers."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to D0 after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Rejected → C7·no
- **Data:** tx.status
- **Entered from:** D1·x

### D1·go — Start · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Start Iron Week"
  - `b2.sub` "Locks 4,000 SKR. Day 1 begins now."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to D2 after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Failed → C7·fail
- **Data:** tx.status
- **Entered from:** D1

### D2 — Active
- **Layout:** NavBar "Iron Week" · right "Day 3/7" · back
- **Components (top→bottom):** HPPanel, BodyText, KeeperPlacement, DayMemberGrid, ChipRow, Banner, RowList, PinnedActions (2)
- **Keeper:** side — "Arjun's still on the couch. 3-to-1 he misses."
- **Copy:**
  - `b0.note` "Arjun missed day 2: −20, then +10 heal."
  - `b1.text` "9h 18m left today · first miss −143 SKR"
  - `b4.chip.0` "Riya 1-to-9"
  - `b4.chip.1` "Arjun 3-to-1 to miss"
  - `b4.chip.2` "Dev in review"
  - `b5.title` "Dev asked for a review"
  - `b5.sub` "Photo 2 failed 3 times. Your vote counts."
  - `b6.label` "KEEPERS"
  - `b6.r0.t` "You"
  - `b6.r0.s` "91% · 64 days"
  - `b6.r0.r` "1,043 SKR"
  - `b6.r0.rs` "live balance"
  - `b6.r1.t` "Riya"
  - `b6.r1.s` "94% · 71 days"
  - `b6.r1.r` "1,043 SKR"
  - `b6.r1.rs` "live balance"
  - `b6.r2.t` "Arjun"
  - `b6.r2.s` "78% · 40 days"
  - `b6.r2.r` "857 SKR"
  - `b6.r2.rs` "missed day 2"
  - `b6.r3.t` "Dev"
  - `b6.r3.s` "88% · 52 days"
  - `b6.r3.r` "1,043 SKR"
  - `b6.r3.rs` "live balance"
  - `b7.title` "If Arjun misses today"
  - `b7.sub` "You +43 · Riya +43 · Dev +43 · fee 14 SKR"
  - `pin.0` "Take photo 2"
  - `pin.1` "Nudge Arjun"
- **Actions:**
  - banner "Dev asked for a review" → G1
  - row "Riya" → I2
  - row "Arjun" → I2
  - row "Dev" → I2
  - pinned "Take photo 2" → F4
  - pinned "Nudge Arjun" → toast "Nudged Arjun"
- **Other states / outcomes:** HP low → D2·low · HP hits 0 → D3 · Oath ends → D4
- **Data:** oath {id, name, day, length, hp, hpLostToday, secondsToReset, reviewMode, members[] {id, name, avatar, days[] (k|m|p|h|r|f), balance (estimate), keptRate, keptDays, odds?, todayStatus}, reviewRequests[] {id, by, expiresAt}, me.missCostNext, creatorPayoutPreview?}
- **Entered from:** B1, B2, B4, B5, C7·ok, D0, D1·go, E3·in, G1, G3, G3·no, I2, I2·p

### D2·low — Active · HP low
- **Layout:** NavBar "Iron Week" · right "Day 5/7" · back · tone red
- **Components (top→bottom):** HPPanel, KeeperPlacement, DayMemberGrid, RowList, PinnedActions (2)
- **Keeper:** stern — "Don't look at me. Look at Arjun."
- **Copy:**
  - `b0.warn` "One more miss breaks it. Everyone loses everything."
  - `b3.label` "KEEPERS"
  - `b3.r0.t` "You"
  - `b3.r0.s` "91% · 64 days"
  - `b3.r0.r` "1,043 SKR"
  - `b3.r0.rs` "live balance"
  - `b3.r1.t` "Riya"
  - `b3.r1.s` "94% · 71 days"
  - `b3.r1.r` "1,043 SKR"
  - `b3.r1.rs` "live balance"
  - `b3.r2.t` "Arjun"
  - `b3.r2.s` "78% · 40 days"
  - `b3.r2.r` "642 SKR"
  - `b3.r2.rs` "2 misses"
  - `b3.r3.t` "Dev"
  - `b3.r3.s` "88% · 52 days"
  - `b3.r3.r` "900 SKR"
  - `b3.r3.rs` "missed day 3"
  - `pin.0` "Take photo 2"
  - `pin.1` "Nudge Arjun and Dev"
- **Actions:**
  - row "Riya" → I2
  - row "Arjun" → I2
  - row "Dev" → I2
  - pinned "Take photo 2" → F4
  - pinned "Nudge Arjun and Dev" → toast "Nudged 2 Keepers"
- **Data:** same as D2 (hp ≤ 20) + members.pendingToday[]
- **Entered from:** D2

### D3 — Broken
- **Layout:** NavBar "Guitar Days" · back · tone ember · fx embers
- **Components (top→bottom):** HPPanel, Title, DayMemberGrid, Breakdown, OathCard, PinnedActions (2)
- **Copy:**
  - `b0.note` "Broke at midnight after day 6."
  - `b1.title` "The Oath is broken."
  - `b1.sub` "Dev missed day 5. Arjun missed day 6. HP hit 0, and the whole pot burned."
  - `b3.label` "STAKES LOST"
  - `b3.row0.l` "You"
  - `b3.row0.v` "−1,000 SKR"
  - `b3.row1.l` "Riya"
  - `b3.row1.v` "−1,000 SKR"
  - `b3.row2.l` "Arjun"
  - `b3.row2.v` "−1,000 SKR"
  - `b3.row3.l` "Dev"
  - `b3.row3.v` "−1,000 SKR"
  - `b4.name` "Rematch available"
  - `b4.meta` "Same goal · same object · 7 days"
  - `b4.line` "Keep every day and it doesn't break: win back 500 SKR, half of what you lost."
  - `b4.tag.0` "6d 23h left"
  - `b4.tag.1` "Riya joined"
  - `pin.0` "Rematch · win back 500"
  - `pin.1` "Start a new Oath"
- **Actions:**
  - card tap "(card header)" → R1
  - pinned "Rematch · win back 500" → R1
  - pinned "Start a new Oath" → C1
- **Data:** oath {status:"broken", brokenDay, hp:0, members[] {days[], lost}}, rematch {expiresAt, joined[], recoverable (50% of my loss)}
- **Entered from:** D0, D2, D5

### D4 — Ended
- **Layout:** NavBar "Hydra 14" · back
- **Components (top→bottom):** ChipRow, Title, DayMemberGrid, RowList, PinnedActions (1)
- **Copy:**
  - `b0.chip.0` "Ended Sun 5 Oct"
  - `b0.chip.1` "HP 70"
  - `b1.title` "Kept by 3 of 4."
  - `b1.sub` "Arjun slipped twice. His SKR went to everyone who kept."
  - `b3.label` "FINAL BALANCES"
  - `b3.r0.t` "You"
  - `b3.r0.s` "start 1,000 · lost 0 · won +186"
  - `b3.r0.r` "1,186"
  - `b3.r0.rs` "SKR"
  - `b3.r1.t` "Riya"
  - `b3.r1.s` "start 1,000 · lost 0 · won +186"
  - `b3.r1.r` "1,186"
  - `b3.r1.rs` "SKR"
  - `b3.r2.t` "Dev"
  - `b3.r2.s` "start 1,000 · lost 0 · won +186"
  - `b3.r2.r` "1,186"
  - `b3.r2.rs` "SKR"
  - `b3.r3.t` "Arjun"
  - `b3.r3.s` "start 1,000 · lost −179 · fee −18"
  - `b3.r3.r` "821"
  - `b3.r3.rs` "SKR"
  - `pin.0` "Claim 1,186 SKR"
- **Actions:**
  - pinned "Claim 1,186 SKR" → J1
- **Data:** settlement[] per member {start, lost, won, fee, final}, me.claimable
- **Entered from:** D0, D2, D5

### D5 — Oath history
- **Layout:** NavBar "Oath history" · back · content depends on the user's current selections
- **Components (top→bottom):** SearchBar, Segmented, Banner, RowList
- **Copy:**
  - `b0.placeholder` "Search 50 Oaths"
  - `b1.seg.0` "All"
  - `b1.seg.1` "Kept"
  - `b1.seg.2` "Broken"
  - `b1.seg.3` "Rematch"
  - `b2.title` "50 finished · 41 kept · 9 broken"
  - `b2.sub` "+3,420 SKR won · −2,600 SKR lost, all time"
  - `b3.label` "OCTOBER"
  - `b3.r0.t` "Hydra 14"
  - `b3.r0.s` "Kept by 3 of 4 · ended Sun 5"
  - `b3.r0.r` "+186"
  - `b3.r1.t` "Pages Sprint · Rematch"
  - `b3.r1.s` "Kept every day · recovered 500"
  - `b3.r1.r` "+500"
  - `b3.r2.t` "Guitar Days"
  - `b3.r2.s` "Broke on day 6"
  - `b3.r2.r` "−1,000"
  - `b4.label` "SEPTEMBER"
  - `b4.r0.t` "Iron Week"
  - `b4.r0.s` "Kept · 7 of 7"
  - `b4.r0.r` "+72"
  - `b4.r1.t` "Dawn Run"
  - `b4.r1.s` "Solo · kept 7 of 7"
  - `b4.r1.r` "±0"
  - `b4.r2.t` "Cold Showers"
  - `b4.r2.s` "Solo · broke on day 4"
  - `b4.r2.r` "−500"
  - `b4.r3.t` "Read 20 pages"
  - `b4.r3.s` "Kept · missed 1 day"
  - `b4.r3.r` "+12"
  - `b4.r4.t` "Mat Mornings"
  - `b4.r4.s` "Kept by 2 of 3"
  - `b4.r4.r` "+140"
  - `b5.r0.t` "Load older"
  - `b5.r0.s` "August and earlier · 42 more"
- **Actions:**
  - search "Search" → toast "Search opened"
  - row "Hydra 14" → D4
  - row "Pages Sprint · Rematch" → R4
  - row "Guitar Days" → D3
  - row "Iron Week" → D4
  - row "Dawn Run" → D4
  - row "Cold Showers" → D3
  - row "Read 20 pages" → D4
  - row "Mat Mornings" → D4
  - row "Load older" → toast "Loading August…"
- **Data:** history[] paginated {id, name, month, result, delta, icon, status:"kept"|"broken"|"rematch"} + filters {status, sort}
- **Entered from:** D0, I1, I4

---

## E · Join an Oath

### E1 — Enter invite
- **Layout:** NavBar "Join an Oath" · close (✕)
- **Components (top→bottom):** Title, ProofCamera, SentenceInput, ButtonRow, PinnedActions (1)
- **Copy:**
  - `b0.title` "Got an invite?"
  - `b0.sub` "Paste the code, scan the QR, or open the link."
  - `b1.label` "Point at the QR code"
  - `b2.label` "Or type the code"
  - `b2.sug.0` "IRON-7K2Q"
  - `b3.btn.0` "Paste"
  - `pin.0` "Find Oath"
- **Actions:**
  - button "Paste" → toast "Pasted IRON-7K2Q"
  - pinned "Find Oath" → E2
- **Other states / outcomes:** Invalid code → E3·code · Already started → E3·late · Already joined → E3·in · Not eligible → E3·elig · Not enough SKR → E3·skr
- **Data:** invite.input (code|link|qr)
- **Entered from:** +, E3·code, E3·late, E3·in, E3·elig

### E2 — Oath preview
- **Layout:** NavBar "Invite" · back
- **Components (top→bottom):** MonoLabel, OathCard, RowList, Breakdown, PinnedActions (1)
- **Copy:**
  - `b0.text` "RIYA INVITED YOU"
  - `b1.name` "Iron Week"
  - `b1.meta` "by Riya · 7 days · AI + group review"
  - `b1.line` "Every day I will lift for 20 minutes."
  - `b1.tag.0` "1,000 SKR each"
  - `b1.tag.1` "Starts when Riya says"
  - `b1.float` "94% kept rate"
  - `b2.label` "KEEPERS · KEPT RATE"
  - `b2.r0.t` "Riya"
  - `b2.r0.s` "Creator"
  - `b2.r0.r` "94%"
  - `b2.r0.rs` "71 days"
  - `b2.r1.t` "Dev"
  - `b2.r1.s` "Joined"
  - `b2.r1.r` "88%"
  - `b2.r1.rs` "52 days"
  - `b2.r2.t` "Arjun"
  - `b2.r2.s` "Joined"
  - `b2.r2.r` "78%"
  - `b2.r2.rs` "40 days"
  - `b3.label` "THE RULES"
  - `b3.row0.l` "HP"
  - `b3.row0.v` "100 · −20 per miss · +10 a day"
  - `b3.row1.l` "First miss"
  - `b3.row1.v` "−143 SKR, then 1.5×"
  - `b3.row2.l` "At 0 HP"
  - `b3.row2.v` "Everyone loses the pot"
  - `b3.row3.l` "Fee"
  - `b3.row3.v` "10% of lost SKR"
  - `pin.0` "Join & stake 1,000 SKR"
- **Actions:**
  - row "Riya" → I2
  - row "Dev" → I2
  - row "Arjun" → I2
  - pinned "Join & stake 1,000 SKR" → E2·s (marks inv1 done)
- **Data:** invitePreview {oath (goal, object, length, stake, reviewMode, hpRules, missCost[]), members[] {name, avatar, keptRate}, invitedBy}, me.balance, seeker.verified
- **Entered from:** E1, I2, N1

### E2·s — Join · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Join Iron Week"
  - `b2.sub` "Staking 1,000 SKR alongside Riya, Dev and Arjun."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to D1·m after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Rejected → C7·no · Not enough SKR → E3·skr
- **Data:** tx.status
- **Entered from:** E2

### E3·code — Invalid code
- **Layout:** NavBar "Join an Oath" · back
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** shocked — "Nice try."
- **Copy:**
  - `b2.title` "That code doesn't exist."
  - `b2.sub` "Check for typos. Codes look like IRON-7K2Q."
  - `pin.0` "Try again"
  - `pin.1` "Start your own"
- **Actions:**
  - pinned "Try again" → E1
  - pinned "Start your own" → C1
- **Data:** —
- **Entered from:** E1

### E3·late — Already started
- **Layout:** NavBar "Join an Oath" · back
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** side — "You snooze, you watch."
- **Copy:**
  - `b2.title` "Too late. Iron Week started."
  - `b2.sub` "Oaths lock on day 1 so nobody joins halfway. Start your own."
  - `pin.0` "Start your own"
  - `pin.1` "Back"
- **Actions:**
  - pinned "Start your own" → C1
  - pinned "Back" → E1
- **Data:** oath.startedAt
- **Entered from:** E1

### E3·in — Already joined
- **Layout:** NavBar "Join an Oath" · back
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** wink — "Eager. I like it."
- **Copy:**
  - `b2.title` "You're already in."
  - `b2.sub` "You staked 1,000 SKR on Iron Week on Monday."
  - `pin.0` "Open the Oath"
  - `pin.1` "Back"
- **Actions:**
  - pinned "Open the Oath" → D2
  - pinned "Back" → E1
- **Data:** oath.id
- **Entered from:** E1

### E3·elig — Not eligible
- **Layout:** NavBar "Join an Oath" · back
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** soft — "Rules are rules, friend."
- **Copy:**
  - `b2.title` "Group Oaths need a verified Seeker."
  - `b2.sub` "Your wallet has no Genesis token. Solo Oaths are still yours."
  - `pin.0` "Start a solo Oath"
  - `pin.1` "Back"
- **Actions:**
  - pinned "Start a solo Oath" → C1
  - pinned "Back" → E1
- **Data:** seeker.verified=false
- **Entered from:** E1

### E3·skr — Not enough SKR
- **Layout:** NavBar "Join an Oath" · back
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (2)
- **Keeper:** bored — "Pockets a bit light."
- **Copy:**
  - `b2.title` "You need 1,000 SKR."
  - `b2.sub` "You have 620 SKR. Grab test SKR from the faucet in Profile."
  - `pin.0` "Open the faucet"
  - `pin.1` "Start your own"
- **Actions:**
  - pinned "Open the faucet" → I4
  - pinned "Start your own" → C1
- **Data:** me.balance, oath.stake
- **Entered from:** E1, E2·s

---

## R · Rematch

### R1 — Rematch offer
- **Layout:** NavBar "Rematch" · close (✕) · tone ember
- **Components (top→bottom):** KeeperPlacement, Title, Breakdown, MonoLabel, SeatSlots, Note, PinnedActions (2)
- **Keeper:** smug — "Run it back?"
- **Copy:**
  - `b0.chip.0` "+500 SKR"
  - `b0.chip.1` "6d 23h left"
  - `b1.title` "Win back 500 SKR."
  - `b1.sub` "Keep every day of the Rematch, and don't let it break. You get back half of what Guitar Days cost you."
  - `b2.row0.l` "Original"
  - `b2.row0.v` "Guitar Days · 7 days · Guitar"
  - `b2.row1.l` "You lost"
  - `b2.row1.v` "−1,000 SKR"
  - `b2.row2.l` "You can win back"
  - `b2.row2.v` "+500 SKR"
  - `b2.row3.l` "New stake"
  - `b2.row3.v` "1,000 SKR"
  - `b2.row4.l` "Window"
  - `b2.row4.v` "6d 23h to start"
  - `b3.text` "IN THE REMATCH · 2 OF 4"
  - `b4.seat0` "joined"
  - `b4.seat1` "joined"
  - `b4.seat2` "you?"
  - `b4.seat3` "not yet"
  - `b5.text` "One Rematch per broken Oath. A Rematch can't be rematched."
  - `pin.0` "Join Rematch"
  - `pin.1` "Not now"
- **Actions:**
  - pinned "Join Rematch" → R2 (marks rm1 done)
  - pinned "Not now" → back
- **Data:** rematch {sourceOathId, goal, object, length, stake, myLoss, recoverable, expiresAt, joined[] {id, name}}
- **Entered from:** D3, L3, L4·b, N1

### R2 — Rematch · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Stake again"
  - `b2.sub` "1,000 SKR into the Guitar Days Rematch."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to R3 after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Rejected → C7·no
- **Data:** tx.status
- **Entered from:** R1

### R3 — Rematch lobby
- **Layout:** NavBar "Rematch lobby" · back
- **Components (top→bottom):** ChipRow, Title, SeatSlots, RowList, PinnedActions (2)
- **Copy:**
  - `b0.chip.0` "Rematch"
  - `b0.chip.1` "Guitar Days · 7 days"
  - `b1.title` "3 of 4 back\nat the table."
  - `b1.sub` "Anyone can start once 2 or more have joined."
  - `b2.seat0` "in"
  - `b2.seat1` "in"
  - `b2.seat2` "in"
  - `b2.seat3` "waiting"
  - `b3.label` "STILL OUT"
  - `b3.r0.t` "Arjun"
  - `b3.r0.s` "Hasn't joined · window 6d 22h"
  - `b3.r0.r` "Nudge"
  - `pin.0` "Start the Rematch"
  - `pin.1` "Invite the rest"
- **Actions:**
  - row "Arjun" → toast "Nudged Arjun"
  - pinned "Start the Rematch" → R·act
  - pinned "Invite the rest" → toast "Invite sent to Arjun"
- **Data:** rematch.joined[], rematch.originalMembers[], rematch.canStart (joined ≥ 2 or creator)
- **Entered from:** R2

### R·act — Rematch, active
- **Layout:** NavBar "Guitar Days" · right "Day 3/7" · back
- **Components (top→bottom):** ChipRow, HPPanel, KeeperPlacement, DayMemberGrid, RowList, PinnedActions (1)
- **Keeper:** side — "Riya burned her recovery. Don't be Riya."
- **Copy:**
  - `b0.chip.0` "Rematch"
  - `b0.chip.1` "No more rematches"
  - `b1.note` "Riya missed day 2: −20, then +10 heal."
  - `b4.label` "KEEPERS"
  - `b4.r0.t` "You"
  - `b4.r0.s` "Recovery: 500 SKR on the line"
  - `b4.r0.r` "1,043"
  - `b4.r0.rs` "SKR"
  - `b4.r1.t` "Riya"
  - `b4.r1.s` "Recovery lost · missed day 2"
  - `b4.r1.r` "857"
  - `b4.r1.rs` "SKR"
  - `b4.r2.t` "Dev"
  - `b4.r2.s` "Recovery: 500 SKR on the line"
  - `b4.r2.r` "1,043"
  - `b4.r2.rs` "SKR"
  - `pin.0` "Prove today"
- **Actions:**
  - pinned "Prove today" → F1
- **Other states / outcomes:** Rematch kept → L6 · Result: recovery lost → R4·lost
- **Data:** same as D2 + member.recoveryAtStake, member.recoveryLost
- **Entered from:** R3

### R4 — Rematch result
- **Layout:** NavBar "Rematch result" · close (✕)
- **Components (top→bottom):** Title, Breakdown, Banner, PinnedActions (1)
- **Copy:**
  - `b0.title` "Rematch kept."
  - `b0.sub` "You kept all 7 days. The Rematch held."
  - `b1.row0.l` "Start"
  - `b1.row0.v` "1,000"
  - `b1.row1.l` "Lost"
  - `b1.row1.v` "0"
  - `b1.row2.l` "Won from Riya"
  - `b1.row2.v` "+129"
  - `b1.row3.l` "Fee"
  - `b1.row3.v` "0"
  - `b1.row4.l` "Recovered from Guitar Days"
  - `b1.row4.v` "+500"
  - `b1.row5.l` "Final"
  - `b1.row5.v` "1,629 SKR"
  - `b2.title` "+500 SKR recovered from your broken Oath"
  - `b2.sub` "Half of what Guitar Days cost you."
  - `pin.0` "Claim 1,629 SKR"
- **Actions:**
  - pinned "Claim 1,629 SKR" → J1
- **Data:** settlement + recovered
- **Entered from:** D5

### R4·lost — Rematch result · recovery lost
- **Layout:** NavBar "Rematch result" · close (✕)
- **Components (top→bottom):** Title, Breakdown, Banner, PinnedActions (1)
- **Copy:**
  - `b0.title` "Rematch survived.\nRecovery didn't."
  - `b1.row0.l` "Start"
  - `b1.row0.v` "1,000"
  - `b1.row1.l` "Lost (day 2)"
  - `b1.row1.v` "−143"
  - `b1.row2.l` "Won"
  - `b1.row2.v` "+86"
  - `b1.row3.l` "Fee"
  - `b1.row3.v` "−14"
  - `b1.row4.l` "Recovered"
  - `b1.row4.v` "0"
  - `b1.row5.l` "Final"
  - `b1.row5.v` "929 SKR"
  - `b2.title` "Recovery lost: you missed day 2"
  - `b2.sub` "Only Keepers who keep every day of a Rematch get the 50% back."
  - `pin.0` "Claim 929 SKR"
- **Actions:**
  - pinned "Claim 929 SKR" → J1
- **Data:** settlement + recoveryLostDay
- **Entered from:** R·act

---

## F · Daily proof

### F1·perm — Camera permission
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** ProofCamera, Title, PinnedActions (2)
- **Copy:**
  - `b1.label` "Camera is off"
  - `b2.title` "KEPT needs your camera."
  - `b2.sub` "Two photos a day. Checked by AI on our server, then deleted. Only a fingerprint is kept."
  - `pin.0` "Allow camera"
  - `pin.1` "Not now"
- **Actions:**
  - pinned "Allow camera" → F1
  - pinned "Not now" → back
- **Data:** camera.permission
- **Entered from:** F1

### F1 — Photo 1 of 2
- **Layout:** NavBar "Iron Week · photo 1 of 2" · close (✕)
- **Components (top→bottom):** ProofCamera, ChipRow, Shutter
- **Copy:**
  - `b0.label` "Dumbbell + victory sign"
  - `b1.chip.0` "Challenge expires 4:52"
- **Actions:**
  - shutter "Shutter" → F2
- **Other states / outcomes:** First time: permission → F1·perm · Challenge expired → F2c
- **Data:** challenge {id, oathId, photo:1, object, gesture, expiresAt}
- **Entered from:** B1, B4, R·act, F1·perm, F2a, F2c, H1·j, H3

### F2 — Checking
- **Layout:** NavBar "Iron Week · photo 1 of 2" · back
- **Components (top→bottom):** ProofCamera, KeeperPlacement
- **Keeper:** neutral — "Hold still. I'm judging."
- **Copy:**
  - `b0.label` "Checking…"
- **Auto:** advances to F3 after 2000 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Fails → F2a · Checker down → F2b · Expired → F2c
- **Data:** check {status:"checking"}
- **Entered from:** F1, F2b

### F2a — Failed
- **Layout:** NavBar "Iron Week · photo 1 of 2" · close (✕)
- **Components (top→bottom):** ProofCamera, KeeperPlacement, PinnedActions (1)
- **Keeper:** soft — "Close. Two fingers, like you mean it."
- **Copy:**
  - `b0.label` "Couldn't see a victory sign"
  - `pin.0` "Try again"
- **Actions:**
  - pinned "Try again" → F1
- **Data:** check {status:"failed", reason}
- **Entered from:** F2, F4·chk

### F2b — Check unavailable
- **Layout:** NavBar "Iron Week" · close (✕)
- **Components (top→bottom):** KeeperPlacement, Title, MoneyMoment, PinnedActions (1)
- **Keeper:** bored — "The checker's napping. Not your fault."
- **Copy:**
  - `b2.title` "We can't check photos\nright now."
  - `b2.sub` "Your photo is saved. Retry in a minute. You still have time."
  - `b3.value` "14:41:52"
  - `b3.caption` "left today"
  - `pin.0` "Retry check"
- **Actions:**
  - pinned "Retry check" → F2
- **Data:** check {status:"unavailable"}, today.secondsToReset
- **Entered from:** F2

### F2c — Challenge expired
- **Layout:** NavBar "Iron Week" · close (✕)
- **Components (top→bottom):** Title, ProofCamera, PinnedActions (1)
- **Copy:**
  - `b0.title` "That challenge expired."
  - `b0.sub` "Challenges last 5 minutes, so nobody reuses old photos. Here's a fresh one."
  - `b1.label` "New: dumbbell + thumbs up"
  - `pin.0` "Use new challenge"
- **Actions:**
  - pinned "Use new challenge" → F1
- **Data:** challenge {expired:true}
- **Entered from:** F1, F2

### F3 — Photo 1 done
- **Layout:** NavBar "Iron Week" · close (✕)
- **Components (top→bottom):** SignStatus, Title, DayStrip, Note, PinnedActions (2)
- **Copy:**
  - `b1.chip` "Photo 1 passed"
  - `b2.title` "Photo 1 is in."
  - `b2.sub` "Do your 20 minutes, then come back for photo 2. No timer. Any time before midnight."
  - `b3.day.0` "Photo 1"
  - `b3.day.1` "Photo 2"
  - `b4.text` "Today shows \"In progress\" until photo 2."
  - `pin.0` "Take photo 2"
  - `pin.1` "Back to Today"
- **Actions:**
  - pinned "Take photo 2" → F4
  - pinned "Back to Today" → B1
- **Data:** proof {photo1:"passed"}, oath.day, oath.length
- **Entered from:** F2

### F4 — Photo 2 of 2
- **Layout:** NavBar "Iron Week · photo 2 of 2" · close (✕)
- **Components (top→bottom):** ProofCamera, ChipRow, Shutter
- **Copy:**
  - `b0.label` "Dumbbell + open palm"
  - `b1.chip.0` "Different gesture this time"
- **Actions:**
  - shutter "Shutter" → F4·chk
- **Data:** challenge {photo:2, gesture (≠ photo 1)}
- **Entered from:** B1, D2, D2·low, F3, N1

### F4·chk — Checking photo 2
- **Layout:** NavBar "Iron Week · photo 2 of 2" · back
- **Components (top→bottom):** ProofCamera, KeeperPlacement
- **Keeper:** neutral — "Last look."
- **Copy:**
  - `b0.label` "Checking…"
- **Auto:** advances to F5 after 2000 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Fails (1 of 3) → F2a · 3 fails · AI only → F4a · 3 fails · group review → F4a·g
- **Data:** check.status
- **Entered from:** F4

### F4a — 3 fails · AI only
- **Layout:** NavBar "Iron Week" · close (✕) · tone red
- **Components (top→bottom):** KeeperPlacement, Title, Breakdown, PinnedActions (1)
- **Keeper:** soft — "It happens. Even to you."
- **Copy:**
  - `b2.title` "Today's proof didn't pass."
  - `b2.sub` "Iron Week is AI only, so 3 failed checks is final. Today counts as missed."
  - `b3.row0.l` "Your stake"
  - `b3.row0.v` "−143 SKR"
  - `b3.row1.l` "Oath HP"
  - `b3.row1.v` "−20 at midnight"
  - `b3.row2.l` "Streak"
  - `b3.row2.v` "resets to 0"
  - `pin.0` "Back to Today"
- **Actions:**
  - pinned "Back to Today" → B1
- **Data:** oath.reviewMode="ai", check.failCount=3, me.missCostNext
- **Entered from:** F4·chk

### F4a·g — 3 fails · group review
- **Layout:** NavBar "Iron Week" · close (✕)
- **Components (top→bottom):** ProofCamera, Title, PinnedActions (2)
- **Copy:**
  - `b0.label` "3 of 3 checks failed"
  - `b1.title` "Let the group decide."
  - `b1.sub` "Send photo 2 to Riya, Arjun and Dev. Majority approves; a tie rejects. The photo is deleted after the vote, 48 hours at most."
  - `pin.0` "Ask your group to review"
  - `pin.1` "Accept the miss"
- **Actions:**
  - pinned "Ask your group to review" → G2
  - pinned "Accept the miss" → B1
- **Data:** oath.reviewMode="aiGroup", check.failCount=3
- **Entered from:** F4·chk

### F5 — Day kept
- **Layout:** NavBar · close (✕) · tone lime · beam · fx coins · pops: Kept, Streak 13
- **Components (top→bottom):** KeeperPlacement, Title, DayStrip, ChipRow, RowList, PinnedActions (1)
- **Keeper:** happy — "Clean. Your 1,000 sleeps safe tonight."
- **Copy:**
  - `b1.title` "Day 3 kept."
  - `b3.chip.0` "HP 90"
  - `b3.chip.1` "1,043 SKR safe"
  - `b3.chip.2` "Streak 13"
  - `b4.label` "STILL PENDING"
  - `b4.r0.t` "Arjun"
  - `b4.r0.s` "Hasn't proved today"
  - `b4.r0.r` "Nudge"
  - `pin.0` "Done"
  - `brand.stamp` "VERIFIED · DAY 3 · 9:41"
- **Actions:**
  - row "Arjun" → toast "Nudged Arjun"
  - pinned "Done" → B2
- **Data:** oath.day, oath.length, oath.hp, member.balance, members.pendingToday[]
- **Entered from:** F4·chk

---

## G · Group review

### G1 — Review a photo
- **Layout:** NavBar "Review" · close (✕)
- **Components (top→bottom):** Title, ProofCamera, ChipRow, KeeperPlacement, PinnedActions (2)
- **Keeper:** side — "Looks like a palm to me. Mostly."
- **Copy:**
  - `b0.title` "Dev wants your vote."
  - `b0.sub` "Iron Week · day 3 · photo 2 needs a dumbbell and an open palm."
  - `b1.label` "Dev's photo · AI failed 3 times"
  - `b2.chip.0` "1 of 3 votes"
  - `b2.chip.1` "Riya approved"
  - `b2.chip.2` "41h left"
  - `pin.0` "Approve"
  - `pin.1` "Reject"
- **Actions:**
  - pinned "Approve" → D2 + toast "Vote sent · approved" (marks rev1 done)
  - pinned "Reject" → D2 + toast "Vote sent · rejected" (marks rev1 done)
- **Data:** review {id, requester, oathId, day, photoUrl (temporary), object, gesture, votes[] {voter, vote}, expiresAt}, me.hasVoted
- **Entered from:** D2, N1

### G2 — Waiting for review
- **Layout:** NavBar "Review" · close (✕)
- **Components (top→bottom):** MoneyMoment, Title, SeatSlots, Note
- **Copy:**
  - `b1.value` "2 of 3"
  - `b1.caption` "votes in"
  - `b2.title` "Waiting for your group."
  - `b2.sub` "Majority approves. A tie rejects."
  - `b3.seat0` "approve"
  - `b3.seat1` "reject"
  - `b3.seat2` "waiting"
  - `b4.text` "Your photo is deleted after the decision, 48 hours at most."
- **Other states / outcomes:** Approved → G3 · Rejected → G3·no
- **Data:** review {votesIn, votesNeeded, expiresAt}
- **Entered from:** F4a·g

### G3 — Review approved
- **Layout:** NavBar · close (✕) · tone lime · pops: Approved
- **Components (top→bottom):** SignStatus, Title, PinnedActions (1)
- **Copy:**
  - `b1.chip` "Approved 2–1"
  - `b2.title` "Day 3 counts as kept."
  - `b2.sub` "Riya and Dev backed you. Your 1,000 SKR is safe tonight."
  - `pin.0` "Back to Iron Week"
- **Actions:**
  - pinned "Back to Iron Week" → D2
- **Data:** review.result="approved", tally
- **Entered from:** G2

### G3·no — Review rejected
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** KeeperPlacement, Title, Breakdown, PinnedActions (1)
- **Keeper:** soft — "Tough crowd."
- **Copy:**
  - `b2.title` "Rejected 1–2.\nDay 3 counts as missed."
  - `b3.row0.l` "Your stake"
  - `b3.row0.v` "−143 SKR"
  - `b3.row1.l` "Oath HP"
  - `b3.row1.v` "−20 at midnight"
  - `pin.0` "Back to Iron Week"
- **Actions:**
  - pinned "Back to Iron Week" → D2
- **Data:** review.result="rejected", tally
- **Entered from:** G2

---

## H · Bounties

### H1 — Feed · Discover
- **Layout:** Tab screen (bounties) · AppHeader "Bounties" · TabBar + PlusButton · content depends on the user's current selections
- **Components (top→bottom):** Segmented, SearchBar, HScroller, BountyCover
- **Copy:**
  - `b0.seg.0` "Discover"
  - `b0.seg.1` "Joined"
  - `b0.seg.2` "Created"
  - `b1.placeholder` "Search 1,240 Bounties"
  - `b2.i0.t` "All"
  - `b2.i1.t` "Fitness"
  - `b2.i2.t` "Reading"
  - `b2.i3.t` "Hydration"
  - `b2.i4.t` "Music"
  - `b2.i5.t` "Mind"
  - `b2.i6.t` "Outdoors"
  - `b3.brand` "Drift"
  - `b3.msg` "Hydrate Week\n50,000 SKR · 7 days · free"
  - `b3.tag.0` "Featured"
  - `b3.tag.1` "closes in 5h"
  - `b4.label` "CLOSING SOON"
  - `b4.i0.t` "Hydrate Week"
  - `b4.i0.v` "50,000 SKR"
  - `b4.i0.s` "Drift · closes in 5h"
  - `b4.i1.t` "Sol Strings"
  - `b4.i1.v` "8,000 SKR"
  - `b4.i1.s` "@riffs · closes in 9h"
  - `b4.i2.t` "Green Thumb"
  - `b4.i2.v` "12,000 SKR"
  - `b4.i2.s` "Sprout Co · closes in 12h"
  - `b4.i3.t` "Rope 1k"
  - `b4.i3.v` "15,000 SKR"
  - `b4.i3.s` "SkipLab · closes in 3h"
  - `b5.label` "BIGGEST POOLS"
  - `b5.i0.t` "Northbound Run Club"
  - `b5.i0.v` "120,000 SKR"
  - `b5.i0.s` "Northbound · 2d left"
  - `b5.i1.t` "Iron October"
  - `b5.i1.v` "75,000 SKR"
  - `b5.i1.s` "Forge Gym · 3d left"
  - `b5.i2.t` "Hydrate Week"
  - `b5.i2.v` "50,000 SKR"
  - `b5.i2.s` "Drift · closes in 5h"
  - `b5.i3.t` "Mat Month"
  - `b5.i3.v` "30,000 SKR"
  - `b5.i3.s` "Lotus · 1d left"
  - `b6.label` "FROM CREATORS YOU FOLLOW"
  - `b6.i0.t` "Hydrate Week"
  - `b6.i0.v` "50,000 SKR"
  - `b6.i0.s` "Drift · closes in 5h"
  - `b6.i1.t` "Dawn Pages"
  - `b6.i1.v` "20,000 SKR"
  - `b6.i1.s` "Inkwell · closes in 20h"
  - `b6.i2.t` "Iron October"
  - `b6.i2.v` "75,000 SKR"
  - `b6.i2.s` "Forge Gym · 3d left"
- **Actions:**
  - segment "Discover" → H1
  - segment "Joined" → H1·j
  - segment "Created" → H1·c
  - search "Search" → H7
  - scroller card "All" → H7
  - scroller card "Fitness" → H7
  - scroller card "Reading" → H7
  - scroller card "Hydration" → H7
  - scroller card "Music" → H7
  - scroller card "Mind" → H7
  - scroller card "Outdoors" → H7
  - cover "Drift" → H2
  - see all "See all" → H7
  - scroller card "Hydrate Week" → H2
  - scroller card "Sol Strings" → H2
  - scroller card "Green Thumb" → H2
  - scroller card "Rope 1k" → H2·no
  - see all "See all" → H7
  - scroller card "Northbound Run Club" → H2·no
  - scroller card "Iron October" → H2
  - scroller card "Hydrate Week" → H2
  - scroller card "Mat Month" → H2
  - see all "See all" → H7
  - scroller card "Hydrate Week" → H2
  - scroller card "Dawn Pages" → H2
  - scroller card "Iron October" → H2
- **Data:** bounties.featured[], bounties.closingSoon[], categories[], bounties.list[] {id, name, brand, object, pool, entrants, joinClosesAt, requirements, eligible}
- **Entered from:** B1, B2, B3, B4, D0, H1·j, H1·c, H2·no, H4, I1

### H1·j — Feed · Joined
- **Layout:** Tab screen (bounties) · AppHeader "Bounties" · TabBar + PlusButton
- **Components (top→bottom):** Segmented, OathCard
- **Copy:**
  - `b0.seg.0` "Discover"
  - `b0.seg.1` "Joined"
  - `b0.seg.2` "Created"
  - `b1.name` "Hydrate Week"
  - `b1.meta` "Drift · Day 3/7"
  - `b1.tag.0` "In"
  - `b1.tag.1` "31 of 40 in"
  - `b1.btn` "Prove"
  - `b2.name` "Dawn 5k"
  - `b2.meta` "Northbound · out on day 3"
  - `b2.tag.0` "Out"
  - `b3.name` "Sol Strings"
  - `b3.meta` "@riffs · ended"
  - `b3.tag.0` "Survived"
  - `b3.tag.1` "Claim 1,666 SKR"
- **Actions:**
  - segment "Discover" → H1
  - segment "Joined" → H1·j
  - segment "Created" → H1·c
  - card button "Prove" → F1
  - card tap "(card header)" → H3
  - card tap "(card header)" → H4
  - card tap "(card header)" → H5
- **Data:** bounties.joined[] {status:"in"|"out"|"ended", survivors, entrants, payout?}
- **Entered from:** H1, H1·c, I1, I4

### H1·c — Feed · Created
- **Layout:** Tab screen (bounties) · AppHeader "Bounties" · TabBar + PlusButton
- **Components (top→bottom):** Segmented, OathCard, KeeperPlacement, ButtonRow
- **Keeper:** wink — "Generous. Suspicious, but generous."
- **Copy:**
  - `b0.seg.0` "Discover"
  - `b0.seg.1` "Joined"
  - `b0.seg.2` "Created"
  - `b1.name` "Dawn Pages"
  - `b1.meta` "You funded 20,000 SKR · Day 4/14"
  - `b1.tag.0` "58 joined"
  - `b1.tag.1` "41 still in"
  - `b1.btn` "See stats"
  - `b3.btn.0` "Create a Bounty"
- **Actions:**
  - segment "Discover" → H1
  - segment "Joined" → H1·j
  - segment "Created" → H1·c
  - card button "See stats" → H6
  - card tap "(card header)" → H6
  - button "Create a Bounty" → K1
- **Data:** bounties.created[] {stats}
- **Entered from:** H1, H1·j

### H2 — Bounty detail
- **Layout:** NavBar "Bounty" · back
- **Components (top→bottom):** BountyCover, RowList, Breakdown, ChipRow, Banner, PinnedActions (1)
- **Copy:**
  - `b0.brand` "Drift"
  - `b0.msg` "Two litres a day.\nSeven days. Don't blink."
  - `b1.r0.t` "Drift"
  - `b1.r0.s` "Verified · hosted 6 · paid out 310,400 SKR"
  - `b2.row0.l` "Pool"
  - `b2.row0.v` "50,000 SKR"
  - `b2.row1.l` "Object"
  - `b2.row1.v` "Water bottle"
  - `b2.row2.l` "Length"
  - `b2.row2.v` "7 days"
  - `b2.row3.l` "Joins close"
  - `b2.row3.v` "in 5h 40m"
  - `b2.row4.l` "Entrants"
  - `b2.row4.v` "40"
  - `b2.row5.l` "Rule"
  - `b2.row5.v` "Miss a day and you're out"
  - `b3.chip.0` "Verified Seeker"
  - `b3.chip.1` "70%+ kept rate · you 91%"
  - `b4.title` "You're eligible"
  - `b4.sub` "Free to join. Survivors split the pool."
  - `pin.0` "Join free"
- **Actions:**
  - row "Drift" → I3
  - pinned "Join free" → H3
- **Data:** bounty {id, brand {name, logo, verified, link}, cover, message, pool, object, length, joinClosesAt, entrants, requirements {minKeptRate?, token?}}, me.eligibility {ok, reasons[]}
- **Entered from:** B3, H1, I3, N1, H7

### H2·no — Bounty · not eligible
- **Layout:** NavBar "Bounty" · back
- **Components (top→bottom):** BountyCover, Breakdown, ChipRow, Banner, PinnedActions (2)
- **Copy:**
  - `b0.brand` "Northbound"
  - `b0.msg` "Run 5k every day\nfor 14 days."
  - `b1.row0.l` "Pool"
  - `b1.row0.v` "120,000 SKR"
  - `b1.row1.l` "Object"
  - `b1.row1.v` "Running shoe"
  - `b1.row2.l` "Length"
  - `b1.row2.v` "14 days"
  - `b1.row3.l` "Entrants"
  - `b1.row3.v` "212"
  - `b2.chip.0` "Verified Seeker"
  - `b2.chip.1` "80%+ kept rate · you 74%"
  - `b3.title` "Not eligible yet"
  - `b3.sub` "Needs an 80% kept rate. Keep 6 more days in a row to get there."
  - `pin.0` "Browse other Bounties"
  - `pin.1` "How kept rate works"
- **Actions:**
  - pinned "Browse other Bounties" → H1
  - pinned "How kept rate works" → I1
- **Data:** same, me.eligibility.ok=false + reason
- **Entered from:** H1, H7

### H3 — Bounty, joined
- **Layout:** NavBar "Hydrate Week" · right "Day 3/7" · back
- **Components (top→bottom):** Title, OathCard, KeeperPlacement, RowList, MoneyMoment
- **Keeper:** side — "Nine down already. Marco went first."
- **Copy:**
  - `b0.title` "You're in.\n31 of 40 still standing."
  - `b1.name` "Today's proof"
  - `b1.meta` "Water bottle · 2 photos"
  - `b1.tag.0` "0 of 2"
  - `b1.tag.1` "14h left"
  - `b1.btn` "Prove"
  - `b3.label` "RECENTLY OUT"
  - `b3.r0.t` "Marco"
  - `b3.r0.s` "missed day 2"
  - `b3.r0.r` "2h ago"
  - `b3.r1.t` "Lena"
  - `b3.r1.s` "missed day 2"
  - `b3.r1.r` "2h ago"
  - `b3.r2.t` "Kai"
  - `b3.r2.s` "missed day 1"
  - `b3.r2.r` "yesterday"
  - `b4.value` "≈ 1,613"
  - `b4.caption` "SKR each if 31 finish"
- **Actions:**
  - card button "Prove" → F1
- **Other states / outcomes:** Miss a day → H4 · Bounty ends → H5
- **Data:** bounty {day, length, survivors, entrants, recentlyOut[] {name, day, at}}, me.proofStatus, me.estimatedPayout
- **Entered from:** B1, B2, B5, H1·j, H2, I2, N1

### H4 — Eliminated
- **Layout:** NavBar "Hydrate Week" · close (✕) · tone grey
- **Components (top→bottom):** KeeperPlacement, Title, RowList, PinnedActions (1)
- **Keeper:** soft — "Pool's gone. Your word isn't."
- **Copy:**
  - `b2.title` "Missed day 3.\nYou're out of the pool."
  - `b3.r0.t` "Kept rate"
  - `b3.r0.s` "Still yours to build"
  - `b3.r0.r` "90%"
  - `b3.r0.rs` "65 days"
  - `b3.r1.t` "Best streak"
  - `b3.r1.s` "Untouched"
  - `b3.r1.r` "21"
  - `b3.r1.rs` "days"
  - `b3.r2.t` "Start an Oath"
  - `b3.r2.s` "Put your own stake down"
  - `pin.0` "Browse Bounties"
- **Actions:**
  - row "Start an Oath" → C1
  - pinned "Browse Bounties" → H1
- **Data:** bounty.name, me.eliminatedDay, profile.keptRate, streak
- **Entered from:** H1·j, H3, L5

### H5 — Bounty ended
- **Layout:** NavBar "Sol Strings" · close (✕) · tone lime · fx coins · pops: +1,666
- **Components (top→bottom):** Title, MoneyMoment, SeatSlots, ButtonRow, PinnedActions (1)
- **Copy:**
  - `b0.title` "27 survived.\nYou're one of them."
  - `b1.value` "+1,666"
  - `b1.caption` "SKR, your share of 45,000"
  - `b2.seat0` "+1,666"
  - `b2.seat1` "+1,666"
  - `b2.seat2` "+1,666"
  - `b2.seat3` "+24"
  - `b3.btn.0` "Share card"
  - `b3.btn.1` "Follow @riffs"
  - `pin.0` "Claim 1,666 SKR"
  - `brand.stamp` "STRUM DAILY · SURVIVED"
- **Actions:**
  - button "Share card" → toast "Share card saved"
  - button "Follow @riffs" → toast "Following @riffs"
  - pinned "Claim 1,666 SKR" → J1
- **Data:** bounty {survivors, entrants, poolAfterFee}, me.payout, survivorsPreview[]
- **Entered from:** H1·j, H3, I2, L5

### H6 — My created Bounty
- **Layout:** NavBar "Dawn Pages" · right "Day 4/14" · back
- **Components (top→bottom):** Title, BarChart, Breakdown, RowList, PinnedActions (1)
- **Copy:**
  - `b0.title` "41 of 58 still reading."
  - `b1.label` "Still in, per day"
  - `b2.row0.l` "Pool"
  - `b2.row0.v` "20,000 SKR"
  - `b2.row1.l` "Finish rate (est.)"
  - `b2.row1.v` "62%"
  - `b2.row2.l` "Cost per finisher (est.)"
  - `b2.row2.v` "≈ 556 SKR"
  - `b2.row3.l` "Finishers opted in to share"
  - `b2.row3.v` "12"
  - `b3.label` "FINISHERS (OPT-IN)"
  - `b3.r0.t` "@reads.sol"
  - `b3.r0.s` "4 of 4 days"
  - `b3.r0.r` "opted in"
  - `b3.r1.t` "@nomi"
  - `b3.r1.s` "4 of 4 days"
  - `b3.r1.r` "opted in"
  - `pin.0` "Export finishers"
- **Actions:**
  - pinned "Export finishers" → toast "finishers.csv saved"
- **Data:** bounty.stats {entrants, survivorsByDay[], finishRate, costPerFinisher, feePaid, finisherOptIns}
- **Entered from:** H1·c, K5·ok

### H7 — Browse Bounties
- **Layout:** NavBar "Browse" · back · content depends on the user's current selections
- **Components (top→bottom):** SearchBar, HScroller, Segmented, RowList, BodyText, Note
- **Copy:**
  - `b0.placeholder` "Search by name, brand or habit"
  - `b1.i0.t` "All"
  - `b1.i1.t` "Fitness"
  - `b1.i2.t` "Reading"
  - `b1.i3.t` "Hydration"
  - `b1.i4.t` "Music"
  - `b1.i5.t` "Mind"
  - `b1.i6.t` "Outdoors"
  - `b2.seg.0` "Closing soon"
  - `b2.seg.1` "Biggest pool"
  - `b2.seg.2` "Most joined"
  - `b3.r0.t` "Only ones I can join"
  - `b3.r0.s` "Off"
  - `b4.text` "1,240 live Bounties"
  - `b5.r0.t` "Rope 1k"
  - `b5.r0.s` "SkipLab · 120 in · closes in 3h"
  - `b5.r0.r` "15,000"
  - `b5.r0.rs` "SKR"
  - `b5.r1.t` "Hydrate Week"
  - `b5.r1.s` "Drift · 40 in · closes in 5h"
  - `b5.r1.r` "50,000"
  - `b5.r1.rs` "SKR"
  - `b5.r2.t` "Sol Strings"
  - `b5.r2.s` "@riffs · 58 in · closes in 9h"
  - `b5.r2.r` "8,000"
  - `b5.r2.rs` "SKR"
  - `b5.r3.t` "Green Thumb"
  - `b5.r3.s` "Sprout Co · 31 in · closes in 12h"
  - `b5.r3.r` "12,000"
  - `b5.r3.rs` "SKR"
  - `b5.r4.t` "Dawn Pages"
  - `b5.r4.s` "Inkwell · 58 in · closes in 20h"
  - `b5.r4.r` "20,000"
  - `b5.r4.rs` "SKR"
  - `b5.r5.t` "Mat Month"
  - `b5.r5.s` "Lotus · 88 in · 1d left"
  - `b5.r5.r` "30,000"
  - `b5.r5.rs` "SKR"
  - `b5.r6.t` "Northbound Run Club"
  - `b5.r6.s` "Northbound · 212 in · 2d left"
  - `b5.r6.r` "120,000"
  - `b5.r6.rs` "SKR"
  - `b5.r7.t` "Iron October"
  - `b5.r7.s` "Forge Gym · 340 in · 3d left"
  - `b5.r7.r` "75,000"
  - `b5.r7.rs` "SKR"
  - `b6.text` "Scroll for more. New Bounties land every day."
- **Actions:**
  - row toggle "Only ones I can join" → toggle
  - row "Rope 1k" → H2·no
  - row "Hydrate Week" → H2
  - row "Sol Strings" → H2
  - row "Green Thumb" → H2
  - row "Dawn Pages" → H2
  - row "Mat Month" → H2
  - row "Northbound Run Club" → H2·no
  - row "Iron October" → H2
- **Data:** search.query, filters {category, poolMin, closesWithin, eligibleOnly}, sort, results[] paginated
- **Entered from:** H1

---

## I · Profiles

### I1 — My profile
- **Layout:** Tab screen (profile) · AppHeader "Profile" · TabBar + PlusButton · content depends on the user's current selections
- **Components (top→bottom):** Banner, ProfileCard, KeptRateRing, KeeperPlacement, RowList
- **Keeper:** wink — "I call you The Early Bird." · wink — "38 of your 64 kept days were done before 9am." · wink — "Keep it up and I'll think of a better one."
- **Copy:**
  - `b0.title` "Make it yours"
  - `b0.sub` "Build an avatar, add a bio and socials so friends spot you."
  - `b1.name` "sam.skr"
  - `b1.handle` "7xKp…3F9q"
  - `b1.bio` "Lifting daily. Staking on myself."
  - `b1.social.0` "@samkeeps"
  - `b1.act.0` "Edit"
  - `b1.act.1` "Share"
  - `b2.value` "91%"
  - `b2.line` "64 days · kept rate"
  - `b4.r0.t` "Streak"
  - `b4.r0.s` "Best: 21 days"
  - `b4.r0.r` "12"
  - `b4.r0.rs` "days"
  - `b4.r1.t` "Oaths"
  - `b4.r1.s` "41 kept · 9 broken"
  - `b4.r1.r` "50"
  - `b4.r2.t` "Bounties"
  - `b4.r2.s` "2 survived · 1 out"
  - `b4.r2.r` "3"
  - `b5.r0.t` "See how others see you"
  - `b5.r0.s` "Oaths: Oath partners only"
- **Actions:**
  - banner "Make it yours" → I8 (marks pt1 done)
  - profile action "Edit" → I8 (marks pt1 done)
  - profile action "Share" → toast "Profile link copied"
  - row "Oaths" → D5
  - row "Bounties" → H1·j
  - row "See how others see you" → I2·me
- **Data:** profile {name, handle, avatar, banner, bio, socials[], verifiedSeeker, keptRate, keptDays, streak.current, streak.best, oaths {kept, broken}, bounties {survived, out}}
- **Entered from:** B1, B2, B3, B4, D0, H1, H1·j, H1·c, H2·no, I8

### I2 — Someone's profile
- **Layout:** NavBar "Riya" · back
- **Components (top→bottom):** ProfileCard, KeptRateRing, RowList, ChipRow, PinnedActions (1)
- **Copy:**
  - `b0.name` "riya.skr"
  - `b0.handle` "4mQa…9Lw2"
  - `b0.bio` "Morning runs, evening pages. Never broken an Oath."
  - `b0.social.0` "@riyaruns"
  - `b0.social.1` "Telegram"
  - `b1.value` "94%"
  - `b1.line` "71 days · kept rate"
  - `b2.label` "OATHS"
  - `b2.r0.t` "Dawn Run"
  - `b2.r0.s` "Day 4/7 · 3 Keepers · HP 100"
  - `b2.r0.r` "Public"
  - `b2.r1.t` "Iron Week"
  - `b2.r1.s` "With you · Day 3/7"
  - `b2.r1.r` "Shared"
  - `b3.label` "BOUNTIES"
  - `b3.r0.t` "Sol Strings"
  - `b3.r0.s` "Survived · +1,666 SKR"
  - `b3.r1.t` "Hydrate Week"
  - `b3.r1.s` "In · Day 3/7"
  - `b4.chip.0` "3 Oaths together"
  - `b4.chip.1` "Never broken"
  - `pin.0` "Invite to an Oath"
- **Actions:**
  - row "Dawn Run" → E2
  - row "Iron Week" → D2
  - row "Sol Strings" → H5
  - row "Hydrate Week" → H3
  - pinned "Invite to an Oath" → C1
- **Other states / outcomes:** A private profile → I2·p
- **Data:** profile (other, public fields only per visibility) + relationship.sharedOaths
- **Entered from:** D2, D2·low, E2

### I3 — Creator profile
- **Layout:** NavBar "Drift" · back
- **Components (top→bottom):** BountyCover, BodyText, Breakdown, RowList, PinnedActions (1)
- **Copy:**
  - `b0.brand` "Drift"
  - `b0.msg` "Drift\nHydration, on-chain."
  - `b1.text` "We fund week-long hydration Bounties. Show up, drink up, split the pool."
  - `b2.row0.l` "Hosted Bounties"
  - `b2.row0.v` "6"
  - `b2.row1.l` "Total paid out"
  - `b2.row1.v` "310,400 SKR"
  - `b2.row2.l` "Followers"
  - `b2.row2.v` "2,140"
  - `b3.label` "LINKS"
  - `b3.r0.t` "drift.water"
  - `b3.r0.s` "Website"
  - `b3.r1.t` "@driftwater"
  - `b3.r1.s` "X"
  - `b3.r2.t` "Drift Discord"
  - `b3.r2.s` "Community"
  - `b4.label` "HOSTED NOW"
  - `b4.r0.t` "Hydrate Week"
  - `b4.r0.s` "50,000 SKR · joins close 5h"
  - `b4.r0.r` "Open"
  - `pin.0` "Follow Drift"
- **Actions:**
  - row "drift.water" → toast "Opening drift.water"
  - row "@driftwater" → toast "Opening X"
  - row "Drift Discord" → toast "Opening Discord"
  - row "Hydrate Week" → H2
  - pinned "Follow Drift" → toast "Following Drift"
- **Data:** creator {profile, logo, bio, links[], verified, bountiesHosted[], totalPaidOut, followers}
- **Entered from:** H2

### I4 — Settings
- **Layout:** NavBar "Settings" · back
- **Components (top→bottom):** RowList
- **Copy:**
  - `b0.label` "YOU"
  - `b0.r0.t` "Edit profile"
  - `b0.r0.s` "Avatar, name, bio, socials"
  - `b0.r1.t` "Wallet"
  - `b0.r1.s` "Add SKR, receive, claim"
  - `b0.r2.t` "Your activity"
  - `b0.r2.s` "Proofs, payments, votes"
  - `b0.r3.t` "Oath history"
  - `b0.r3.s` "50 finished"
  - `b0.r4.t` "Bounty history"
  - `b0.r4.s` "Joined and created"
  - `b0.r5.t` "Who sees what"
  - `b0.r5.s` "Oaths, Bounties, socials"
  - `b0.r6.t` "Host a Bounty"
  - `b0.r6.s` "You get a creator page when you host one"
  - `b1.label` "NOTIFICATIONS"
  - `b1.r0.t` "Nudges"
  - `b1.r0.s` "When a friend pokes you"
  - `b1.r1.t` "Deadline reminder"
  - `b1.r1.s` "2 hours before midnight"
  - `b1.r2.t` "Review requests"
  - `b1.r2.s` "When your group needs a vote"
  - `b1.r3.t` "Results"
  - `b1.r3.s` "Settlements and claims"
  - `b2.label` "WALLET & NETWORK"
  - `b2.r0.t` "Wallet"
  - `b2.r0.s` "Seeker Wallet · 7xKp…3F9q"
  - `b2.r1.t` "Network"
  - `b2.r1.s` "Devnet"
  - `b2.r1.r` "DEVNET"
  - `b2.r2.t` "Test SKR faucet"
  - `b2.r2.s` "Devnet only"
  - `b2.r2.r` "Get 5,000"
- **Actions:**
  - row "Edit profile" → I8 (marks pt1 done)
  - row "Wallet" → W1
  - row "Your activity" → I5
  - row "Oath history" → D5
  - row "Bounty history" → H1·j
  - row "Who sees what" → I7
  - row "Host a Bounty" → K1
  - row toggle "Nudges" → toggle
  - row toggle "Deadline reminder" → toggle
  - row toggle "Review requests" → toggle
  - row toggle "Results" → toggle
  - row "Wallet" → A2
  - row "Test SKR faucet" → toast "+5,000 test SKR"
- **Data:** settings {notifications {nudges, deadline, reviews, results}, wallet {name, address}, network}
- **Entered from:** E3·skr, I1, M4

### I2·me — How others see you
- **Layout:** NavBar "Preview" · back · content depends on the user's current selections
- **Components (top→bottom):** Banner, ProfileCard, KeptRateRing, RowList
- **Copy:**
  - `b0.title` "This is how others see you"
  - `b0.sub` "Change it in Who sees what."
  - `b1.name` "sam.skr"
  - `b1.handle` "7xKp…3F9q"
  - `b1.bio` "Lifting daily. Staking on myself."
  - `b1.social.0` "@samkeeps"
  - `b2.value` "91%"
  - `b2.line` "64 days · kept rate"
  - `b3.title` "Oaths: only Oath partners"
  - `b3.sub` "People you share an Oath with see them."
  - `b4.label` "BOUNTIES"
  - `b4.r0.t` "Hydrate Week"
  - `b4.r0.s` "In · Day 3/7"
- **Actions:**
  - banner "This is how others see you" → I7
- **Data:** profile + visibility
- **Entered from:** I1, I7

### I2·p — Private profile
- **Layout:** NavBar "Arjun" · back
- **Components (top→bottom):** ProfileCard, KeptRateRing, Banner, RowList, PinnedActions (1)
- **Copy:**
  - `b0.name` "arjun.skr"
  - `b0.handle` "9Tz2…Qe41"
  - `b1.value` "78%"
  - `b1.line` "40 days · kept rate"
  - `b2.title` "Arjun keeps his Oaths private"
  - `b2.sub` "You only see the ones you share."
  - `b3.label` "SHARED WITH YOU"
  - `b3.r0.t` "Iron Week"
  - `b3.r0.s` "With you · Day 3/7"
  - `b3.r0.r` "Shared"
  - `pin.0` "Invite to an Oath"
- **Actions:**
  - row "Iron Week" → D2
  - pinned "Invite to an Oath" → C1
- **Data:** profile {private:true, name, avatar, keptRate}
- **Entered from:** I2

### I5 — Your activity
- **Layout:** NavBar "Your activity" · back · content depends on the user's current selections
- **Components (top→bottom):** Segmented, RowList, Note
- **Copy:**
  - `b0.seg.0` "All"
  - `b0.seg.1` "Money"
  - `b0.seg.2` "Proof"
  - `b0.seg.3` "Oaths"
  - `b1.label` "TODAY"
  - `b1.r0.t` "Kept Iron Week · day 3"
  - `b1.r0.s` "Photo 2 passed · 21:04"
  - `b1.r1.t` "Photo 1 passed"
  - `b1.r1.s` "Iron Week · 07:58"
  - `b2.label` "YESTERDAY"
  - `b2.r0.t` "+43 SKR from Arjun's miss"
  - `b2.r0.s` "Iron Week · settled 00:00"
  - `b2.r0.r` "+43"
  - `b2.r1.t` "Kept Read 20 pages"
  - `b2.r1.s` "Solo · day 8"
  - `b2.r2.t` "Voted on Dev's photo"
  - `b2.r2.s` "Approved"
  - `b3.label` "MON 6 OCT"
  - `b3.r0.t` "Staked into Iron Week"
  - `b3.r0.s` "1,000 SKR"
  - `b3.r0.r` "−1,000"
  - `b3.r1.t` "Joined Hydrate Week"
  - `b3.r1.s` "Bounty by Drift"
  - `b4.label` "SUN 5 OCT"
  - `b4.r0.t` "Claimed Hydra 14"
  - `b4.r0.s` "1,186 SKR"
  - `b4.r0.r` "+1,186"
  - `b4.r1.t` "Guitar Days broke"
  - `b4.r1.s` "HP hit 0 on day 6"
  - `b4.r1.r` "−1,000"
  - `b5.text` "Older activity loads as you scroll."
- **Data:** activity[] paginated {date, type, title, sub, amount?}
- **Entered from:** I4, W1

### I7 — Who sees what
- **Layout:** NavBar "Who sees what" · back
- **Components (top→bottom):** Banner, MonoLabel, Segmented, RowList
- **Copy:**
  - `b0.title` "Your kept rate is always public"
  - `b0.sub` "It's how people decide who to trust. The rest is up to you."
  - `b1.text` "YOUR OATHS"
  - `b2.seg.0` "Everyone"
  - `b2.seg.1` "Oath partners"
  - `b2.seg.2` "Only me"
  - `b3.text` "YOUR BOUNTIES"
  - `b4.seg.0` "Everyone"
  - `b4.seg.1` "Oath partners"
  - `b4.seg.2` "Only me"
  - `b5.text` "YOUR SOCIALS"
  - `b6.seg.0` "Everyone"
  - `b6.seg.1` "Oath partners"
  - `b6.seg.2` "Only me"
  - `b7.r0.t` "Find me by name"
  - `b7.r0.s` "People can search for you"
  - `b7.r1.t` "Let anyone invite me"
  - `b7.r1.s` "Off: only people you've shared an Oath with"
  - `b8.r0.t` "See how others see you"
- **Actions:**
  - row toggle "Find me by name" → toggle
  - row toggle "Let anyone invite me" → toggle
  - row "See how others see you" → I2·me
- **Data:** visibility {oaths, bounties, socials, keptRate:"always"}
- **Entered from:** I4, I2·me

### I8 — Edit profile
- **Layout:** NavBar "Edit profile" · close (✕) · content depends on the user's current selections
- **Components (top→bottom):** AvatarBuilder, SentenceInput, RowList, Note, PinnedActions (1)
- **Copy:**
  - `b1.label` "Name"
  - `b1.sug.0` "sam.skr"
  - `b1.sug.1` "Sam K."
  - `b1.sug.2` "samkeeps"
  - `b2.label` "Bio"
  - `b2.sug.0` "Lifting daily. Staking on myself."
  - `b2.sug.1` "Building in public, one kept day at a time."
  - `b2.sug.2` "Will out-keep you. Try me."
  - `b3.label` "SOCIALS · SO PEOPLE CAN REACH YOU"
  - `b3.r0.t` "X"
  - `b3.r0.s` "@samkeeps · on your profile"
  - `b3.r1.t` "Telegram"
  - `b3.r1.s` "Tap to connect"
  - `b3.r2.t` "Discord"
  - `b3.r2.s` "Tap to connect"
  - `b3.r3.t` "Farcaster"
  - `b3.r3.s` "Tap to connect"
  - `b4.text` "Your wallet address can't be changed here. Who sees socials: Who sees what."
  - `pin.0` "Save"
- **Actions:**
  - row toggle "X" → toggle
  - row toggle "Telegram" → toggle
  - row toggle "Discord" → toggle
  - row toggle "Farcaster" → toggle
  - pinned "Save" → I1 + toast "Profile saved" (marks pt1 done)
- **Data:** profile draft {name, handle, bio, banner, socials[]}
- **Entered from:** I1, I4

### I9 — Avatar builder
- **Layout:** NavBar "Your avatar" · close (✕) · content depends on the user's current selections
- **Components (top→bottom):** KeeperPlacement, AvatarBuilder, PinnedActions (1)
- **Keeper:** shocked — "A fox. Sly. I respect it."
- **Copy:**
  - `pin.0` "Done"
- **Actions:**
  - pinned "Done" → back
- **Data:** profile.avatar config
- **Entered from:** A4

---

## W · Wallet

### W1 — Wallet
- **Layout:** NavBar "Wallet" · back · content depends on the user's current selections
- **Components (top→bottom):** KeeperPlacement, MoneyMoment, ButtonRow, OathCard, Breakdown, RowList
- **Keeper:** smug — "You left 1,186 on my table." · smug — "Claim it. I don't hold chips forever."
- **Copy:**
  - `b1.value` "4,280"
  - `b1.caption` "SKR available · ≈ $42.80"
  - `b2.btn.0` "Add SKR"
  - `b2.btn.1` "Receive"
  - `b3.name` "1,186 SKR to claim"
  - `b3.meta` "Hydra 14 ended Sunday"
  - `b3.btn` "Claim now"
  - `b4.label` "BALANCES"
  - `b4.row0.l` "Available"
  - `b4.row0.v` "4,280 SKR"
  - `b4.row1.l` "Locked in Oaths"
  - `b4.row1.v` "1,500 SKR · 2 Oaths"
  - `b4.row2.l` "In a Rematch"
  - `b4.row2.v` "1,000 SKR"
  - `b4.row3.l` "SOL for fees"
  - `b4.row3.v` "0.84 SOL"
  - `b5.label` "RECENT"
  - `b5.r0.t` "+43 SKR from Arjun's miss"
  - `b5.r0.s` "Iron Week · yesterday"
  - `b5.r0.r` "+43"
  - `b5.r1.t` "Staked into Iron Week"
  - `b5.r1.s` "Mon 6 Oct"
  - `b5.r1.r` "−1,000"
  - `b5.r2.t` "All activity"
- **Actions:**
  - button "Add SKR" → W2
  - button "Receive" → W4
  - card button "Claim now" → J1
  - card tap "(card header)" → J1
  - row "All activity" → I5
- **Data:** wallet {balanceSkr, balanceSol, address, network}, recent[]
- **Entered from:** B1, B2, B3, B4, D0, H1, H1·j, H1·c, I1, I4, W3·ok

### W2 — Add SKR
- **Layout:** Bottom sheet over "Wallet"
- **Components (top→bottom):** Title, RowList, Note, ButtonRow
- **Copy:**
  - `b0.title` "Add SKR."
  - `b0.sub` "Pick how you want to top up."
  - `b1.r0.t` "Swap SOL for SKR"
  - `b1.r0.s` "Right here, in a few seconds"
  - `b1.r1.t` "Receive from another wallet"
  - `b1.r1.s` "Show your address or QR"
  - `b1.r2.t` "Test SKR faucet"
  - `b1.r2.s` "Devnet only · free"
  - `b1.r2.r` "+5,000"
  - `b2.text` "Devnet SKR has no real value."
  - `b3.btn.0` "Close"
- **Actions:**
  - row "Swap SOL for SKR" → W3
  - row "Receive from another wallet" → W4
  - row "Test SKR faucet" → stay + toast "+5,000 test SKR added" (marks fc1 done)
  - button "Close" → back
- **Data:** onramp options[]
- **Entered from:** W1

### W3 — Swap SOL → SKR
- **Layout:** NavBar "Swap" · back · content depends on the user's current selections
- **Components (top→bottom):** Title, OptionGrid, MoneyMoment, Breakdown, Note, PinnedActions (1)
- **Copy:**
  - `b0.title` "Swap SOL for SKR."
  - `b0.sub` "Pick an amount."
  - `b1.o0.t` "0.1"
  - `b1.o0.s` "SOL"
  - `b1.o1.t` "0.25"
  - `b1.o1.s` "SOL"
  - `b1.o2.t` "0.5"
  - `b1.o2.s` "SOL"
  - `b1.o3.t` "1"
  - `b1.o3.s` "SOL"
  - `b2.value` "+4,950"
  - `b2.caption` "SKR you'll get"
  - `b3.row0.l` "You pay"
  - `b3.row0.v` "0.5 SOL"
  - `b3.row1.l` "Rate"
  - `b3.row1.v` "1 SOL ≈ 9,900 SKR"
  - `b3.row2.l` "Network fee"
  - `b3.row2.v` "0.000005 SOL"
  - `b3.row3.l` "You have"
  - `b3.row3.v` "0.84 SOL"
  - `b4.text` "Devnet rate. Swaps route through a public exchange."
  - `pin.0` "Swap"
- **Actions:**
  - pinned "Swap" → W3·s (marks sw1 done)
- **Data:** swap {solIn, skrOut, rate, slippage, fee}
- **Entered from:** W2

### W3·s — Swap · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Confirm the swap"
  - `b2.sub` "Swapping SOL for SKR."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to W3·ok after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Rejected → C7·no · Not enough SOL → M3
- **Data:** tx.status
- **Entered from:** W3

### W3·ok — Swap done
- **Layout:** NavBar · close (✕) · tone lime · beam · fx coins · pops: SKR added · content depends on the user's current selections
- **Components (top→bottom):** SignStatus, Title, PinnedActions (2)
- **Copy:**
  - `b1.chip` "Swap confirmed"
  - `b2.title` "SKR added."
  - `b2.sub` "Your balance is now 4,280 SKR."
  - `pin.0` "Back to wallet"
  - `pin.1` "Start an Oath"
- **Actions:**
  - pinned "Back to wallet" → W1
  - pinned "Start an Oath" → C1
- **Data:** swap result
- **Entered from:** W3·s

### W4 — Receive
- **Layout:** NavBar "Receive" · back
- **Components (top→bottom):** Title, QRCard, ButtonRow, Note
- **Copy:**
  - `b0.title` "Your address."
  - `b0.sub` "Send SKR or SOL here from any Solana wallet."
  - `b1.code` "7xKp…3F9q"
  - `b1.link` "7xKpZ1a9Lw2QmR4vT8yN3F9q"
  - `b2.btn.0` "Copy address"
  - `b2.btn.1` "Share"
  - `b3.text` "Devnet only. Mainnet tokens sent here will be lost."
- **Actions:**
  - button "Copy address" → toast "Address copied"
  - button "Share" → toast "Share sheet opened"
- **Data:** wallet.address (+ QR)
- **Entered from:** W1, W2

---

## J · Claim

### J1 — Claim
- **Layout:** NavBar "Claim" · close (✕)
- **Components (top→bottom):** MoneyMoment, Breakdown, PinnedActions (1)
- **Copy:**
  - `b1.value` "1,186"
  - `b1.caption` "SKR ready to claim"
  - `b2.label` "HYDRA 14"
  - `b2.row0.l` "Start"
  - `b2.row0.v` "1,000"
  - `b2.row1.l` "Lost"
  - `b2.row1.v` "0"
  - `b2.row2.l` "Won from misses"
  - `b2.row2.v` "+186"
  - `b2.row3.l` "Fee"
  - `b2.row3.v` "0"
  - `b2.row4.l` "Claim"
  - `b2.row4.v` "1,186 SKR"
  - `pin.0` "Sign & claim"
- **Actions:**
  - pinned "Sign & claim" → J1·p (marks clm1 done)
- **Other states / outcomes:** Claim fails → J1·f
- **Data:** claim {oathId|bountyId, amount, breakdown}
- **Entered from:** B1, D4, R4, R4·lost, H5, L1, L2, L4, L4·m, L6, N1, W1

### J1·p — Claim · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Confirm the claim"
  - `b2.sub` "Moving 1,186 SKR to your wallet."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to J1·ok after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Failed → J1·f · Not enough SOL → M3
- **Data:** tx.status
- **Entered from:** J1, J1·f

### J1·ok — Claimed
- **Layout:** NavBar · close (✕) · tone lime · beam · fx coins · pops: +1,186 SKR
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (1)
- **Keeper:** shades — "Pleasure doing business."
- **Copy:**
  - `b2.title` "Claimed."
  - `b2.sub` "1,186 SKR is in your wallet."
  - `pin.0` "Done"
  - `brand.stamp` "CLAIMED · 1,186 SKR"
- **Actions:**
  - pinned "Done" → B1
- **Data:** claim.amount, tx.signature
- **Entered from:** J1·p

### J1·f — Claim failed
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, PinnedActions (1)
- **Copy:**
  - `b1.chip` "Transaction failed"
  - `b2.title` "Claim failed."
  - `b2.sub` "Nothing moved. Your 1,186 SKR is still waiting."
  - `pin.0` "Retry"
- **Actions:**
  - pinned "Retry" → J1·p
- **Data:** tx.error
- **Entered from:** J1, J1·p

---

## K · Create a Bounty

### K1 — Basics
- **Layout:** NavBar · StepBar 1/5 · close (✕)
- **Components (top→bottom):** Title, SentenceInput, OptionGrid, MonoLabel, Segmented, PinnedActions (1)
- **Copy:**
  - `b0.title` "Set the challenge."
  - `b0.sub` "Public, free to join. Miss a day and you're out."
  - `b1.label` "Title"
  - `b1.sug.0` "Dawn Pages"
  - `b1.sug.1` "Hydrate Week"
  - `b1.sug.2` "Iron Month"
  - `b2.o0.t` "Dumbbell"
  - `b2.o1.t` "Book"
  - `b2.o2.t` "Water bottle"
  - `b2.o3.t` "Guitar"
  - `b2.o4.t` "Running shoe"
  - `b2.o5.t` "Plant"
  - `b2.o6.t` "Skipping rope"
  - `b2.o7.t` "Yoga mat"
  - `b3.o0.t` "3"
  - `b3.o0.s` "days"
  - `b3.o1.t` "7"
  - `b3.o1.s` "days"
  - `b3.o2.t` "14"
  - `b3.o2.s` "days"
  - `b4.text` "JOINS CLOSE"
  - `b5.seg.0` "12 h"
  - `b5.seg.1` "24 h"
  - `b5.seg.2` "48 h"
  - `b5.seg.3` "Day 1 ends"
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → K2
- **Data:** bountyDraft {title, object, length, joinWindowHours}
- **Entered from:** +, H1·c, I4

### K2 — Pool
- **Layout:** NavBar · StepBar 2/5 · back · content depends on the user's current selections
- **Components (top→bottom):** Title, MoneyMoment, OptionGrid, Breakdown, PinnedActions (1)
- **Copy:**
  - `b0.title` "Fund the pool."
  - `b0.sub` "Survivors split it equally at the end."
  - `b1.value` "50,000"
  - `b1.caption` "SKR in the pool"
  - `b2.o0.t` "10k"
  - `b2.o1.t` "25k"
  - `b2.o2.t` "50k"
  - `b2.o3.t` "100k"
  - `b3.row0.l` "Pool"
  - `b3.row0.v` "50,000 SKR"
  - `b3.row1.l` "KEPT fee (10%)"
  - `b3.row1.v` "5,000 SKR"
  - `b3.row2.l` "You pay"
  - `b3.row2.v` "55,000 SKR"
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → K3
- **Data:** bountyDraft.pool, fee=10%
- **Entered from:** K1

### K3 — Branding
- **Layout:** NavBar · StepBar 3/5 · back
- **Components (top→bottom):** Title, UploadBox, SentenceInput, PinnedActions (1)
- **Copy:**
  - `b0.title` "Make it yours."
  - `b0.sub` "Shown on the Bounty card and detail page."
  - `b1.title` "Add a cover"
  - `b1.sub` "1200 × 600 · JPG or PNG"
  - `b2.label` "Message"
  - `b2.sug.0` "Read before your phone. 14 mornings."
  - `b2.sug.1` "Prove it before breakfast."
  - `b3.label` "One link"
  - `b3.sug.0` "dawnpages.xyz"
  - `pin.0` "Next"
- **Actions:**
  - pinned "Next" → K4
- **Data:** bountyDraft {cover, message, link}
- **Entered from:** K2

### K4 — Requirements
- **Layout:** NavBar · StepBar 4/5 · back
- **Components (top→bottom):** Title, RowList, OptionGrid, PinnedActions (1)
- **Copy:**
  - `b0.title` "Who can join?"
  - `b0.sub` "Optional. Every entrant needs a verified Seeker either way."
  - `b1.r0.t` "Minimum kept rate"
  - `b1.r0.s` "Filters out flaky entrants"
  - `b2.o0.t` "60%"
  - `b2.o1.t` "70%"
  - `b2.o2.t` "80%"
  - `b2.o3.t` "90%"
  - `b3.r0.t` "Token held"
  - `b3.r0.s` "e.g. hold 1 PAGES"
  - `pin.0` "Next"
- **Actions:**
  - row toggle "Minimum kept rate" → toggle
  - row toggle "Token held" → toggle
  - pinned "Next" → K5
- **Data:** bountyDraft.requirements {minKeptRate?, tokenMint?}
- **Entered from:** K3

### K5 — Review & fund
- **Layout:** NavBar · StepBar 5/5 · back
- **Components (top→bottom):** Title, BountyCover, Breakdown, PinnedActions (1)
- **Copy:**
  - `b0.title` "Review and fund."
  - `b1.brand` "You"
  - `b1.msg` "Dawn Pages\nRead before your phone."
  - `b2.row0.l` "Object"
  - `b2.row0.v` "Book"
  - `b2.row1.l` "Length"
  - `b2.row1.v` "14 days"
  - `b2.row2.l` "Joins close"
  - `b2.row2.v` "24 h after launch"
  - `b2.row3.l` "Requirements"
  - `b2.row3.v` "70%+ kept rate"
  - `b2.row4.l` "Pool"
  - `b2.row4.v` "20,000 SKR"
  - `b2.row5.l` "Fee"
  - `b2.row5.v` "2,000 SKR"
  - `b2.row6.l` "You pay"
  - `b2.row6.v` "22,000 SKR"
  - `pin.0` "Sign & fund"
- **Actions:**
  - pinned "Sign & fund" → K5·p
- **Data:** bountyDraft (all), total = pool × 1.10
- **Entered from:** K4

### K5·p — Fund · signing
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, Note
- **Copy:**
  - `b1.chip` "Seeker Wallet"
  - `b2.title` "Fund Dawn Pages"
  - `b2.sub` "22,000 SKR into the pool and fee."
  - `b3.text` "Waiting for your signature…"
- **Auto:** advances to K5·ok after 2200 ms in the prototype (in the app: on wallet/server result).
- **Other states / outcomes:** Rejected → C7·no · Not enough SKR → M4
- **Data:** tx.status
- **Entered from:** K5

### K5·ok — Bounty live
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** SignStatus, Title, ButtonRow, PinnedActions (1)
- **Copy:**
  - `b1.chip` "20,000 SKR pool"
  - `b2.title` "Dawn Pages is live."
  - `b2.sub` "It's in Discover now. Joins close in 24 hours."
  - `b3.btn.0` "Share"
  - `pin.0` "Open stats"
- **Actions:**
  - button "Share" → toast "Share sheet opened"
  - pinned "Open stats" → H6
- **Data:** bounty.id
- **Entered from:** K5·p

---

## L · Results

### L1 — Kept every day
- **Layout:** NavBar · close (✕) · tone lime · beam · fx coins · pops: +186 SKR, 7 of 7
- **Components (top→bottom):** KeeperPlacement, Title, MoneyMoment, Breakdown, PinnedActions (1)
- **Keeper:** shades — "Seven for seven. Pay the Keeper."
- **Copy:**
  - `b1.title` "Iron Week, kept."
  - `b2.value` "1,186"
  - `b2.caption` "SKR · up 186"
  - `b3.row0.l` "Start"
  - `b3.row0.v` "1,000"
  - `b3.row1.l` "Lost"
  - `b3.row1.v` "0"
  - `b3.row2.l` "Won"
  - `b3.row2.v` "+186"
  - `b3.row3.l` "Final"
  - `b3.row3.v` "1,186 SKR"
  - `pin.0` "Claim 1,186 SKR"
  - `brand.stamp` "IRON WEEK · 7 OF 7"
- **Actions:**
  - pinned "Claim 1,186 SKR" → J1
- **Data:** settlement (me) {start, won, final}, oath.name, oath.length
- **Entered from:** Oath settles (D2 after last day) — shown once, then D4

### L2 — Missed some days
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** KeeperPlacement, Title, MoneyMoment, Breakdown, PinnedActions (1)
- **Keeper:** wink — "Two slips. Still walked out up."
- **Copy:**
  - `b1.title` "Iron Week is over."
  - `b1.sub` "You missed days 4 and 6."
  - `b2.value` "1,029"
  - `b2.caption` "SKR · up 29"
  - `b3.row0.l` "Start"
  - `b3.row0.v` "1,000"
  - `b3.row1.l` "Lost (2 misses)"
  - `b3.row1.v` "−357"
  - `b3.row2.l` "Won from others"
  - `b3.row2.v` "+386"
  - `b3.row3.l` "Final"
  - `b3.row3.v` "1,029 SKR"
  - `pin.0` "Claim 1,029 SKR"
  - `brand.stamp` "HYDRA 14 · SETTLED"
- **Actions:**
  - pinned "Claim 1,029 SKR" → J1
- **Data:** settlement (me) {start, lost, won, final, missedDays[]}
- **Entered from:** Oath settles with misses — shown once

### L3 — Oath broken
- **Layout:** NavBar · close (✕) · tone ember · fx embers
- **Components (top→bottom):** KeeperPlacement, Title, MoneyMoment, RowList, PinnedActions (2)
- **Keeper:** stern — "The pot burns. Nobody eats."
- **Copy:**
  - `b1.title` "Broken."
  - `b1.sub` "Guitar Days hit 0 HP on day 6."
  - `b2.value` "−1,000"
  - `b2.caption` "SKR · your whole stake"
  - `b3.label` "WHO MISSED"
  - `b3.r0.t` "Dev"
  - `b3.r0.s` "missed day 5"
  - `b3.r0.r` "−20 HP"
  - `b3.r1.t` "Arjun"
  - `b3.r1.s` "missed days 2 and 6"
  - `b3.r1.r` "−40 HP"
  - `pin.0` "Rematch · win back 500"
  - `pin.1` "Start a new Oath"
- **Actions:**
  - pinned "Rematch · win back 500" → R1
  - pinned "Start a new Oath" → C1
- **Data:** oath {brokenDay}, me.lost, members.misses[], rematch.expiresAt
- **Entered from:** Oath hits 0 HP — shown once, then D3

### L4 — Solo kept
- **Layout:** NavBar · close (✕) · fx coins
- **Components (top→bottom):** KeeperPlacement, Title, ChipRow, PinnedActions (1)
- **Keeper:** happy — "Fourteen days. No witnesses needed."
- **Copy:**
  - `b1.title` "Read 20 pages, kept."
  - `b1.sub` "14 of 14 days."
  - `b2.chip.0` "500 SKR back"
  - `b2.chip.1` "HP 100"
  - `b2.chip.2` "Streak 14"
  - `pin.0` "Claim 500 SKR"
- **Actions:**
  - pinned "Claim 500 SKR" → J1
- **Data:** solo settlement {final, hp, streak}
- **Entered from:** Solo Oath settles

### L4·m — Solo missed some
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** KeeperPlacement, Title, Breakdown, PinnedActions (1)
- **Keeper:** soft — "Two off days. You still finished."
- **Copy:**
  - `b1.title` "Read 20 pages is over."
  - `b1.sub` "Missed days 5 and 11."
  - `b2.row0.l` "Start"
  - `b2.row0.v` "500"
  - `b2.row1.l` "Lost (2 misses)"
  - `b2.row1.v` "−89"
  - `b2.row2.l` "HP at the end"
  - `b2.row2.v` "65"
  - `b2.row3.l` "Final"
  - `b2.row3.v` "411 SKR"
  - `pin.0` "Claim 411 SKR"
- **Actions:**
  - pinned "Claim 411 SKR" → J1
- **Data:** solo settlement {lost, final, missedDays[]}
- **Entered from:** Solo Oath settles with misses

### L4·b — Solo broken
- **Layout:** NavBar · close (✕) · tone ember · fx embers
- **Components (top→bottom):** KeeperPlacement, Title, HPPanel, PinnedActions (2)
- **Keeper:** stern — "Solo burns too."
- **Copy:**
  - `b1.title` "Read 20 pages broke\non day 9."
  - `b1.sub` "Three misses at −35 HP each. Your 500 SKR burned."
  - `b2.note` "Solo Oaths take heavier damage per miss."
  - `pin.0` "Solo Rematch · win back 250"
  - `pin.1` "Start a new Oath"
- **Actions:**
  - pinned "Solo Rematch · win back 250" → R1
  - pinned "Start a new Oath" → C1
- **Data:** solo {brokenDay, lost}, rematch
- **Entered from:** Solo Oath hits 0 HP

### L6 — Rematch kept
- **Layout:** NavBar · close (✕) · tone lime · beam · fx coins · pops: +500 back
- **Components (top→bottom):** KeeperPlacement, Title, MoneyMoment, Breakdown, PinnedActions (1)
- **Keeper:** shades — "The comeback. Theatrical, even."
- **Copy:**
  - `b1.title` "You ran it back."
  - `b1.sub` "Seven days kept. The Rematch held."
  - `b2.value` "+500"
  - `b2.caption` "SKR recovered from Guitar Days"
  - `b3.row0.l` "Rematch final"
  - `b3.row0.v` "1,129"
  - `b3.row1.l` "Recovered"
  - `b3.row1.v` "+500"
  - `b3.row2.l` "Claim"
  - `b3.row2.v` "1,629 SKR"
  - `pin.0` "Claim 1,629 SKR"
  - `brand.stamp` "REMATCH · COMEBACK"
- **Actions:**
  - pinned "Claim 1,629 SKR" → J1
- **Data:** rematch settlement {stakeBack, recovered, final}
- **Entered from:** R·act

### L5 — Bounty survived / out
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** Title, RowList
- **Copy:**
  - `b0.title` "Bounty results live with the Bounty."
  - `b1.r0.t` "Survived"
  - `b1.r0.s` "Sol Strings · +1,666 SKR"
  - `b1.r1.t` "Eliminated"
  - `b1.r1.s` "Hydrate Week · out on day 3"
- **Actions:**
  - row "Survived" → H5
  - row "Eliminated" → H4
- **Data:** bounty result {survived:boolean, payout?, eliminatedDay?}
- **Entered from:** Bounty ends / you are eliminated

---

## M · Notifications & errors

### M1 — Notifications
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** Title, RowList
- **Copy:**
  - `b0.title` "9:41"
  - `b0.sub` "Wednesday 8 October"
  - `b1.r0.t` "Riya nudged you. Your move."
  - `b1.r0.r` "now"
  - `b1.r1.t` "Iron Week: 2 hours to midnight."
  - `b1.r1.r` "19:58"
  - `b1.r2.t` "Dev wants your vote on a photo."
  - `b1.r2.r` "18:10"
  - `b1.r3.t` "Iron Week started. Day 1 is today."
  - `b1.r3.r` "Mon"
  - `b1.r4.t` "Daily recap ready: +43 SKR."
  - `b1.r4.r` "00:01"
  - `b1.r5.t` "Guitar Days broke. Rematch is open."
  - `b1.r5.r` "Sun"
  - `b1.r6.t` "Rematch closes tomorrow."
  - `b1.r6.r` "Sat"
  - `b1.r7.t` "Riya joined the Rematch."
  - `b1.r7.r` "Sat"
  - `b1.r8.t` "1,186 SKR ready to claim."
  - `b1.r8.r` "Fri"
  - `b1.r9.t` "Hydrate Week starts tomorrow."
  - `b1.r9.r` "Thu"
  - `b1.r10.t` "Drift posted a new Bounty."
  - `b1.r10.r` "Thu"
- **Data:** notifications[] {title, at}
- **Entered from:** system notifications (push)

### M2 — No internet
- **Layout:** NavBar · close (✕)
- **Components (top→bottom):** KeeperPlacement, Title, PinnedActions (1)
- **Keeper:** bored — "Can't reach the table."
- **Copy:**
  - `b2.title` "You're offline."
  - `b2.sub` "Photos need a connection to be checked. Reconnect before midnight."
  - `pin.0` "Retry"
- **Actions:**
  - pinned "Retry" → toast "Still offline"
- **Data:** network.online=false
- **Entered from:** any network call fails (global)

### M3 — Not enough SOL
- **Layout:** Bottom sheet over "Sign"
- **Components (top→bottom):** KeeperPlacement, Title, ButtonRow
- **Keeper:** shocked — "No gas in the tank."
- **Copy:**
  - `b1.title` "Not enough SOL for fees."
  - `b1.sub` "Signing costs about 0.000005 SOL. Your wallet has 0."
  - `b2.btn.0` "Get devnet SOL"
  - `b2.btn.1` "Cancel"
- **Actions:**
  - button "Get devnet SOL" → toast "+1 devnet SOL"
  - button "Cancel" → back
- **Data:** wallet.solBalance, tx.estimatedFee
- **Entered from:** C7, J1·p, W3·s

### M4 — Not enough SKR
- **Layout:** Bottom sheet over "Stake"
- **Components (top→bottom):** Title, ButtonRow
- **Copy:**
  - `b0.title` "You need 1,000 SKR."
  - `b0.sub` "You have 620 SKR. Pick a smaller stake, or grab test SKR from the faucet."
  - `b1.btn.0` "Open the faucet"
  - `b1.btn.1` "Pick a smaller stake"
- **Actions:**
  - button "Open the faucet" → I4
  - button "Pick a smaller stake" → C4
- **Data:** me.balance, required
- **Entered from:** C7, K5·p
