import { Router, Request, Response, RequestHandler } from "express";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountIdempotentInstruction, createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import bs58 from "bs58";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { authenticate, AuthedRequest } from "../auth.js";
import { requireAdmin } from "../admin.js";
import { requireGenesis } from "../genesis.js";
import { connection, keypairFromEnv, tokenProgramForMint } from "../solana.js";
import { BOUNTY_DAYS, bountyDay, bountyEndTs, bountyJoinOpen, bountyKnockouts, MAX_BOUNTY_DAY_SECONDS, MIN_BOUNTY_DAY_SECONDS, parseBountyId, parseRecentlyOutLimit, parseTokenAmount, payoutAction, RECENTLY_OUT_MAX_LIMIT, sortRecentlyOut, splitPool, type OutEntry } from "../v4/bounty.js";
import { currentChallenge, dayChallenge, findSession, startSession } from "../v4/challenges.js";
import { combinedProofHash, DEFAULT_SESSION_MIN_MINUTES, sessionPhase, validMinMinutes } from "../v4/session.js";
import { lastClosedDay } from "../v4/jobs.js";
import { CHALLENGE_UPLOAD_GRACE_MS, GESTURE_TEXT, OBJECT_IDS, OBJECT_TEXT, type ChallengeGesture } from "../v4/rules.js";
import { claimVerification, releaseVerification } from "./proofVerify.js";

export const bountyRouter = Router();
const asyncRoute = (fn: (req: any, res: Response) => unknown): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};
const nowTs = () => Math.floor(Date.now() / 1000);
const challengeKey = (bountyId: number) => `bounty:${bountyId}`;

type Bounty = NonNullable<Awaited<ReturnType<typeof prisma.bounty.findUnique>>>;
type Entry = NonNullable<Awaited<ReturnType<typeof prisma.bountyEntry.findUnique>>>;

/** Wallet that pays bounty pools: BOUNTY_PAYER=faucet (default) or verifier, both keys the backend already holds. */
function bountyPayer(): Keypair {
  const raw = config.bountyPayer === "faucet" ? config.faucetSecretKey : config.bountyPayer === "verifier" ? config.verifierSecretKey : null;
  if (raw === null) throw new Error(`BOUNTY_PAYER must be "faucet" or "verifier" (got "${config.bountyPayer}")`);
  if (!raw) throw new Error(`BOUNTY_PAYER is "${config.bountyPayer}" but that secret key is not configured`);
  return keypairFromEnv(raw);
}

function bountyStatus(b: Bounty, now: number) {
  if (b.paidAt) return "PAID";
  if (now < b.startTs) return "UPCOMING";
  if (now < bountyEndTs(b)) return "ACTIVE";
  return "PAYING";
}

async function bountyView(b: Bounty, wallet: string | null) {
  const now = nowTs();
  const [entrants, stillIn, me] = await Promise.all([
    prisma.bountyEntry.count({ where: { bountyId: b.id } }),
    prisma.bountyEntry.count({ where: { bountyId: b.id, out: false } }),
    wallet ? prisma.bountyEntry.findUnique({ where: { bountyId_wallet: { bountyId: b.id, wallet } } }) : null,
  ]);
  return {
    bounty: {
      id: b.id, title: b.title, objectId: b.objectId, object: OBJECT_IDS[b.objectId], numDays: b.numDays, daySeconds: b.daySeconds, minMinutes: b.minMinutes,
      startTs: b.startTs, endTs: bountyEndTs(b), joinClosesAt: b.startTs + b.daySeconds, joinOpen: !b.paidAt && bountyJoinOpen(b, now),
      currentDay: bountyDay(b, now), status: bountyStatus(b, now), mint: b.mint, payer: b.payer, poolAmount: b.poolAmount.toString(),
      entrants, stillIn, estimatedShare: splitPool(b.poolAmount, stillIn).share.toString(), paidAt: b.paidAt?.toISOString() ?? null,
    },
    me: me ? entryView(me) : null,
  };
}

const entryView = (e: Entry) => ({
  joined: true, daysKept: e.daysKept, out: e.out, outDay: e.outDay, payoutAmount: e.payoutAmount?.toString() ?? null,
  payoutSignature: e.payoutSignature || null, paidAt: e.paidAt?.toISOString() ?? null,
});

