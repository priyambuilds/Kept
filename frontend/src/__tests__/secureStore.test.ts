// lib/secureStore: the Keystore when the native module exists; in development without it, AsyncStorage.
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("secure store", () => {
  beforeEach(async () => { jest.resetModules(); await AsyncStorage.clear(); });

  it("uses the Keystore when it is there", async () => {
    const { secureStore } = require("@/lib/secureStore") as typeof import("@/lib/secureStore");
    await secureStore.setItem("k", "v");
    expect(await secureStore.getItem("k")).toBe("v");
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it("without the native module, a development build falls back to AsyncStorage instead of crashing at startup", async () => {
    jest.doMock("expo", () => ({ requireOptionalNativeModule: () => null }));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { secureStore } = require("@/lib/secureStore") as typeof import("@/lib/secureStore");
    await secureStore.setItem("k", "v");
    expect(await secureStore.getItem("k")).toBe("v");
    await secureStore.deleteItem("k");
    expect(await secureStore.getItem("k")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("a release build does not downgrade: it fails loudly", async () => {
    jest.doMock("expo", () => ({ requireOptionalNativeModule: () => null }));
    const g = global as unknown as { __DEV__: boolean };
    const dev = g.__DEV__;
    g.__DEV__ = false;
    try {
      const { secureStore } = require("@/lib/secureStore") as typeof import("@/lib/secureStore");
      await expect(Promise.resolve().then(() => secureStore.getItem("k"))).rejects.toThrow(/native module/);
    } finally { g.__DEV__ = dev; }
  });
});
