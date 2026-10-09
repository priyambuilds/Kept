# Flow map

Every route in the playable demo and the transitions between them. Generated from the prototype's links, pinned buttons, simulated outcomes, auto-advances and global chrome (tabs, +, bell, balance chip, settings cog).

## Navigation model (React Navigation)

```
RootStack (headerShown: false)
├─ Splash A0 ─► Onboarding stack: A1 → A2 → A2·s → A3 | A3·no → (A4) → Tabs   (invite flag → E1)
├─ Tabs (custom TabBar)
│   ├─ Today    B1 (states B2 B3 B4)
│   ├─ Oaths    D0
│   ├─ Bounties H1 (H1·j, H1·c are the segmented sub-views)
│   └─ Profile  I1
├─ Modal sheets: + · B5 · D1·x · M3 · M4
├─ Full-screen flows (stack, slide from right): C1–C8 · E1–E3 · F1–F5 · G1–G3 · K1–K5 · R1–R4 · J1 · W1–W4 · N1 · D1–D5 · H2–H7 · I2–I9
└─ Full-screen moments (fade, no back gesture until settled): L1–L6, J1·ok, C7·ok, K5·ok, F5
```
Signing screens (·s, ·p, C7, D1·go, D1·xs, R2) are transient: replace them in the stack with the result screen (no back to a pending state).

Global chrome on every tab screen: TabBar → B1 / D0 / H1 / I1 · PlusButton → `+` · Bell → N1 · BalanceChip → W1 · KeeperMark → KeeperNote overlay.

## Special route forms used in the prototype
| Form | Meaning |
|---|---|
| `D2` | push screen |
| `<` | back |
| `toast:Text` | stay, show Toast |
| `do:ids\|D2\|msg` | mark inbox items done, then navigate (optional toast) |
| `invite:A2` | navigate and remember the user arrived with an invite |
| `cont:B3` | go to B3, or E1 if the invite flag is set (then clear it) |

## Happy paths
1. **First launch:** A0 → A1 → A2 → A2·s → A3 → B3 (empty Today).
2. **Start a group Oath:** B3 / + → C1 → C2 → C3 → C4 (Group) → C5 → C6 → C7 → C7·ok → C8 → D1 → D1·go → D2.
3. **Start a solo Oath:** C4 (Solo) → C6 → C7 → C7·ok → D2.
4. **Join by invite:** + → E1 → E2 → E2·s → D1·m (or D2 if started).
5. **Daily proof:** B1 → F1 → F2 → F3 → (later) F4 → F4·chk → F5 → B2.
6. **Failed photo 2 ×3 (AI + group):** F4·chk → F4a·g → G2 → G3 | G3·no → D2.
7. **Review someone:** N1 / D2 banner → G1 → toast.
8. **Oath ends:** D2 → L1 | L2 → J1 → J1·p → J1·ok → B1.
9. **Oath breaks:** D2·low → L3 → R1 → R2 → R3 → R·act → L6 | R4·lost → J1.
10. **Bounty:** H1 → H2 → H3 → F1 … → H5 → J1 (or H4 when out).
11. **Create a Bounty:** + / H1·c → K1 → K2 → K3 → K4 → K5 → K5·p → K5·ok → H6.
12. **Money in:** BalanceChip → W1 → W2 / W3 → W3·s → W3·ok · W4 (receive).

