# apps/

Runnable applications.

| Folder | Layer | Stack | Owner |
|---|---|---|---|
| `mobile/` | **UI**: the Android app for the Solana Seeker | Expo, React Native, TypeScript | frontend |
| `api/` | **Node backend**: auth, Oaths, proofs, push, price, faucet | Express, Prisma, Postgres | backend developer (read-only for the frontend) |

`api/static/` holds the Android Digital Asset Links files (`assetlinks.json`). The live route serves them from code (`src/routes/assetlinks.ts`).
