// Live proof, below the screens: the backend's challenge as the app reads it, and what the shutter hands on.
import { httpProof } from "@/api/http/oaths";
import { createHttpClient } from "@/api/http/client";
import type { OathFacts } from "@/features/oaths/model";
import { capture, photoToUse } from "@/screens/proof/Proof";
import type { CameraView } from "expo-camera";

const oath = { id: "Oath1111111111111111111111111111111111111111", objectId: 3, bountyId: undefined } as unknown as OathFacts;
const reply = (body: unknown) => (() => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))) as unknown as typeof fetch;

describe("challenge from the backend", () => {
  // backend/src/v4/challenges.ts › challengeJson: ISO timestamps, five minutes apart.
  it("keeps its expiry as unix seconds, in the future (a second conversion made every challenge expire on arrival)", async () => {
    const issued = Date.now();
    const body = { phase: "start", photo: 1, gesture: "Thumb_Up", issuedAt: new Date(issued).toISOString(), expiresAt: new Date(issued + 300_000).toISOString() };
    const c = await httpProof(createHttpClient(() => "t", "http://api", reply(body))).challenge(oath, 1, 0);
    expect(c.expiresAt).toBe(Math.floor((issued + 300_000) / 1000));
    expect(c.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(c).toMatchObject({ photo: 1, dayIndex: 0, objectId: 3, gesture: "thumbs_up" });
  });

  it("says when the end photo opens, in real dates", async () => {
    const opens = Date.now() + 600_000;
    const body = { phase: "wait", photo: 2, waitSeconds: 600, startedAt: new Date().toISOString(), endAllowedAt: new Date(opens).toISOString(), startGesture: "Victory" };
    const err = await httpProof(createHttpClient(() => "t", "http://api", reply(body))).challenge(oath, 2, 0).catch((e: unknown) => e);
    expect(err).toMatchObject({ code: "PROOF_UNAVAILABLE" });
    expect((err as Error).message).toContain(new Date(Math.floor(opens / 1000) * 1000).toISOString());
  });
});

describe("shutter", () => {
  const camera = (takePictureAsync: () => Promise<{ base64?: string }>) => ({ takePictureAsync }) as unknown as CameraView;

  it("returns the photo the camera took", async () => {
    await expect(capture(camera(async () => ({ base64: "abc" })), 1000)).resolves.toBe("abc");
  });
  it("gives up on a camera that never answers, and on one that throws, instead of waiting forever", async () => {
    jest.useFakeTimers();
    try {
      const hung = capture(camera(() => new Promise(() => {})), 1000);
      await jest.advanceTimersByTimeAsync(1000);
      await expect(hung).resolves.toBeNull();
    } finally {
      jest.useRealTimers();
    }
    await expect(capture(camera(() => Promise.reject(new Error("camera busy"))), 1000)).resolves.toBeNull();
    await expect(capture(null, 1000)).resolves.toBeNull();
  });
  it("a chain Oath never gets a made-up photo; a mock Oath does, so a camera-less emulator still runs Demo", () => {
    expect(photoToUse("real", false)).toBe("real");
    expect(photoToUse("real", true)).toBe("real");
    expect(photoToUse(null, false)).toBeNull();
    expect(photoToUse(null, true)).toEqual(expect.any(String));
  });
});
