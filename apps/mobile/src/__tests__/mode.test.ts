// App mode (state/mode.ts, features/mode.ts): Demo and Live keep separate saved data, leaving Demo
// wipes it, and release builds use the mode alone (Dev menu overrides are development-only).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWallet } from "@/chain";
import { mwaWallet } from "@/chain/mwa";
import { MOCK_WALLET } from "@/api/mock/slices";
import { SLICES } from "@/api/types";
import { exitDemo, setAppMode, startDemo, startLive } from "@/features/mode";
import { useDeviceOaths } from "@/features/oaths/device";
import { flags, useDev } from "@/state/dev";
import { useMode } from "@/state/mode";
import { useSession } from "@/state/session";
import { useSettings } from "@/state/settings";
import { storageScope } from "@/state/storage";
import { liveConfigured } from "@/config/env";

const LIVE_WALLET = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const settle = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  await setAppMode(null);
  await AsyncStorage.clear();
  useDev.setState({ overrides: {}, mockWallet: false });
});

describe("app mode", () => {
  it("starts with no mode chosen", () => {
    expect(useMode.getState().mode).toBeNull();
    expect(storageScope()).toBe("none");
  });

  it("Demo signs in on the sample account with no wallet", async () => {
    await startDemo();
    expect(useMode.getState().mode).toBe("demo");
    expect(useSession.getState()).toMatchObject({ wallet: MOCK_WALLET, genesis: true });
    expect(getWallet()).not.toBe(mwaWallet);
  });

  it("keeps Demo and Live data apart", async () => {
    await startLive();
    useSession.getState().signIn({ token: "live-token", wallet: LIVE_WALLET, genesis: true });
    useSettings.getState().set({ profileTipSeen: true });
    await settle();

    await startDemo();
    expect(useSession.getState().wallet).toBe(MOCK_WALLET);
    expect(useSettings.getState().profileTipSeen).toBe(false);
    useDeviceOaths.getState().rename("mock-1", "Demo name");
    await settle();

    await setAppMode("live");
    expect(useSession.getState()).toMatchObject({ token: "live-token", wallet: LIVE_WALLET });
    expect(useSettings.getState().profileTipSeen).toBe(true);
    expect(useDeviceOaths.getState().names["mock-1"]).toBeUndefined();
    expect(getWallet()).toBe(mwaWallet);
  });

  it("leaving Demo wipes it and asks for the mode again", async () => {
    await startDemo();
    useDeviceOaths.getState().rename("mock-1", "Demo name");
    await settle();
    expect((await AsyncStorage.getAllKeys()).some((k) => k.startsWith("kept.demo."))).toBe(true);

    await exitDemo();
    expect(useMode.getState().mode).toBeNull();
    expect(useSession.getState().wallet).toBeNull();
    expect((await AsyncStorage.getAllKeys()).some((k) => k.startsWith("kept.demo."))).toBe(false);

    await startDemo();
    expect(useDeviceOaths.getState().names["mock-1"]).toBeUndefined();
  });
});

describe("slices by mode", () => {
  it("development builds apply Dev menu overrides on top of the mode", async () => {
    await startLive();
    useDev.setState({ overrides: { inbox: "mock" } });
    expect(flags().inbox).toBe("mock");
    expect(flags().auth).toBe("http");
  });

  it("release builds use the mode alone", async () => {
    await startLive();
    useDev.setState({ overrides: Object.fromEntries(SLICES.map((s) => [s, "mock"])), mockWallet: true });
    const g = global as unknown as { __DEV__: boolean };
    const dev = g.__DEV__;
    g.__DEV__ = false;
    try {
      expect(SLICES.every((s) => flags()[s] === "http")).toBe(true);
      expect(getWallet()).toBe(mwaWallet);
    } finally {
      g.__DEV__ = dev;
    }
  });
});

describe("Live in a release build", () => {
  it("refuses an API on localhost (no server on the phone)", () => {
    for (const url of ["http://localhost:3000", "http://127.0.0.1:3000", "http://10.0.2.2:3000", "http://localhost"]) expect(liveConfigured(url, false)).toBe(false);
    expect(liveConfigured("https://api.kept.app", false)).toBe(true);
    expect(liveConfigured("http://localhost:3000", true)).toBe(true);
  });
});
