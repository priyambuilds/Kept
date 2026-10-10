# Live end-to-end test report: what was real, what was fixed (2026-10-10)

Checked against this workspace's code, the Android emulator (Live, Phantom) and Devnet. Nothing in `backend/`
or `onchain/` changed; no transaction was signed (the solo create+start change was verified by simulation).

## The report's six "frontend fixes"

| # | Reported | Verdict here | Now |
|---|---|---|---|
| 1 | Fabric `addViewAt` crash opening the camera | Fix present (`Screen.tsx` always a ScrollView, camera mounts a beat after focus). On the emulator F1 opened with a live viewfinder, no crash, twice. | Kept. The mount effect failed ESLint (`setState` in an effect body): fixed, lint is clean again. |
| 2 | Challenge "expired instantly": ISO string vs epoch seconds | **The reported fix was the cause.** The shared `IsoTime` schema already converts to unix seconds; `new Date(r.expiresAt)` read seconds as milliseconds (1970), so every challenge was expired on arrival and Prove always landed on F2c. Logged on the emulator: raw `expiresAt 1791648349`, computed `1791648`. | `api/http/oaths.ts` uses `r.expiresAt` as is; the "end photo opens at" date had the same slip. Tests: `liveProof.test.ts` (fails with exactly `1791648` if the conversion returns). |
| 3 | Emulator camera `takePictureAsync` hang, 1.5 s timeout then a **fake photo** | The hang was not real: with the challenge fixed, a capture on the emulator completes in about a second. The fallback was harmful: any failure or a slow real capture (> 1.5 s) swapped in `"data:image/jpeg;base64,mock"` as the proof image, in Live too. | `Proof.tsx`: real timeout (10 s), and if the camera fails Live asks for a retake (new toast `additions.camera.failed`); the stand-in photo is Demo-only. Shutter waits for the challenge. Tests in `liveProof.test.ts`. |
| 4 | Premature "transaction expired" in `mwa.ts` | The 15 s grace is in place and is sound (the expiry check runs after the wallet returns, so keep polling a while for RPC lag before saying nothing landed). The stated cause (time spent in Phantom) is not what it addresses. | Kept as is. |
| 5 | Blank Today on active days | `TodayTab` now shows B3 whenever nothing is due and nothing is claimable; no blank path found. | Kept. |
| 6 | Avatar customization ended onboarding | Fix present (`profileActions.save` calls `setAvatar`). Untested. | Test added: `profileSave.test.ts`. |

## "Errors the user will face"

1. **F2b "Check unavailable"** — not fixable in the app. Live `submit` never sends the photo (`httpProof.submit` returns
   "unavailable"): the backend wants a model verdict from the phone (`/proof/verify`), and the app has no on-device model.
   Needs the product decision in `LIVE_DEMO_PLAN.md` Q1 (on-device check vs a server-side check). The app deliberately
   does not invent a verdict.
2. **Solo Oath asks to sign twice** — fixed in the app: one transaction, `create_oath` + `start_oath`
   (`chain/realTx.ts`, `createOath` now returns `started`). Simulated on Devnet (`err: null`); unit test in `realTx.test.ts`.
3. **Phantom "identity could not be verified"** — not an app bug. See `LIVE_SIGNIN_AUDIT.md` and BACKEND_GAPS P2-7: the
   Vercel `assetlinks.json` and the APK certificate match, Phantom still declines. Needs a look on the Seeker's wallet.
4. **Faucet 429** — the app already says "The faucet gives 5,000 SKR once per wallet" (the backend allows one claim per
   wallet, not one per 24 h). Nothing to change.
5. **Expo "Tools" button over the screen corner** — development builds only.

## Notes for whoever continues

- `frontend/src/features/queries.ts` is an unreferenced near-copy of `features/phase4.ts` (screens import `phase4`).
  Edit `phase4.ts`; the copy can be deleted.
- A running dev client keeps the bundle it last loaded. After changing source, reload (relaunch the dev-client URL):
  the emulator was showing a build with `[Shoot]` debug logging that the source no longer has.
