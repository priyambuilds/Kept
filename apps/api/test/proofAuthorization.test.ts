import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { PublicKey } from '@solana/web3.js';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { issueSession, hashBytes } from '../src/auth.js';
import { prisma } from '../src/db.js';
import { connection, programId } from '../src/solana.js';
import { GESTURE_TEXT, OBJECT_TEXT } from '../src/v4/rules.js';

test('production proof route enforces review authorization and preserves legitimate group review', async (t) => {
  const wallet = '11111111111111111111111111111111';
  const oath = programId.toBase58();
  const old = { ...config };
  const dir = await mkdtemp(join(tmpdir(), 'kept-review-'));
  Object.assign(config, { sessionSecret: 'http-proof-test', sgtMock: true, sgtMockAllowlist: [wallet], devnetRpcUrl: 'https://api.devnet.solana.com', proofStorageDir: dir, fcmServiceAccountJson: '' });
  let member = true, solo = false, status = 1;
  let session: any = { id: 7, startHash: 'a'.repeat(64), startGesture: 'Victory', endAllowedAt: new Date(Date.now()-30_000) };
  const photo = Buffer.alloc(120, 7).toString('base64'), hash = hashBytes(Buffer.from(photo, 'base64'));
  let failures: any[] = [], writes = 0;
  t.mock.method(connection, 'getAccountInfo', async () => {
    const data = Buffer.alloc(316); // a rules v1 Oath account (no terms region)
    createHash('sha256').update('account:Oath').digest().copy(data, 0, 0, 8);
    data[120] = 1; data[121] = 3; data.writeUInt32LE(86400, 122);
    data.writeBigInt64LE(BigInt(Math.floor(Date.now()/1000)-60), 126);
    data[136] = status; data[137] = solo ? 1 : 0; data[138] = 2;
    new PublicKey(member ? wallet : oath).toBuffer().copy(data, 139);
    programId.toBuffer().copy(data, 183);
    return { data, owner: programId } as any;
  });
  const restore: Array<()=>void> = [];
  const stub = (obj: any, key: string, fn: any) => { const original=obj[key]; obj[key]=fn; restore.push(()=>{obj[key]=original;}); };
  stub(prisma.sessionSeat, 'upsert', async () => ({} as any));
  stub(prisma.oathProof, 'findUnique', async () => null);
  stub(prisma.proofSession, 'findUnique', async () => session);
  stub(prisma.gestureChallenge, 'findFirst', async () => ({ gesture: 'Thumb_Up', issuedAt: new Date() } as any));
  stub(prisma.proofVerification, 'findMany', async () => failures);
  stub(prisma.oathProof, 'create', async ({ data }: any) => { writes++; return { ...data, id: 1 } as any; });
  const server = createApp().listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const send = async (body: object, authenticated = true) => {
    const r = await fetch(base+'/api/proof', { method:'POST', headers: { 'content-type':'application/json', ...(authenticated ? {authorization:`Bearer ${issueSession(wallet)}`} : {}) }, body: JSON.stringify({ oath, dayIndex:0, ...body }) });
    return { status:r.status, body:await r.json() };
  };
  try {
    assert.equal((await send({review:true,photo}, false)).status,401);
    assert.equal((await send({})).status,400);
    assert.equal((await send({verificationId:''})).status,400);
    assert.equal((await send({review:true})).status,400);
    const forged = await send({review:true,photo,failedAttempts:999,detection:{pass:true}});
    assert.equal(forged.status,409); assert.equal(forged.body.failedChecks,0); assert.equal(writes,0);
    failures = Array.from({length:3}, (_,i)=>({wallet,oath,dayIndex:0,sessionId:7,status:'FAIL',proofHash:hash,expectedObject:OBJECT_TEXT.book,expectedGesture:GESTURE_TEXT.Thumb_Up,createdAt:new Date(),objectPresent:true,objectConfidence:.5,gestureSeen:'none',gestureMatches:false,id:String(i)}));
    member=false; assert.equal((await send({review:true,photo})).status,403); member=true;
    solo=true; assert.equal((await send({review:true,photo})).status,409); solo=false;
    status=2; assert.equal((await send({review:true,photo})).status,409); status=1;
    const originalSession=session; session=null; assert.equal((await send({review:true,photo})).body.phase,'start');
    session={...originalSession,endAllowedAt:new Date(Date.now()+60_000)}; assert.equal((await send({review:true,photo})).body.phase,'wait');session=originalSession;
    assert.equal((await send({review:true,photo:Buffer.alloc(120,8).toString('base64')})).status,422);
    const accepted=await send({review:true,photo,failedAttempts:0});
    assert.equal(accepted.status,202);assert.equal(accepted.body.status,'PENDING_REVIEW');assert.equal(writes,1);
  } finally {
    server.closeAllConnections(); await new Promise<void>(r=>server.close(()=>r()));
    restore.forEach(fn=>fn()); Object.assign(config,old); await rm(dir,{recursive:true,force:true});
  }
});