bountyRouter.post("/admin/bounty", requireAdmin, asyncRoute(async (req: Request, res) => {
  const { title, objectId, numDays, poolSkr } = req.body ?? {};
  const daySeconds = req.body?.daySeconds ?? 86_400;
  const startTs = req.body?.startTs ?? nowTs();
  const minMinutes = req.body?.minMinutes ?? DEFAULT_SESSION_MIN_MINUTES;
  if (!validMinMinutes(minMinutes)) return res.status(400).json({ error: "minMinutes must be a whole number from 1 to 720" });
  if (typeof title !== "string" || !title.trim() || title.length > 80) return res.status(400).json({ error: "title must be 1–80 characters" });
  if (!Number.isInteger(objectId) || objectId < 0 || objectId >= OBJECT_IDS.length) return res.status(400).json({ error: `objectId must be 0–${OBJECT_IDS.length - 1}` });
  if (!BOUNTY_DAYS.includes(numDays)) return res.status(400).json({ error: `numDays must be one of ${BOUNTY_DAYS.join(", ")}` });
  if (!Number.isInteger(daySeconds) || daySeconds < MIN_BOUNTY_DAY_SECONDS || daySeconds > MAX_BOUNTY_DAY_SECONDS) return res.status(400).json({ error: `daySeconds must be ${MIN_BOUNTY_DAY_SECONDS}–${MAX_BOUNTY_DAY_SECONDS}` });
  if (!Number.isInteger(startTs) || startTs < nowTs() - 60) return res.status(400).json({ error: "startTs must be a unix time that is not in the past" });
  if (!config.stakeMint) return res.status(503).json({ error: "STAKE_MINT is not configured" });
  const open = await prisma.bounty.findFirst({ where: { paidAt: null } });
  if (open) return res.status(409).json({ error: `Bounty ${open.id} has not been paid out yet; only one bounty runs at a time` });

  const payer = bountyPayer();
  const mint = new PublicKey(config.stakeMint);
  const tokenProgram = await tokenProgramForMint(mint);
  const { decimals } = await getMint(connection, mint, "confirmed", tokenProgram);
  const pool = parseTokenAmount(poolSkr, decimals);
  if (pool === null || pool <= 0n) return res.status(400).json({ error: `poolSkr must be a positive amount with at most ${decimals} decimals` });
  const source = await getAssociatedTokenAddress(mint, payer.publicKey, false, tokenProgram);
  const balance = await getAccount(connection, source, "confirmed", tokenProgram).then((a) => a.amount).catch(() => 0n);
  if (balance < pool) return res.status(409).json({ error: "The bounty payer cannot cover this pool", payer: payer.publicKey.toBase58(), balance: balance.toString(), pool: pool.toString() });

  const bounty = await prisma.bounty.create({ data: { title: title.trim(), objectId, numDays, daySeconds, startTs, minMinutes, poolAmount: pool, mint: mint.toBase58(), payer: payer.publicKey.toBase58() } });
  return res.status(201).json(await bountyView(bounty, null));
}));

/** The running or upcoming bounty, or the most recently paid one when none is open. */
bountyRouter.get("/bounty/current", authenticate, asyncRoute(async (req: AuthedRequest, res) => {
  const bounty = await prisma.bounty.findFirst({ where: { paidAt: null }, orderBy: { startTs: "asc" } })
    ?? await prisma.bounty.findFirst({ orderBy: { paidAt: "desc" } });
  if (!bounty) return res.json({ bounty: null, me: null });
  return res.json(await bountyView(bounty, req.wallet));
}));

async function loadBounty(req: Request, res: Response): Promise<Bounty | null> {
  // Strict parse: a huge integer would make Prisma throw (500) instead of answering 404.
  const id = parseBountyId(req.params.id);
  const bounty = id === null ? null : await prisma.bounty.findUnique({ where: { id } });
  if (!bounty) { res.status(404).json({ error: "Bounty not found" }); return null; }
  return bounty;
}

bountyRouter.post("/bounty/:id/join", authenticate, requireGenesis, asyncRoute(async (req: AuthedRequest, res) => {
  const bounty = await loadBounty(req, res);
  if (!bounty) return;
  if (bounty.paidAt || !bountyJoinOpen(bounty, nowTs())) return res.status(409).json({ error: "Joining closed when day 1 ended" });
  try { await prisma.bountyEntry.create({ data: { bountyId: bounty.id, wallet: req.wallet } }); }
  catch { return res.status(409).json({ error: "You have already joined this bounty" }); }
  return res.status(201).json(await bountyView(bounty, req.wallet));
}));

