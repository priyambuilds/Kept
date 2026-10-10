import "./src/polyfills";
import { registerRootComponent } from "expo";
import App from "./App";
import { installCrashHandlers } from "./src/lib/crash";

installCrashHandlers();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App) and sets up the
// environment for both Expo Go and native builds.
registerRootComponent(App);
