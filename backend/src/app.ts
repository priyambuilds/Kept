import express from "express";
import { readFileSync } from "node:fs";
import { assetlinksRouter } from "./routes/assetlinks.js";
import { v4Router } from "./routes/v4.js";
import { bountyRouter } from "./routes/bounty.js";
import { proofVerifyRouter } from "./routes/proofVerify.js";
import { profileRouter } from "./routes/profile.js";
import { inboxRouter } from "./routes/inbox.js";

/** Same route tree for tests and the deployed server; importing it starts no jobs. */
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "12mb" }));
  app.get("/health", (_req, res) => {
    let build: unknown = { commit: "unbuilt", sourceSha256: null, builtAt: null };
    try { build = JSON.parse(readFileSync(new URL("./build-info.json", import.meta.url), "utf8")); } catch {}
    res.json({ ok: true, service: "kept-v4", apiVersion: 4, build });
  });
  app.use(v4Router);
  app.use(bountyRouter);
  app.use(proofVerifyRouter);
  app.use(profileRouter);
  app.use(inboxRouter);
  app.use(assetlinksRouter);
  return app;
}
