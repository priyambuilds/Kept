# programs/

**On-chain backend** (Rust / Anchor). Owned by the backend developer and read-only for the frontend.

| Folder | What |
|---|---|
| `kept/` | Anchor workspace (`Anchor.toml`, `Cargo.toml`) |
| `kept/programs/kept_test/` | the Rust program (`6iXXBqsdiCnUTSVf8CW3Uuw8c7iYvZSj5haz64QMuMUh`) |
| `kept/tests/` | LiteSVM TypeScript tests (`pnpm program:test`) |
| `kept/scripts/` | ad-hoc devnet scripts (`test_*.ts`). Run them from `programs/kept/`, because they read `./target/idl`. |

Build with `pnpm program:build`. The IDL is copied to the app by `pnpm idl:sync` (into `packages/chain/idl`).