/** The two reads GET /bounty/:id/recently-out needs; tests pass an in-memory store. */
export type RecentlyOutStore = {
  findBounty(id: number): Promise<{ id: number } | null>;
  outEntries(bountyId: number): Promise<OutEntry[]>;
};

const prismaRecentlyOutStore: RecentlyOutStore = {
  findBounty: (id) => prisma.bounty.findUnique({ where: { id }, select: { id: true } }),
  outEntries: (bountyId) => prisma.bountyEntry.findMany({ where: { bountyId, out: true }, select: { wallet: true, outDay: true, outAt: true } }),
};

/** Signed in (no Genesis check, like /bounty/current). Knocked-out entries, newest first (see sortRecentlyOut). */
export function recentlyOutHandler(store: RecentlyOutStore): RequestHandler {
  return asyncRoute(async (req: Request, res) => {
    const id = parseBountyId(req.params.id);
    const bounty = id === null ? null : await store.findBounty(id);
    if (!bounty) return res.status(404).json({ error: "Bounty not found" });
    const limit = parseRecentlyOutLimit(req.query.limit);
    if (limit === null) return res.status(400).json({ error: `limit must be a whole number from 1 to ${RECENTLY_OUT_MAX_LIMIT}` });
    const entries = sortRecentlyOut(await store.outEntries(bounty.id));
    return res.json({
      bountyId: bounty.id,
      total: entries.length,
      entries: entries.slice(0, limit).map((e) => ({ wallet: e.wallet, outDay: e.outDay, outAt: e.outAt?.toISOString() ?? null })),
    });
  });
}

bountyRouter.get("/bounty/:id/recently-out", authenticate, recentlyOutHandler(prismaRecentlyOutStore));

/** Shared gate for challenge and proof: joined, still in, inside a bounty day, not yet kept today. */
async function proofGate(req: AuthedRequest, res: Response) {
  const bounty = await loadBounty(req, res);
  if (!bounty) return null;
  const entry = await prisma.bountyEntry.findUnique({ where: { bountyId_wallet: { bountyId: bounty.id, wallet: req.wallet } } });
  if (!entry) { res.status(403).json({ error: "Join the bounty first" }); return null; }
  if (entry.out) { res.status(409).json({ error: `You are out of this bounty (missed day ${(entry.outDay ?? 0) + 1})` }); return null; }
  const day = bountyDay(bounty, nowTs());
  if (bounty.paidAt || day < 0 || day >= bounty.numDays) { res.status(409).json({ error: "The bounty is not running" }); return null; }
  if (entry.daysKept & (1 << day)) { res.status(409).json({ error: "Today is already kept" }); return null; }
  return { bounty, entry, day };
}

bountyRouter.post("/bounty/:id/challenge", authenticate, requireGenesis, asyncRoute(async (req: AuthedRequest, res) => {
  const gate = await proofGate(req, res);
  if (!gate) return;
  return res.json({ dayIndex: gate.day, ...(await dayChallenge(challengeKey(gate.bounty.id), req.wallet, gate.day)) });
}));

/** Photo 1 of 2 for a bounty day, same rules as Oaths. */
bountyRouter.post("/bounty/:id/start", authenticate, requireGenesis, asyncRoute(async (req: AuthedRequest, res) => {
  const { dayIndex, verificationId } = req.body ?? {};
  if (!Number.isInteger(dayIndex) || typeof verificationId !== "string") return res.status(400).json({ error: "Expected dayIndex and verificationId from POST /proof/verify" });
  const gate = await proofGate(req, res);
  if (!gate) return;
  const { bounty, day } = gate;
  if (dayIndex !== day) return res.status(409).json({ error: "Proof is outside today's bounty day" });
  const key = challengeKey(bounty.id);
  if (await findSession(key, req.wallet, day)) return res.status(409).json({ error: "Today's start photo is already done" });
  const challenge = await currentChallenge(key, req.wallet, day, null, CHALLENGE_UPLOAD_GRACE_MS);
  if (!challenge) return res.status(409).json({ error: "Gesture challenge expired; a new one is needed", challengeExpired: true });
  const object = OBJECT_IDS[bounty.objectId];
  const check = await claimVerification(verificationId, req.wallet, { object: OBJECT_TEXT[object], gesture: GESTURE_TEXT[challenge.gesture as ChallengeGesture] });
  if ("error" in check) return res.status(422).json({ error: check.error, expected: { object, gesture: challenge.gesture } });
  const started = await startSession(key, req.wallet, day, { hash: check.verification.proofHash, gesture: challenge.gesture, verificationId: check.verification.id }, bounty.minMinutes, bounty.daySeconds).catch(async (e) => { await releaseVerification(check.verification.id); throw e; });
  if (!started) { await releaseVerification(check.verification.id); return res.status(409).json({ error: "Today's start photo is already done" }); }
  return res.status(201).json({ dayIndex: day, ...started });
}));

