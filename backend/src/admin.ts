import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { adminSecretMatches } from "./v4/jobs.js";

/** Admin routes take the x-admin-secret header instead of a wallet session; unset ADMIN_SECRET disables them. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!config.adminSecret) return res.status(503).json({ error: "ADMIN_SECRET is not configured" });
  if (!adminSecretMatches(config.adminSecret, req.header("x-admin-secret"))) return res.status(401).json({ error: "Invalid admin secret" });
  next();
}