## Route table
| Screen | Name | Goes to | Entered from |
|---|---|---|---|
| A0 | Splash | A1 | app launch (cold start) |
| A1 | Welcome | A2 | A0 |
| A2 | Connect wallet | A2·s | A1, A2·e, I4 |
| A2·s | Signing in | A2·e, A3·no, A3 | A2 |
| A2·e | Sign-in rejected | A2 | A2·s |
| A3 | Seeker verified | A4 | A2·s |
| A3·no | Not eligible | A4 | A2·s |
| B1 | Today, active | J1, F4, D2, F1, H3, B4, B2, B5, B3, D0, H1, I1, +, N1, W1 | B2, B3, B4, B5, D0, F3, F4a, F4a·g, H1, H1·j, H1·c, I1, J1·ok |
| B2 | Today, all done | D2, H3, B1, D0, H1, I1, +, N1, W1 | B1, F5 |
| B3 | Today, empty | C1, H2, B1, D0, H1, I1, +, N1, W1 | B1, A4 |
| B4 | Deadline close | F1, D2, B1, D0, H1, I1, +, N1, W1 | B1 |
| B5 | Daily recap | D2, H3, B1 | B1, N1 |
| + | + menu | C1, E1, K1 | B1, B2, B3, B4, D0, H1, H1·j, H1·c, I1 |
| C1 | Goal | C2 | B3, +, D3, E3·code, E3·late, E3·elig, E3·skr, H4, I2, L3, L4·b, W3·ok, I2·p |
| C2 | Object | C3 | C1 |
| C3 | Length | C4 | C2 |
| C4 | Solo or group, and stake | C5, C6 | C3, M4 |
| C5 | Review mode | C6 | C4, C4 when Group is selected |
| C6 | Review terms | C7 | C4, C5, C7·no, C7·fail |
| C7 | Signing | C7·no, C7·fail, M3, M4, C7·ok | C6, C7·no, C7·fail |
| C7·ok | Signed · success | C8, D2 | C7 |
| C7·no | Signed · rejected | C7, C6 | C7, D1·xs, E2·s, R2, K5·p, W3·s |
| C7·fail | Signed · failed | C7, C6 | C7, D1·go |
| C8 | Invite | D1 | C7·ok, D1 |
| D0 | Oaths list | D2, D1, D4, D3, D5, B1, H1, I1, +, N1, W1 | B1, B2, B3, B4, D1·xs, H1, H1·j, H1·c, I1 |
| D1 | Open · creator | C8, D1·go, D1·x, D1·m | C8, D0 |
| D1·m | Open · member | — | D1, E2·s |
| D1·x | Cancel confirm | D1·xs | D1 |
| D1·xs | Cancel · signing | C7·no, D0 | D1·x |
| D1·go | Start · signing | C7·fail, D2 | D1 |
| D2 | Active | G1, I2, F4, D2·low, D3, D4 | B1, B2, B4, B5, C7·ok, D0, D1·go, E3·in, G1, G3, G3·no, I2, I2·p |
| D2·low | Active · HP low | I2, F4 | D2 |
| D3 | Broken | R1, C1 | D0, D2, D5 |
| D4 | Ended | J1 | D0, D2, D5 |
| E1 | Enter invite | E2, E3·code, E3·late, E3·in, E3·elig, E3·skr | +, E3·code, E3·late, E3·in, E3·elig |
| E2 | Oath preview | I2, E2·s | E1, I2, N1 |
| E2·s | Join · signing | C7·no, E3·skr, D1·m | E2 |
| E3·code | Invalid code | E1, C1 | E1 |
| E3·late | Already started | C1, E1 | E1 |
| E3·in | Already joined | D2, E1 | E1 |
| E3·elig | Not eligible | C1, E1 | E1 |
| E3·skr | Not enough SKR | I4, C1 | E1, E2·s |
| R1 | Rematch offer | R2 | D3, L3, L4·b, N1 |
| R2 | Rematch · signing | C7·no, R3 | R1 |
| R3 | Rematch lobby | R·act | R2 |
| R·act | Rematch, active | F1, L6, R4·lost | R3 |
| R4 | Rematch result | J1 | D5 |
| R4·lost | Rematch result · recovery lost | J1 | R·act |
| F1·perm | Camera permission | F1 | F1 |
| F1 | Photo 1 of 2 | F2, F1·perm, F2c | B1, B4, R·act, F1·perm, F2a, F2c, H1·j, H3 |
| F2 | Checking | F2a, F2b, F2c, F3 | F1, F2b |
| F2a | Failed | F1 | F2, F4·chk |
| F2b | Check unavailable | F2 | F2 |
| F2c | Challenge expired | F1 | F1, F2 |
| F3 | Photo 1 done | F4, B1 | F2 |
| F4 | Photo 2 of 2 | F4·chk | B1, D2, D2·low, F3, N1 |
| F4·chk | Checking photo 2 | F2a, F4a, F4a·g, F5 | F4 |
| F4a | 3 fails · AI only | B1 | F4·chk |
| F4a·g | 3 fails · group review | G2, B1 | F4·chk |
| F5 | Day kept | B2 | F4·chk |
| G1 | Review a photo | D2 | D2, N1 |
| G2 | Waiting for review | G3, G3·no | F4a·g |
| G3 | Review approved | D2 | G2 |
| G3·no | Review rejected | D2 | G2 |
| H1 | Feed · Discover | H1·j, H1·c, H7, H2, H2·no, B1, D0, I1, +, N1, W1 | B1, B2, B3, B4, D0, H1·j, H1·c, H2·no, H4, I1 |
| H1·j | Feed · Joined | H1, H1·c, F1, H3, H4, H5, B1, D0, I1, +, N1, W1 | H1, H1·c, I1, I4 |
| H1·c | Feed · Created | H1, H1·j, H6, K1, B1, D0, I1, +, N1, W1 | H1, H1·j |
| H2 | Bounty detail | I3, H3 | B3, H1, I3, N1, H7 |
| H2·no | Bounty · not eligible | H1, I1 | H1, H7 |
| H3 | Bounty, joined | F1, H4, H5 | B1, B2, B5, H1·j, H2, I2, N1 |
| H4 | Eliminated | C1, H1 | H1·j, H3, L5 |
| H5 | Bounty ended | J1 | H1·j, H3, I2, L5 |
| H6 | My created Bounty | — | H1·c, K5·ok |
| I1 | My profile | I8, D5, H1·j, I2·me, B1, D0, H1, +, N1, W1, I4 | B1, B2, B3, B4, D0, H1, H1·j, H1·c, H2·no, I8 |
| I2 | Someone's profile | E2, D2, H5, H3, C1, I2·p | D2, D2·low, E2 |
| I3 | Creator profile | H2 | H2 |
| I4 | Settings | I8, W1, I5, D5, H1·j, I7, K1, A2 | E3·skr, I1, M4 |
| J1 | Claim | J1·p, J1·f | B1, D4, R4, R4·lost, H5, L1, L2, L4, L4·m, L6, N1, W1 |
| J1·p | Claim · signing | J1·f, M3, J1·ok | J1, J1·f |
| J1·ok | Claimed | B1 | J1·p |
| J1·f | Claim failed | J1·p | J1, J1·p |
| K1 | Basics | K2 | +, H1·c, I4 |
| K2 | Pool | K3 | K1 |
| K3 | Branding | K4 | K2 |
| K4 | Requirements | K5 | K3 |
| K5 | Review & fund | K5·p | K4 |
| K5·p | Fund · signing | C7·no, M4, K5·ok | K5 |
| K5·ok | Bounty live | H6 | K5·p |
| L1 | Kept every day | J1 | Oath settles (D2 after last day) — shown once, then D4 |
| L2 | Missed some days | J1 | Oath settles with misses — shown once |
| L3 | Oath broken | R1, C1 | Oath hits 0 HP — shown once, then D3 |
| L4 | Solo kept | J1 | Solo Oath settles |
| L4·m | Solo missed some | J1 | Solo Oath settles with misses |
| L4·b | Solo broken | R1, C1 | Solo Oath hits 0 HP |
| L6 | Rematch kept | J1 | R·act |
| L5 | Bounty survived / out | H5, H4 | Bounty ends / you are eliminated |
| M1 | Notifications | — | system notifications (push) |
| M2 | No internet | — | any network call fails (global) |
| M3 | Not enough SOL | — | C7, J1·p, W3·s |
| M4 | Not enough SKR | I4, C4 | C7, K5·p |
| A4 | Pick a look | B3, I9 | A3, A3·no |
| N1 | Inbox | E2, G1, J1, R1, F4, B5, H3, H2 | B1, B2, B3, B4, D0, H1, H1·j, H1·c, I1 |
| W1 | Wallet | W2, W4, J1, I5 | B1, B2, B3, B4, D0, H1, H1·j, H1·c, I1, I4, W3·ok |
| W2 | Add SKR | W3, W4 | W1 |
| W3 | Swap SOL → SKR | W3·s | W2 |
| W3·s | Swap · signing | C7·no, M3, W3·ok | W3 |
| W3·ok | Swap done | W1, C1 | W3·s |
| W4 | Receive | — | W1, W2 |
| D5 | Oath history | D4, R4, D3 | D0, I1, I4 |
| H7 | Browse Bounties | H2·no, H2 | H1 |
| I2·me | How others see you | I7 | I1, I7 |
| I2·p | Private profile | D2, C1 | I2 |
| I5 | Your activity | — | I4, W1 |
| I7 | Who sees what | I2·me | I4, I2·me |
| I8 | Edit profile | I1 | I1, I4 |
| I9 | Avatar builder | — | A4 |

