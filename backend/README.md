# backend/

**Node backend**: Express + Prisma + Postgres API (package `kept-backend`). Owned by the backend developer and read-only for the frontend.

- `src/`: routes, jobs and services
- `prisma/`: schema and migrations
- `test/`: API tests (`pnpm api:test`)
- `scripts/`: build and devnet setup scripts
- `static/`: Android Digital Asset Links files. The live route serves this file from code (`src/routes/assetlinks.ts`).

Local Postgres: `pnpm db:up` (see `infra/`).
