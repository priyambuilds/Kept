# Kickoff prompt for Claude Code

Paste the block below as your first message, with Claude Code opened at the repo root (`Kept-1/`).

```
Read CLAUDE.md, then design/README.md, design/rules.md, design/DESIGN.md, design/tokens.json, design/components.md and design/flows.md. Skim design/screens.md and design/copy.json. Then study backend/: README files, BACKEND_PART_1.md, src/, prisma/schema.prisma, kept-example/program (lib.rs, state.rs) and kept-example/app/src/chain (the wallet, PDA and IDL helpers).

Do NOT write app code yet. First produce:

1. docs/ARCHITECTURE.md:
   - the proposed monorepo structure (start from the one in CLAUDE.md and justify changes)
   - the package manager and workspace setup
   - how mobile, api, program and shared packages depend on each other
   - the mobile stack choices, with one line of reasoning each
   - the navigation choice
   - how the API layer switches between mock and http per feature

2. docs/BACKEND_GAPS.md: verify and complete the draft already in docs/. For every gap, confirm it against the actual code (file and line), mark it confirmed, partly done or already done, and add any gaps I missed. Sort by priority (blocks the core loop → nice to have).

3. docs/DECISIONS.md: every open decision from design/rules.md, plus anything else ambiguous, with the assumption you'll build with.

4. A phased build plan with milestones I can test on a phone after each phase.

Then stop and wait for my approval.

After I approve:
Phase 0: initial git commit of the current state; restructure with git mv; get the existing backend building and its tests passing in apps/api.
Phase 1: packages (config, shared schemas, engine with the worked-example test); the mobile app scaffold, theme from tokens, fonts, copy helper; all components plus the Gallery screen.
Phase 2: navigation shell (tabs, +, bell, balance chip, Keeper note host); the mock API with scenarios; real wallet sign-in against the existing backend.
Phase 3: core loop: A, B, C, D, E, F, J, L. Real backend and program where they're supported (create, join, start, cancel, check-in, settle and claim), mock for the rest.
Phase 4: R, G, H, K, I, N, W, M, mostly on mocks; record every gap.
Phase 5: motion, haptics, the Keeper, accessibility, performance, and Maestro smoke tests.

At the end of every phase:
- run typecheck, lint and tests
- tell me exactly how to run it on my phone
- list what's real versus mocked
- update docs/BACKEND_GAPS.md
```