## Diagrams (Mermaid)

### A · Onboarding
```mermaid
flowchart LR
  nA0["A0 Splash"] --> nA1["A1 Welcome"]
  nA1["A1 Welcome"] --> nA2["A2 Connect wallet"]
  nA2["A2 Connect wallet"] --> nA2_183s["A2·s Signing in"]
  nA2_183s["A2·s Signing in"] --> nA2_183e["A2·e Sign-in rejected"]
  nA2_183s["A2·s Signing in"] --> nA3_183no["A3·no Not eligible"]
  nA2_183s["A2·s Signing in"] --> nA3["A3 Seeker verified"]
  nA2_183e["A2·e Sign-in rejected"] --> nA2["A2 Connect wallet"]
  nA3["A3 Seeker verified"] --> nA4["A4 Pick a look"]
  nA3_183no["A3·no Not eligible"] --> nA4["A4 Pick a look"]
  nA4["A4 Pick a look"] --> nB3["B3 Today, empty"]
  nA4["A4 Pick a look"] --> nI9["I9 Avatar builder"]
```

### B · Today
```mermaid
flowchart LR
  nB1["B1 Today, active"] --> nJ1["J1 Claim"]
  nB1["B1 Today, active"] --> nF4["F4 Photo 2 of 2"]
  nB1["B1 Today, active"] --> nD2["D2 Active"]
  nB1["B1 Today, active"] --> nF1["F1 Photo 1 of 2"]
  nB1["B1 Today, active"] --> nH3["H3 Bounty, joined"]
  nB1["B1 Today, active"] --> nB4["B4 Deadline close"]
  nB1["B1 Today, active"] --> nB2["B2 Today, all done"]
  nB1["B1 Today, active"] --> nB5["B5 Daily recap"]
  nB1["B1 Today, active"] --> nB3["B3 Today, empty"]
  nB1["B1 Today, active"] --> nplus["+ + menu"]
  nB1["B1 Today, active"] --> nN1["N1 Inbox"]
  nB1["B1 Today, active"] --> nW1["W1 Wallet"]
  nB2["B2 Today, all done"] --> nD2["D2 Active"]
  nB2["B2 Today, all done"] --> nH3["H3 Bounty, joined"]
  nB2["B2 Today, all done"] --> nB1["B1 Today, active"]
  nB2["B2 Today, all done"] --> nplus["+ + menu"]
  nB2["B2 Today, all done"] --> nN1["N1 Inbox"]
  nB2["B2 Today, all done"] --> nW1["W1 Wallet"]
  nB3["B3 Today, empty"] --> nC1["C1 Goal"]
  nB3["B3 Today, empty"] --> nH2["H2 Bounty detail"]
  nB3["B3 Today, empty"] --> nB1["B1 Today, active"]
  nB3["B3 Today, empty"] --> nplus["+ + menu"]
  nB3["B3 Today, empty"] --> nN1["N1 Inbox"]
  nB3["B3 Today, empty"] --> nW1["W1 Wallet"]
  nB4["B4 Deadline close"] --> nF1["F1 Photo 1 of 2"]
  nB4["B4 Deadline close"] --> nD2["D2 Active"]
  nB4["B4 Deadline close"] --> nB1["B1 Today, active"]
  nB4["B4 Deadline close"] --> nplus["+ + menu"]
  nB4["B4 Deadline close"] --> nN1["N1 Inbox"]
  nB4["B4 Deadline close"] --> nW1["W1 Wallet"]
  nB5["B5 Daily recap"] --> nD2["D2 Active"]
  nB5["B5 Daily recap"] --> nH3["H3 Bounty, joined"]
  nB5["B5 Daily recap"] --> nB1["B1 Today, active"]
  nplus["+ + menu"] --> nC1["C1 Goal"]
  nplus["+ + menu"] --> nE1["E1 Enter invite"]
  nplus["+ + menu"] --> nK1["K1 Basics"]
```

