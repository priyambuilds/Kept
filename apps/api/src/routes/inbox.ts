import { Router, Response, RequestHandler } from "express";
import { prisma } from "../db.js";
import { authenticate, AuthedRequest } from "../auth.js";

export const inboxRouter = Router();
const asyncRoute = (fn: (req: any, res: Response) => unknown): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};
const get = (route: string, fn: (req: AuthedRequest, res: Response) => unknown) => inboxRouter.get(route, asyncRoute(fn));
const put = (route: string, fn: (req: AuthedRequest, res: Response) => unknown) => inboxRouter.put(route, asyncRoute(fn));

inboxRouter.use("/api/inbox", authenticate);

get("/api/inbox", async (req, res) => {
  const items = await prisma.inboxMessage.findMany({
    where: { wallet: req.wallet },
    orderBy: { createdAt: "desc" },
  });
  const unread = items.filter((i) => !i.done).length;
  res.json({
    items: items.map(i => ({
      id: i.id,
      type: i.type,
      actor: i.actor,
      title: i.title,
      body: i.body,
      createdAt: i.createdAt.toISOString(),
      needsAction: i.needsAction,
      done: i.done,
      ref: { 
        oath: i.refOath || undefined, 
        code: i.refCode || undefined, 
        bounty: i.refBounty || undefined, 
        review: i.refReview || undefined 
      }
    })),
    unread
  });
});

put("/api/inbox/:id", async (req, res) => {
  const { id } = req.params;
  const msg = await prisma.inboxMessage.findUnique({ where: { id } });
  if (!msg || msg.wallet !== req.wallet) return res.status(404).json({ error: "Not found" });
  await prisma.inboxMessage.update({ where: { id }, data: { done: true } });
  res.json({ success: true });
});