/** Photo 2 of 2: after the wait, a passing check for the bounty object and the end challenge keeps the day. Only hashes are kept. */
bountyRouter.post("/bounty/:id/proof", authenticate, requireGenesis, asyncRoute(async (req: AuthedRequest, res) => {
  const { dayIndex, verificationId } = req.body ?? {};
  if (!Number.isInteger(dayIndex) || typeof verificationId !== "string") return res.status(400).json({ error: "Expected dayIndex and verificationId from POST /proof/verify" });
  const gate = await proofGate(req, res);
  if (!gate) return;
  const { bounty, entry, day } = gate;
  if (dayIndex !== day) return res.status(409).json({ error: "Proof is outside today's bounty day" });
  const session = await findSession(challengeKey(bounty.id), req.wallet, day);
  const phase = sessionPhase(session, Date.now());
  if (phase === "start") return res.status(409).json({ error: `Take today's start photo first (POST /bounty/${bounty.id}/start)`, phase });
  if (phase === "wait") return res.status(409).json({ error: "The end photo is not open yet", phase, endAllowedAt: session!.endAllowedAt.toISOString() });
  const challenge = await currentChallenge(challengeKey(bounty.id), req.wallet, day, session, CHALLENGE_UPLOAD_GRACE_MS);
  if (!challenge) return res.status(409).json({ error: "Gesture challenge expired; a new one is needed", challengeExpired: true });
  const expected = { object: OBJECT_IDS[bounty.objectId], gesture: challenge.gesture };
  const check = await claimVerification(verificationId, req.wallet, { object: OBJECT_TEXT[expected.object], gesture: GESTURE_TEXT[expected.gesture as ChallengeGesture] });
  if ("error" in check) return res.status(422).json({ error: check.error, expected });
  const v = check.verification;
  const dayHash = combinedProofHash(session!.startHash, v.proofHash);
  const daysKept = entry.daysKept | (1 << day);
  try {
    await prisma.$transaction([
      prisma.bountyProof.create({ data: { bountyId: bounty.id, wallet: req.wallet, dayIndex: day, proofHash: dayHash, objectLabel: expected.object, objectConfidence: v.objectConfidence, gestureLabel: v.gestureSeen, gestureConfidence: v.gestureMatches ? 1 : 0, challengeGesture: challenge.gesture } }),
      prisma.bountyEntry.update({ where: { id: entry.id }, data: { daysKept } }),
    ]);
  } catch { await releaseVerification(v.id); return res.status(409).json({ error: "Today is already kept" }); }
  return res.status(201).json({ dayIndex: day, proofHash: dayHash, startHash: session!.startHash, endHash: v.proofHash, daysKept, target: expected });
}));

export type BountyJobReport = { bounty: number; knockedOut: number; paid: Array<{ wallet: string; amount: string; signature: string }>; pending: string[]; done: boolean; error?: string };

/** Called from runV4Jobs(): apply day-close knockouts, then pay survivors once every day has closed. */
export async function runBountyJobs(): Promise<BountyJobReport[]> {
  const reports: BountyJobReport[] = [];
  for (const bounty of await prisma.bounty.findMany({ where: { paidAt: null } })) {
    const report: BountyJobReport = { bounty: bounty.id, knockedOut: 0, paid: [], pending: [], done: false };
    try { await runOneBounty(bounty, report); }
    catch (e) {
      report.error = e instanceof Error ? e.message : String(e);
      console.error(`[bounty] job failed ${bounty.id}:`, report.error);
    }
    reports.push(report);
  }
  return reports;
}

