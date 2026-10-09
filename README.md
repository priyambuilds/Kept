# KEPT

Android app for the Solana Seeker: swear daily Oaths, stake SKR, prove each day with two photos.

| Path | What |
|---|---|
| `apps/api` | Express + Prisma backend (V4 Devnet prototype) |
| `apps/mobile` | the new Expo app (from Phase 1) |
| `programs/kept` | Anchor program `kept_test` (`6iXXBqsdiCnUTSVf8CW3Uuw8c7iYvZSj5haz64QMuMUh`) |
| `packages/*` | shared config, engine, schemas, chain client (from Phase 1) |
| `design/` | the design handoff (read-only source of truth) |
| `docs/` | architecture, backend gaps, decisions, build plan, API |
| `legacy/` | the old harness app, V3 code and docs (reference only, not built) |

## Setup
Requires Node ≥ 20, pnpm, Docker (local Postgres). For the program: Rust, Solana CLI (Agave), Anchor 1.2.0.

```bash
pnpm install
pnpm db:up                       # Postgres 16 on localhost:5432 (user/pass/db: kept)
cp apps/api/.env.example apps/api/.env   # then fill it in (see apps/api/.env.example)
pnpm --filter @kept/api exec prisma migrate deploy
pnpm api:dev                     # http://localhost:3000
```

Checks: `pnpm typecheck`, `pnpm test`, `pnpm program:build`, `pnpm program:test`.

See `docs/ARCHITECTURE.md` and `docs/BUILD_PLAN.md`.
