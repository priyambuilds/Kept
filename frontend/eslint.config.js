// ESLint flat config. On top of Expo's rules, two KEPT rules enforce "tokens and copy keys only"
// (CLAUDE.md › Mobile code rules): no colour literals outside src/theme, and no bare text in JSX (strings come from t()).
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

const COLOUR = "/^(#[0-9a-fA-F]{3,8}|rgba?\\(|hsla?\\()/";

module.exports = defineConfig([
  expoConfig,
  { ignores: ["node_modules/**", "android/**", "ios/**", ".expo/**", "src/theme/tokens.gen.ts", "scripts/**"] },
  {
    // The codebase keeps `import type` on its own line, which import/no-duplicates reports.
    rules: { "import/no-duplicates": "off" },
  },
  {
    files: ["src/__tests__/**"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["src/**/*.{ts,tsx}", "App.tsx"],
    ignores: ["src/theme/**", "src/__tests__/**"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: `Literal[value=${COLOUR}]`, message: "Use a colour token from @/theme, not a literal." },
        { selector: `TemplateElement[value.raw=${COLOUR}]`, message: "Use a colour token from @/theme, not a literal." },
      ],
      "react/jsx-no-literals": ["error", { ignoreProps: true }],
    },
  },
  {
    // Avatar art is generated from the prototype's palettes (avatar/palette.ts) and the dev Gallery
    // labels sections with component names.
    files: ["src/components/avatar/**", "src/dev/**"],
    rules: { "no-restricted-syntax": "off", "react/jsx-no-literals": "off" },
  },
]);