async function runOneBounty(bounty: Bounty, report: BountyJobReport) {
  const through = lastClosedDay(bounty, nowTs());
  if (through > bounty.missedThrough) {
    const still = await prisma.bountyEntry.findMany({ where: { bountyId: bounty.id, out: false } });
    for (const k of bountyKnockouts(still, bounty.missedThrough, through)) {
      await prisma.bountyEntry.update({ where: { bountyId_wallet: { bountyId: bounty.id, wallet: k.wallet } }, data: { out: true, outDay: k.outDay, outAt: new Date() } });
      report.knockedOut++;
    }
    await prisma.bounty.update({ where: { id: bounty.id }, data: { missedThrough: through } });
  }
  if (through < bounty.numDays - 1) return;

  // Every day has closed, so the winner list is final. Fix each share once, then pay whoever is unpaid.
  const winners = await prisma.bountyEntry.findMany({ where: { bountyId: bounty.id, out: false }, orderBy: { id: "asc" } });
  const { share } = splitPool(bounty.poolAmount, winners.length);
  await prisma.bountyEntry.updateMany({ where: { bountyId: bounty.id, out: false, payoutAmount: null }, data: { payoutAmount: share } });
  if (share === 0n) await prisma.bountyEntry.updateMany({ where: { bountyId: bounty.id, out: false, paidAt: null }, data: { paidAt: new Date() } });

  const unpaid = await prisma.bountyEntry.findMany({ where: { bountyId: bounty.id, out: false, paidAt: null }, orderBy: { id: "asc" } });
  if (unpaid.length) {
    const payer = bountyPayer();
    if (payer.publicKey.toBase58() !== bounty.payer) throw new Error(`BOUNTY_PAYER is ${payer.publicKey.toBase58()}, but this bounty is funded by ${bounty.payer}`);
    const mint = new PublicKey(bounty.mint);
    const tokenProgram = await tokenProgramForMint(mint);
    const { decimals } = await getMint(connection, mint, "confirmed", tokenProgram);
    for (const entry of unpaid) {
      const signature = await payEntry(entry, { payer, mint, tokenProgram, decimals });
      if (signature) report.paid.push({ wallet: entry.wallet, amount: (entry.payoutAmount ?? share).toString(), signature });
      else report.pending.push(entry.wallet);
    }
  }
  if (!(await prisma.bountyEntry.count({ where: { bountyId: bounty.id, out: false, paidAt: null } }))) {
    await prisma.bounty.update({ where: { id: bounty.id }, data: { paidAt: new Date() } });
    report.done = true;
  }
}

/**
 * Pays one winner exactly once. The signature is saved before sending; on a re-run a saved signature is
 * resolved on-chain first, and a new transfer is built only once the old one failed or can no longer land.
 * Returns the confirmed signature, or null while a previous transfer may still be in flight.
 */
async function payEntry(entry: Entry, t: { payer: Keypair; mint: PublicKey; tokenProgram: PublicKey; decimals: number }): Promise<string | null> {
  const markPaid = (signature: string) => prisma.bountyEntry.update({ where: { id: entry.id }, data: { payoutSignature: signature, paidAt: new Date() } });
  if (entry.payoutSignature) {
    const status = (await connection.getSignatureStatuses([entry.payoutSignature], { searchTransactionHistory: true })).value[0];
    const height = status ? null : await connection.getBlockHeight("confirmed");
    const action = payoutAction({ signature: entry.payoutSignature, validHeight: entry.payoutValidHeight }, status, height);
    if (action === "paid") { await markPaid(entry.payoutSignature); return entry.payoutSignature; }
    if (action === "wait") return null;
  }
  const owner = new PublicKey(entry.wallet);
  const source = await getAssociatedTokenAddress(t.mint, t.payer.publicKey, false, t.tokenProgram);
  const destination = await getAssociatedTokenAddress(t.mint, owner, false, t.tokenProgram);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: t.payer.publicKey, blockhash, lastValidBlockHeight }).add(
    createAssociatedTokenAccountIdempotentInstruction(t.payer.publicKey, destination, owner, t.mint, t.tokenProgram),
    createTransferCheckedInstruction(source, t.mint, destination, t.payer.publicKey, entry.payoutAmount ?? 0n, t.decimals, [], t.tokenProgram),
  );
  tx.sign(t.payer);
  const signature = bs58.encode(tx.signature!);
  await prisma.bountyEntry.update({ where: { id: entry.id }, data: { payoutSignature: signature, payoutValidHeight: lastValidBlockHeight } });
  await connection.sendRawTransaction(tx.serialize());
  const confirmed = await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
  if (confirmed.value.err) throw new Error(`Bounty payout to ${entry.wallet} failed: ${JSON.stringify(confirmed.value.err)}`);
  await markPaid(signature);
  return signature;
}
