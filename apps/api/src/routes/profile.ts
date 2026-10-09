import { Router, Response, RequestHandler } from "express";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "../db.js";
import { authenticate } from "../auth.js";
import { genesisIdentity } from "../genesis.js";
import { connection, programId } from "../solana.js";
import { identityFields, keptRateFields, parseKeeper, reputationFields } from "../v4/reputation.js";

export const profileRouter = Router();
const asyncRoute = (fn: (req: any, res: Response) => unknown): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};

function walletParam(raw: string): string | null {
  try { return new PublicKey(raw).toBase58(); } catch { return null; }
}

/** Genesis identity, with `verifiedSeeker`/`method` alongside the original fields. */
export async function identityFor(wallet: string) {
  const identity = await genesisIdentity(wallet);
  const seat = await prisma.sessionSeat.findUnique({ where: { wallet } });
  return { wallet, ...identity, seatGenesisMint: seat?.genesisMint ?? null, ...identityFields(identity) };
}

/** Kept/missed counts: days from the backend's records, Oaths and streaks from the Keeper account. */
export async function reputationFor(wallet: string) {
  const keeperPda = PublicKey.findProgramAddressSync([Buffer.from("keeper"), new PublicKey(wallet).toBuffer()], programId)[0];
  const [account, daysKept, daysMissed, bountyEntries] = await Promise.all([
    connection.getAccountInfo(keeperPda, "confirmed"),
    prisma.oathProof.count({ where: { wallet, status: "RECORDED" } }),
    prisma.missedDay.count({ where: { wallet, frozen: false } }), // a freeze-covered day counts as kept for the Oath
    prisma.bountyEntry.findMany({ where: { wallet }, select: { out: true, paidAt: true } }),
  ]);
  const keeper = parseKeeper(account && account.owner.equals(programId) ? Buffer.from(account.data) : null);
  const stats = keeper && keeper !== "legacy" ? keeper : null;
  const days = { kept: daysKept, missed: daysMissed };
  const oaths = { kept: stats?.oathsKept ?? 0, missed: stats?.oathsMissed ?? 0 };
  return {
    wallet,
    ...reputationFields(days, oaths),
    ...keptRateFields(days),
    days,
    oaths,
    streak: { current: stats?.currentStreak ?? 0, best: stats?.bestStreak ?? 0 },
    keeper: keeper === null ? "none" : keeper === "legacy" ? "needs_migration" : "v4",
    bounties: { joined: bountyEntries.length, completed: bountyEntries.filter((e) => !e.out && e.paidAt).length, out: bountyEntries.filter((e) => e.out).length },
  };
}

/** Signed in. Whether a wallet holds a Seeker Genesis Token (or is on the Devnet allowlist). */
profileRouter.get("/identity/:wallet", authenticate, asyncRoute(async (req, res) => {
  const wallet = walletParam(req.params.wallet);
  if (!wallet) return res.status(400).json({ error: "Invalid wallet address" });
  return res.json(await identityFor(wallet));
}));

/** Signed in. Kept/missed counts for any wallet. */
profileRouter.get("/reputation/:wallet", authenticate, asyncRoute(async (req, res) => {
  const wallet = walletParam(req.params.wallet);
  if (!wallet) return res.status(400).json({ error: "Invalid wallet address" });
  return res.json(await reputationFor(wallet));
}));
