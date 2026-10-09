// Copies the IDL + TS types that `pnpm program:build` writes into programs/kept/target.
// Run after every program change: pnpm --filter @kept/chain idl:sync
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target = new URL("../../../programs/kept/target/", import.meta.url);
for (const [from, to] of [["idl/kept_test.json", "kept_test.json"], ["types/kept_test.ts", "kept_test.ts"]]) {
  const src = new URL(from, target);
  if (!existsSync(src)) {
    console.error(`Missing ${fileURLToPath(src)}. Run \`pnpm program:build\` first.`);
    process.exit(1);
  }
  copyFileSync(src, new URL(`../idl/${to}`, import.meta.url));
  console.log(`copied ${from} -> packages/chain/idl/${to}`);
}
