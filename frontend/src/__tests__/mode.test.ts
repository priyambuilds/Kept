// App mode (state/mode.ts, features/mode.ts): Demo and Live keep separate saved data, leaving Demo
// wipes it, and a chosen mode alone decides the API and the wallet (Demo: mock, Live: http + MWA), in
// development builds too: the Dev menu's overrides only apply before a mode is chosen.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWallet } from "@/chain";
import { mwaWallet } from "@/chain/mwa";
import { MOCK_WALLET } from "@/api/mock/slices";
import { SLICES } from "@/api/types";
import { exitDemo, setAppMode, skipToTomorrow, startDemo, startLive } from "@/features/mode";
import { getApi } from "@/api";
import { oathView } from "@/features/oaths/model";
import { clock } from "@/lib/clock";
import { useDeviceOaths } from "@/features/oaths/device";
import { DEFAULT_SCENARIO } from "@/api/mock/scenarios";
import { flags, mockWalletOn, useDev } from "@/state/dev";
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
  useDev.setState({ overrides: {}, mockWallet: false, scenario: DEFAULT_SCENARIO });
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

describe("Skip to tomorrow (Demo, Q6)", () => {
  const nowS = () => Math.floor(clock.now() / 1000);
  afterEach(() => clock.reset());
  it("ends the day and the mock settles it: an unproved day costs HP", async () => {
    useDev.setState({ scenario: "judges" }); // the release Demo's account
    await startDemo();
    const iron = async () => {
      const list = await getApi().oaths.list(MOCK_WALLET);
      return list.map((f) => oathView(f, nowS(), MOCK_WALLET)).find((v) => !v.facts.isSolo && !v.facts.bountyId && v.life === "active")!;
    };
    const before = await iron();
    await skipToTomorrow();
    const after = await getApi().oaths.list(MOCK_WALLET).then((l) => oathView(l.find((f) => f.id === before.facts.id)!, nowS(), MOCK_WALLET));
    expect(after.dayNumber).toBe(before.dayNumber + 1);
    expect(after.hp).not.toBe(before.hp);
  });
  it("does nothing in Live", async () => {
    await startLive();
    await skipToTomorrow();
    expect(clock.offsetMs()).toBe(0);
  });
});

describe("slices by mode", () => {
  const allMock = Object.fromEntries(SLICES.map((s) => [s, "mock"]));

  it("Live is http + MWA for every slice in a development build, whatever the Dev menu holds", async () => {
    await startLive();
    useDev.setState({ overrides: { inbox: "mock", ...allMock }, mockWallet: true });
    expect(SLICES.every((s) => flags()[s] === "http")).toBe(true);
    expect(getWallet()).toBe(mwaWallet);
    expect(mockWalletOn()).toBe(false);
  });

  it("Demo is the mock for every slice and never http, whatever the Dev menu holds", async () => {
    await startDemo();
    useDev.setState({ overrides: Object.fromEntries(SLICES.map((s) => [s, "http"])), mockWallet: false });
    expect(SLICES.every((s) => flags()[s] === "mock")).toBe(true);
    expect(getWallet()).not.toBe(mwaWallet);
  });

  it("Dev menu overrides only apply while no mode is chosen (tests and dev tooling)", () => {
    expect(useMode.getState().mode).toBeNull();
    useDev.setState({ overrides: { inbox: "mock" } });
    expect(flags().inbox).toBe("mock");
    expect(flags().auth).toBe("http");
  });

  it("release builds use the mode alone", async () => {
    await startLive();
    useDev.setState({ overrides: allMock, mockWallet: true });
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

describe("saved Dev menu settings", () => {
  it("keep the scenario only: overrides and the mock wallet are never saved, and older saves are ignored", async () => {
    await AsyncStorage.setItem("kept.dev", JSON.stringify({ state: { overrides: { auth: "mock" }, mockWallet: true, scenario: "fresh" }, version: 0 }));
    await useDev.persist.rehydrate();
    expect(useDev.getState()).toMatchObject({ overrides: {}, mockWallet: false, scenario: "fresh" });

    useDev.setState({ overrides: { auth: "mock" }, mockWallet: true, scenario: "broken" });
    await settle();
    const saved = JSON.parse((await AsyncStorage.getItem("kept.dev"))!) as { state: Record<string, unknown> };
    expect(saved.state).toEqual({ scenario: "broken" });
  });

  it("a saved scenario that no longer exists falls back to the default", async () => {
    await AsyncStorage.setItem("kept.dev", JSON.stringify({ state: { scenario: "gone" }, version: 0 }));
    await useDev.persist.rehydrate();
    expect(useDev.getState().scenario).toBe(DEFAULT_SCENARIO);
  });
});

describe("Live in a release build", () => {
  it("refuses an API on localhost (no server on the phone)", () => {
    for (const url of ["http://localhost:3000", "http://127.0.0.1:3000", "http://10.0.2.2:3000", "http://localhost"]) expect(liveConfigured(url, false)).toBe(false);
    expect(liveConfigured("https://api.kept.app", false)).toBe(true);
    expect(liveConfigured("http://localhost:3000", true)).toBe(true);
  });
});