### N · Inbox
```mermaid
flowchart LR
  nN1["N1 Inbox"] --> nE2["E2 Oath preview"]
  nN1["N1 Inbox"] --> nG1["G1 Review a photo"]
  nN1["N1 Inbox"] --> nJ1["J1 Claim"]
  nN1["N1 Inbox"] --> nR1["R1 Rematch offer"]
  nN1["N1 Inbox"] --> nF4["F4 Photo 2 of 2"]
  nN1["N1 Inbox"] --> nB5["B5 Daily recap"]
  nN1["N1 Inbox"] --> nH3["H3 Bounty, joined"]
  nN1["N1 Inbox"] --> nH2["H2 Bounty detail"]
```

### C · Create an Oath
```mermaid
flowchart LR
  nC1["C1 Goal"] --> nC2["C2 Object"]
  nC2["C2 Object"] --> nC3["C3 Length"]
  nC3["C3 Length"] --> nC4["C4 Solo or group, and stake"]
  nC4["C4 Solo or group, and stake"] --> nC5["C5 Review mode"]
  nC4["C4 Solo or group, and stake"] --> nC6["C6 Review terms"]
  nC5["C5 Review mode"] --> nC6["C6 Review terms"]
  nC6["C6 Review terms"] --> nC7["C7 Signing"]
  nC7["C7 Signing"] --> nC7_183no["C7·no Signed · rejected"]
  nC7["C7 Signing"] --> nC7_183fail["C7·fail Signed · failed"]
  nC7["C7 Signing"] --> nM3["M3 Not enough SOL"]
  nC7["C7 Signing"] --> nM4["M4 Not enough SKR"]
  nC7["C7 Signing"] --> nC7_183ok["C7·ok Signed · success"]
  nC7_183ok["C7·ok Signed · success"] --> nC8["C8 Invite"]
  nC7_183ok["C7·ok Signed · success"] --> nD2["D2 Active"]
  nC7_183no["C7·no Signed · rejected"] --> nC7["C7 Signing"]
  nC7_183no["C7·no Signed · rejected"] --> nC6["C6 Review terms"]
  nC7_183fail["C7·fail Signed · failed"] --> nC7["C7 Signing"]
  nC7_183fail["C7·fail Signed · failed"] --> nC6["C6 Review terms"]
  nC8["C8 Invite"] --> nD1["D1 Open · creator"]
```

