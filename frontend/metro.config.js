// Expo's defaults (monorepo watch folders included), plus one size fix for the release bundle.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// zod re-exports all ~50 locales (`z.locales`, ~270 KB). The app never reads them: zod registers
// English itself (classic/schemas imports locales/en.js), so the index resolves to English only.
const zodLocales = path.join(__dirname, "src/lib/zodLocales.js");
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "../locales/index.js" && /[\\/]zod[\\/]v4[\\/](core|classic|mini)[\\/]/.test(context.originModulePath)) {
    return { type: "sourceFile", filePath: zodLocales };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
