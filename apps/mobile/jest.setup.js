/* global jest */
// Reanimated 4 + worklets in Jest: use the mocks both packages ship, then Reanimated's test helpers.
jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => {
  const mock = require("react-native-reanimated/mock");
  // The shipped mock leaves out useReducedMotion ("ADD ME IF NEEDED"). Tests run with Reduce Motion on, so
  // every component renders its end state and no count-up or loop schedules frames.
  return { ...mock, useReducedMotion: () => true };
});

// Native modules the Phase 2 shell touches.
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
jest.mock("@solana-mobile/mobile-wallet-adapter-protocol-web3js", () => ({ transact: jest.fn(() => Promise.reject(new Error("MWA is not available in tests"))) }));
