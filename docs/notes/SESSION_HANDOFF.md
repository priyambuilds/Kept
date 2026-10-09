Your usage limit was reached, so I stopped partway through Phase 1. Everything so far is committed as 84d69f3 (“WIP Phase 1”). The app typechecks cleanly, and all tests pass: engine 15, shared 3, chain 4, mobile 13.

There’s nothing to run on your phone yet. The Gallery screen isn’t built, so I can’t give you run instructions this session.

Done
Your answers: your CLAUDE.md change is committed. The docs now reflect the frontend-only scope, with the app computing Oath views itself. The cancel/leave-before-midnight change is written into BACKEND_GAPS P0-4.
packages/engine: the worked example comes out exact (1,468.75 / 779.17 / 1,468.75 / 166.67, fee 116.67). It also covers your rule amendments: the breaking day, Rematch recovery, day 1 at the creator’s midnight, kept rate and odds. Ten scenarios are exported as JSON test vectors for the Rust tests.
packages/shared: zod schemas for the existing routes and for the proposed ones.
packages/chain: IDL, PDAs, account decoding and instruction builders. A test proves the decoding matches the backend’s own byte-offset decoder.
Mobile app scaffold (Expo SDK 57, app.kept.mobile):
theme generated from tokens.json, with a test that fails if it goes stale
Geist fonts
typed t() over copy.json, with a test that templates reproduce it exactly
design assets synced in, Jest set up
Components written:
Button and its variants
Title, body text, Note, Banner, chips
Breakdown, Segmented, SearchBar, UploadBox, Skeleton
rows with Toggle
SignStatus, KeptRateRing, IdentityRow, DayStrip, BarChart
HPBar, HPPanel, OathCard, DayMemberGrid
MoneyMoment, OptionGrid, SentenceInput, SeatSlots, QRCard
BountyCover, HScroller, InboxList, ProfileCard
Avatar (ported exactly from the prototype) and AvatarBuilder
Keeper (PNG fallback), KeeperPlacement, KeeperMark, KeeperNote
camera frame, shutter, brand blocks
Left in Phase 1
Chrome components: status bar with the DEVNET badge, tab header, nav bar with step bar, tab bar and + button, bottom sheet, toast, the coin/ember effects layer, and the ambient background.
The Gallery screen showing every state.
Component tests for each component.
Lint: an ESLint config with rules that ban hardcoded colours and strings, plus a pass moving a few remaining hardcoded numbers into metrics.ts.
Bundle check with npx expo export --platform android, then the steps to run the Gallery on your phone.
Docs: record the new copy additions in DECISIONS.md. The avatar builder’s labels and screen-reader labels are missing from copy.json; I’ve put them in additions.json, marked by source.
Two things to know
Template files removed: the Expo template added a .claude/settings.json that would have enabled a Claude plugin, plus an AGENTS.md. I removed both.
pnpm setting moved: pnpm 12 ignores .npmrc, so the hoisted setting now lives in pnpm-workspace.yaml.