### D · Oaths
```mermaid
flowchart LR
  nD0["D0 Oaths list"] --> nD2["D2 Active"]
  nD0["D0 Oaths list"] --> nD1["D1 Open · creator"]
  nD0["D0 Oaths list"] --> nD4["D4 Ended"]
  nD0["D0 Oaths list"] --> nD3["D3 Broken"]
  nD0["D0 Oaths list"] --> nD5["D5 Oath history"]
  nD0["D0 Oaths list"] --> nplus["+ + menu"]
  nD0["D0 Oaths list"] --> nN1["N1 Inbox"]
  nD0["D0 Oaths list"] --> nW1["W1 Wallet"]
  nD1["D1 Open · creator"] --> nC8["C8 Invite"]
  nD1["D1 Open · creator"] --> nD1_183go["D1·go Start · signing"]
  nD1["D1 Open · creator"] --> nD1_183x["D1·x Cancel confirm"]
  nD1["D1 Open · creator"] --> nD1_183m["D1·m Open · member"]
  nD1_183x["D1·x Cancel confirm"] --> nD1_183xs["D1·xs Cancel · signing"]
  nD1_183xs["D1·xs Cancel · signing"] --> nC7_183no["C7·no Signed · rejected"]
  nD1_183xs["D1·xs Cancel · signing"] --> nD0["D0 Oaths list"]
  nD1_183go["D1·go Start · signing"] --> nC7_183fail["C7·fail Signed · failed"]
  nD1_183go["D1·go Start · signing"] --> nD2["D2 Active"]
  nD2["D2 Active"] --> nG1["G1 Review a photo"]
  nD2["D2 Active"] --> nI2["I2 Someone's profile"]
  nD2["D2 Active"] --> nF4["F4 Photo 2 of 2"]
  nD2["D2 Active"] --> nD2_183low["D2·low Active · HP low"]
  nD2["D2 Active"] --> nD3["D3 Broken"]
  nD2["D2 Active"] --> nD4["D4 Ended"]
  nD2_183low["D2·low Active · HP low"] --> nI2["I2 Someone's profile"]
  nD2_183low["D2·low Active · HP low"] --> nF4["F4 Photo 2 of 2"]
  nD3["D3 Broken"] --> nR1["R1 Rematch offer"]
  nD3["D3 Broken"] --> nC1["C1 Goal"]
  nD4["D4 Ended"] --> nJ1["J1 Claim"]
  nD5["D5 Oath history"] --> nD4["D4 Ended"]
  nD5["D5 Oath history"] --> nR4["R4 Rematch result"]
  nD5["D5 Oath history"] --> nD3["D3 Broken"]
```

### E · Join an Oath
```mermaid
flowchart LR
  nE1["E1 Enter invite"] --> nE2["E2 Oath preview"]
  nE1["E1 Enter invite"] --> nE3_183code["E3·code Invalid code"]
  nE1["E1 Enter invite"] --> nE3_183late["E3·late Already started"]
  nE1["E1 Enter invite"] --> nE3_183in["E3·in Already joined"]
  nE1["E1 Enter invite"] --> nE3_183elig["E3·elig Not eligible"]
  nE1["E1 Enter invite"] --> nE3_183skr["E3·skr Not enough SKR"]
  nE2["E2 Oath preview"] --> nI2["I2 Someone's profile"]
  nE2["E2 Oath preview"] --> nE2_183s["E2·s Join · signing"]
  nE2_183s["E2·s Join · signing"] --> nC7_183no["C7·no Signed · rejected"]
  nE2_183s["E2·s Join · signing"] --> nE3_183skr["E3·skr Not enough SKR"]
  nE2_183s["E2·s Join · signing"] --> nD1_183m["D1·m Open · member"]
  nE3_183code["E3·code Invalid code"] --> nE1["E1 Enter invite"]
  nE3_183code["E3·code Invalid code"] --> nC1["C1 Goal"]
  nE3_183late["E3·late Already started"] --> nC1["C1 Goal"]
  nE3_183late["E3·late Already started"] --> nE1["E1 Enter invite"]
  nE3_183in["E3·in Already joined"] --> nD2["D2 Active"]
  nE3_183in["E3·in Already joined"] --> nE1["E1 Enter invite"]
  nE3_183elig["E3·elig Not eligible"] --> nC1["C1 Goal"]
  nE3_183elig["E3·elig Not eligible"] --> nE1["E1 Enter invite"]
  nE3_183skr["E3·skr Not enough SKR"] --> nI4["I4 Settings"]
  nE3_183skr["E3·skr Not enough SKR"] --> nC1["C1 Goal"]
```

