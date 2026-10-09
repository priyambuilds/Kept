// Reanimated 4 + worklets in Jest: use the mocks both packages ship, then Reanimated's test helpers.
jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
