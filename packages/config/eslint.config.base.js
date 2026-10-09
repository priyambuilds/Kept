// Shared ESLint flat-config pieces. Apps add their own rules on top.
import tseslint from "typescript-eslint";

export const base = tseslint.config(...tseslint.configs.recommended, {
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
  },
});
export default base;