### R · Rematch
```mermaid
flowchart LR
  nR1["R1 Rematch offer"] --> nR2["R2 Rematch · signing"]
  nR2["R2 Rematch · signing"] --> nC7_183no["C7·no Signed · rejected"]
  nR2["R2 Rematch · signing"] --> nR3["R3 Rematch lobby"]
  nR3["R3 Rematch lobby"] --> nR_183act["R·act Rematch, active"]
  nR_183act["R·act Rematch, active"] --> nF1["F1 Photo 1 of 2"]
  nR_183act["R·act Rematch, active"] --> nL6["L6 Rematch kept"]
  nR_183act["R·act Rematch, active"] --> nR4_183lost["R4·lost Rematch result · recovery lost"]
  nR4["R4 Rematch result"] --> nJ1["J1 Claim"]
  nR4_183lost["R4·lost Rematch result · recovery lost"] --> nJ1["J1 Claim"]
```

### F · Daily proof
```mermaid
flowchart LR
  nF1_183perm["F1·perm Camera permission"] --> nF1["F1 Photo 1 of 2"]
  nF1["F1 Photo 1 of 2"] --> nF2["F2 Checking"]
  nF1["F1 Photo 1 of 2"] --> nF1_183perm["F1·perm Camera permission"]
  nF1["F1 Photo 1 of 2"] --> nF2c["F2c Challenge expired"]
  nF2["F2 Checking"] --> nF2a["F2a Failed"]
  nF2["F2 Checking"] --> nF2b["F2b Check unavailable"]
  nF2["F2 Checking"] --> nF2c["F2c Challenge expired"]
  nF2["F2 Checking"] --> nF3["F3 Photo 1 done"]
  nF2a["F2a Failed"] --> nF1["F1 Photo 1 of 2"]
  nF2b["F2b Check unavailable"] --> nF2["F2 Checking"]
  nF2c["F2c Challenge expired"] --> nF1["F1 Photo 1 of 2"]
  nF3["F3 Photo 1 done"] --> nF4["F4 Photo 2 of 2"]
  nF3["F3 Photo 1 done"] --> nB1["B1 Today, active"]
  nF4["F4 Photo 2 of 2"] --> nF4_183chk["F4·chk Checking photo 2"]
  nF4_183chk["F4·chk Checking photo 2"] --> nF2a["F2a Failed"]
  nF4_183chk["F4·chk Checking photo 2"] --> nF4a["F4a 3 fails · AI only"]
  nF4_183chk["F4·chk Checking photo 2"] --> nF4a_183g["F4a·g 3 fails · group review"]
  nF4_183chk["F4·chk Checking photo 2"] --> nF5["F5 Day kept"]
  nF4a["F4a 3 fails · AI only"] --> nB1["B1 Today, active"]
  nF4a_183g["F4a·g 3 fails · group review"] --> nG2["G2 Waiting for review"]
  nF4a_183g["F4a·g 3 fails · group review"] --> nB1["B1 Today, active"]
  nF5["F5 Day kept"] --> nB2["B2 Today, all done"]
```

### G · Group review
```mermaid
flowchart LR
  nG1["G1 Review a photo"] --> nD2["D2 Active"]
  nG2["G2 Waiting for review"] --> nG3["G3 Review approved"]
  nG2["G2 Waiting for review"] --> nG3_183no["G3·no Review rejected"]
  nG3["G3 Review approved"] --> nD2["D2 Active"]
  nG3_183no["G3·no Review rejected"] --> nD2["D2 Active"]
```

