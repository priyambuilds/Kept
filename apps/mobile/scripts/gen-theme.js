// Generates src/theme/tokens.gen.ts from design/tokens.json (the single source of truth).
// Run after the design tokens change: pnpm --filter @kept/mobile theme:gen
// src/__tests__/foundation.test.ts regenerates this in memory and fails if the checked-in file is stale.
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

function renderTokens(json) {
  return [
    "// GENERATED from design/tokens.json by scripts/gen-theme.js. Do not edit by hand.",
    "/* eslint-disable */",
    `export const tokens = ${JSON.stringify(json, null, 2)} as const;`,
    "export type Tokens = typeof tokens;",
    "",
  ].join("\n");
}

if (require.main === module) {
  const json = JSON.parse(readFileSync(join(__dirname, "../../../design/tokens.json"), "utf8"));
  writeFileSync(join(__dirname, "../src/theme/tokens.gen.ts"), renderTokens(json));
  console.log("wrote src/theme/tokens.gen.ts");
}

module.exports = { renderTokens };
