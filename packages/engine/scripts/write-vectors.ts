// Regenerates test-vectors/oath-vectors.json from SCENARIOS. Run: pnpm --filter @kept/engine vectors
import { writeFileSync } from "node:fs";
import { SCENARIOS, vectorOf } from "../src/vectors";

const out = {
  $meta: {
    about: "KEPT Oath rule vectors (design/rules.md + docs/DECISIONS.md amendments). Amounts are SKR base units (6 decimals) as strings.",
    generatedBy: "packages/engine/scripts/write-vectors.ts",
    marks: "one string per finished day, one char per member: k = kept, m = missed",
  },
  vectors: SCENARIOS.map(vectorOf),
};
writeFileSync(new URL("../test-vectors/oath-vectors.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${out.vectors.length} vectors`);