### H · Bounties
```mermaid
flowchart LR
  nH1["H1 Feed · Discover"] --> nH1_183j["H1·j Feed · Joined"]
  nH1["H1 Feed · Discover"] --> nH1_183c["H1·c Feed · Created"]
  nH1["H1 Feed · Discover"] --> nH7["H7 Browse Bounties"]
  nH1["H1 Feed · Discover"] --> nH2["H2 Bounty detail"]
  nH1["H1 Feed · Discover"] --> nH2_183no["H2·no Bounty · not eligible"]
  nH1["H1 Feed · Discover"] --> nplus["+ + menu"]
  nH1["H1 Feed · Discover"] --> nN1["N1 Inbox"]
  nH1["H1 Feed · Discover"] --> nW1["W1 Wallet"]
  nH1_183j["H1·j Feed · Joined"] --> nH1["H1 Feed · Discover"]
  nH1_183j["H1·j Feed · Joined"] --> nH1_183c["H1·c Feed · Created"]
  nH1_183j["H1·j Feed · Joined"] --> nF1["F1 Photo 1 of 2"]
  nH1_183j["H1·j Feed · Joined"] --> nH3["H3 Bounty, joined"]
  nH1_183j["H1·j Feed · Joined"] --> nH4["H4 Eliminated"]
  nH1_183j["H1·j Feed · Joined"] --> nH5["H5 Bounty ended"]
  nH1_183j["H1·j Feed · Joined"] --> nplus["+ + menu"]
  nH1_183j["H1·j Feed · Joined"] --> nN1["N1 Inbox"]
  nH1_183j["H1·j Feed · Joined"] --> nW1["W1 Wallet"]
  nH1_183c["H1·c Feed · Created"] --> nH1["H1 Feed · Discover"]
  nH1_183c["H1·c Feed · Created"] --> nH1_183j["H1·j Feed · Joined"]
  nH1_183c["H1·c Feed · Created"] --> nH6["H6 My created Bounty"]
  nH1_183c["H1·c Feed · Created"] --> nK1["K1 Basics"]
  nH1_183c["H1·c Feed · Created"] --> nplus["+ + menu"]
  nH1_183c["H1·c Feed · Created"] --> nN1["N1 Inbox"]
  nH1_183c["H1·c Feed · Created"] --> nW1["W1 Wallet"]
  nH2["H2 Bounty detail"] --> nI3["I3 Creator profile"]
  nH2["H2 Bounty detail"] --> nH3["H3 Bounty, joined"]
  nH2_183no["H2·no Bounty · not eligible"] --> nH1["H1 Feed · Discover"]
  nH2_183no["H2·no Bounty · not eligible"] --> nI1["I1 My profile"]
  nH3["H3 Bounty, joined"] --> nF1["F1 Photo 1 of 2"]
  nH3["H3 Bounty, joined"] --> nH4["H4 Eliminated"]
  nH3["H3 Bounty, joined"] --> nH5["H5 Bounty ended"]
  nH4["H4 Eliminated"] --> nC1["C1 Goal"]
  nH4["H4 Eliminated"] --> nH1["H1 Feed · Discover"]
  nH5["H5 Bounty ended"] --> nJ1["J1 Claim"]
  nH7["H7 Browse Bounties"] --> nH2_183no["H2·no Bounty · not eligible"]
  nH7["H7 Browse Bounties"] --> nH2["H2 Bounty detail"]
```

### I · Profiles
```mermaid
flowchart LR
  nI1["I1 My profile"] --> nI8["I8 Edit profile"]
  nI1["I1 My profile"] --> nD5["D5 Oath history"]
  nI1["I1 My profile"] --> nH1_183j["H1·j Feed · Joined"]
  nI1["I1 My profile"] --> nI2_183me["I2·me How others see you"]
  nI1["I1 My profile"] --> nplus["+ + menu"]
  nI1["I1 My profile"] --> nN1["N1 Inbox"]
  nI1["I1 My profile"] --> nW1["W1 Wallet"]
  nI1["I1 My profile"] --> nI4["I4 Settings"]
  nI2["I2 Someone's profile"] --> nE2["E2 Oath preview"]
  nI2["I2 Someone's profile"] --> nD2["D2 Active"]
  nI2["I2 Someone's profile"] --> nH5["H5 Bounty ended"]
  nI2["I2 Someone's profile"] --> nH3["H3 Bounty, joined"]
  nI2["I2 Someone's profile"] --> nC1["C1 Goal"]
  nI2["I2 Someone's profile"] --> nI2_183p["I2·p Private profile"]
  nI3["I3 Creator profile"] --> nH2["H2 Bounty detail"]
  nI4["I4 Settings"] --> nI8["I8 Edit profile"]
  nI4["I4 Settings"] --> nW1["W1 Wallet"]
  nI4["I4 Settings"] --> nI5["I5 Your activity"]
  nI4["I4 Settings"] --> nD5["D5 Oath history"]
  nI4["I4 Settings"] --> nH1_183j["H1·j Feed · Joined"]
  nI4["I4 Settings"] --> nI7["I7 Who sees what"]
  nI4["I4 Settings"] --> nK1["K1 Basics"]
  nI4["I4 Settings"] --> nA2["A2 Connect wallet"]
  nI2_183me["I2·me How others see you"] --> nI7["I7 Who sees what"]
  nI2_183p["I2·p Private profile"] --> nD2["D2 Active"]
  nI2_183p["I2·p Private profile"] --> nC1["C1 Goal"]
  nI7["I7 Who sees what"] --> nI2_183me["I2·me How others see you"]
  nI8["I8 Edit profile"] --> nI1["I1 My profile"]
```

