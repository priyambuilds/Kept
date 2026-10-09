# onchain/

**On-chain backend** (Rust / Anchor workspace). Owned by the backend developer and read-only for the frontend.

| Path | What |
|---|---|
| `programs/kept_test/` | the Rust program (`6iXXBqsdiCnUTSVf8CW3Uuw8c7iYvZSj5haz64QMuMUh`) |
| `tests/` | LiteSVM TypeScript tests (`pnpm program:test`) |
| `scripts/` | ad-hoc devnet scripts (`test_*.ts`). Run them from `onchain/`, because they read `./target/idl`. |

Build with `pnpm program:build`, then copy the IDL to the app with `pnpm idl:sync` (into `packages/chain/idl`).
