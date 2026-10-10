# frontend/

**UI**: the KEPT Android app for the Solana Seeker (Expo, React Native, TypeScript strict). Package `@kept/mobile`.

- `src/`: app code (components, features, screens, api and chain layers, state, theme, copy)
- `scripts/`: theme, layout, route and asset generators, plus screenshot and perf tooling
- `assets/`: raster assets synced from `design/assets`

Run it with `pnpm mobile:android` (first install) or `pnpm mobile:start`. See the root README.

## Live vs Demo, and the Dev menu

- **Demo** is the mock backend, wallet and chain, offline. **Live** is the real backend (`EXPO_PUBLIC_API_URL`, default the hosted Devnet one) and the wallet app through MWA, for every slice. A chosen mode decides alone, in development builds too: the Dev menu's slice overrides and mock wallet only apply while no mode is chosen and are never saved (only the mock scenario is).
- To try Live on an emulator you need a wallet app that speaks MWA (Phantom, or the MWA `fakewallet`); to use no wallet, use Demo.
- `EXPO_PUBLIC_*` values are inlined when Metro bundles the JS. A development build needs **no native rebuild** after changing one: restart Metro with `--clear` (`pnpm mobile:start -- --clear`). A release APK embeds them, so it must be rebuilt.
- Two Metro servers on port 8081 (this one and another project's) make `adb reverse` pick one at random. Give this one its own port: `pnpm mobile:start -- --port 8082`, then `adb reverse tcp:8082 tcp:8082` and open `exp+kept://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082`.