### W · Wallet
```mermaid
flowchart LR
  nW1["W1 Wallet"] --> nW2["W2 Add SKR"]
  nW1["W1 Wallet"] --> nW4["W4 Receive"]
  nW1["W1 Wallet"] --> nJ1["J1 Claim"]
  nW1["W1 Wallet"] --> nI5["I5 Your activity"]
  nW2["W2 Add SKR"] --> nW3["W3 Swap SOL → SKR"]
  nW2["W2 Add SKR"] --> nW4["W4 Receive"]
  nW3["W3 Swap SOL → SKR"] --> nW3_183s["W3·s Swap · signing"]
  nW3_183s["W3·s Swap · signing"] --> nC7_183no["C7·no Signed · rejected"]
  nW3_183s["W3·s Swap · signing"] --> nM3["M3 Not enough SOL"]
  nW3_183s["W3·s Swap · signing"] --> nW3_183ok["W3·ok Swap done"]
  nW3_183ok["W3·ok Swap done"] --> nW1["W1 Wallet"]
  nW3_183ok["W3·ok Swap done"] --> nC1["C1 Goal"]
```

### J · Claim
```mermaid
flowchart LR
  nJ1["J1 Claim"] --> nJ1_183p["J1·p Claim · signing"]
  nJ1["J1 Claim"] --> nJ1_183f["J1·f Claim failed"]
  nJ1_183p["J1·p Claim · signing"] --> nJ1_183f["J1·f Claim failed"]
  nJ1_183p["J1·p Claim · signing"] --> nM3["M3 Not enough SOL"]
  nJ1_183p["J1·p Claim · signing"] --> nJ1_183ok["J1·ok Claimed"]
  nJ1_183ok["J1·ok Claimed"] --> nB1["B1 Today, active"]
  nJ1_183f["J1·f Claim failed"] --> nJ1_183p["J1·p Claim · signing"]
```

### K · Create a Bounty
```mermaid
flowchart LR
  nK1["K1 Basics"] --> nK2["K2 Pool"]
  nK2["K2 Pool"] --> nK3["K3 Branding"]
  nK3["K3 Branding"] --> nK4["K4 Requirements"]
  nK4["K4 Requirements"] --> nK5["K5 Review & fund"]
  nK5["K5 Review & fund"] --> nK5_183p["K5·p Fund · signing"]
  nK5_183p["K5·p Fund · signing"] --> nC7_183no["C7·no Signed · rejected"]
  nK5_183p["K5·p Fund · signing"] --> nM4["M4 Not enough SKR"]
  nK5_183p["K5·p Fund · signing"] --> nK5_183ok["K5·ok Bounty live"]
  nK5_183ok["K5·ok Bounty live"] --> nH6["H6 My created Bounty"]
```

### L · Results
```mermaid
flowchart LR
  nL1["L1 Kept every day"] --> nJ1["J1 Claim"]
  nL2["L2 Missed some days"] --> nJ1["J1 Claim"]
  nL3["L3 Oath broken"] --> nR1["R1 Rematch offer"]
  nL3["L3 Oath broken"] --> nC1["C1 Goal"]
  nL4["L4 Solo kept"] --> nJ1["J1 Claim"]
  nL4_183m["L4·m Solo missed some"] --> nJ1["J1 Claim"]
  nL4_183b["L4·b Solo broken"] --> nR1["R1 Rematch offer"]
  nL4_183b["L4·b Solo broken"] --> nC1["C1 Goal"]
  nL6["L6 Rematch kept"] --> nJ1["J1 Claim"]
  nL5["L5 Bounty survived / out"] --> nH5["H5 Bounty ended"]
  nL5["L5 Bounty survived / out"] --> nH4["H4 Eliminated"]
```

### M · Notifications & errors
```mermaid
flowchart LR
  nM4["M4 Not enough SKR"] --> nI4["I4 Settings"]
  nM4["M4 Not enough SKR"] --> nC4["C4 Solo or group, and stake"]
```

## Gaps the prototype only reaches through its screen map
- **A0** (Splash): app launch (cold start)
- **L1** (Kept every day): Oath settles (D2 after last day) — shown once, then D4
- **L2** (Missed some days): Oath settles with misses — shown once
- **L3** (Oath broken): Oath hits 0 HP — shown once, then D3
- **L4** (Solo kept): Solo Oath settles
- **L4·m** (Solo missed some): Solo Oath settles with misses
- **L4·b** (Solo broken): Solo Oath hits 0 HP
- **L5** (Bounty survived / out): Bounty ends / you are eliminated
- **M1** (Notifications): system notifications (push)
- **M2** (No internet): any network call fails (global)
- **C5** (Review mode): C4 when Group is selected
