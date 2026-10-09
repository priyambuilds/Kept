import { expect } from "chai";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { PublicKey } from "@solana/web3.js";
import { AccountLayout, AccountState, MintLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Clock, FailedTransactionMetadata, LiteSVM } from "litesvm";
import { AccountRole, Address, KeyPairSigner, address, appendTransactionMessageInstruction, createTransactionMessage, generateKeyPairSigner, lamports, pipe, setTransactionMessageFeePayerSigner, signTransactionMessageWithSigners } from "@solana/kit";
const idlJson = JSON.parse(readFileSync(path.join(__dirname, "..", "target", "idl", "kept_test.json"), "utf8"));

// The backend's payout preview (src/shared/payout.ts) lives in an ESM package this CommonJS suite cannot import,
// so load that exact file through the TypeScript compiler. Settlement results below must equal it.
type SettlementV2 = { payouts: bigint[]; slashed: bigint; toTreasury: bigint; carryover: bigint; dust: bigint };
const shared = (() => {
  const source = readFileSync(path.join(__dirname, "..", "..", "..", "apps", "api", "src", "shared", "payout.ts"), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as any };
  new Function("module", "exports", js)(mod, mod.exports);
  return mod.exports as {
    calculatePayoutsV2(stake: bigint, successes: boolean[], fees: bigint, freeze: bigint): SettlementV2 | null;
    calculatePayouts(stake: bigint, feeBps: number, successes: boolean[]): { payouts: bigint[]; fee: bigint; dust: bigint } | null;
    feeForStake(stake: bigint, feeBps: number): bigint | null;
  };
})();

const PROGRAM = new PublicKey(idlJson.address);
const PROGRAM_ADDR = address(PROGRAM.toBase58());
const SO = path.join(__dirname, "..", "target", "deploy", "kept_test.so");
const TOKEN = address(TOKEN_PROGRAM_ID.toBase58());
const SYSTEM = address("11111111111111111111111111111111");
const LOADER = "BPFLoaderUpgradeab1e11111111111111111111111";
const DAY = 86_400n;
const T0 = 10_000n;
const LEGACY_FEE_BPS = 1_000;
const FEE_BPS = 1_500;
const FREEZE_PRICE = 40n;
const START_BALANCE = 10_000_000_000n;
const OATH_BASE = 316;
const MEMBER = (i: number) => 139 + i * 44;

const disc = (name: string) => createHash("sha256").update(`global:${name}`).digest().subarray(0, 8);
const u16 = (n: number) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n: number) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; };
const i16 = (n: number) => { const b = Buffer.alloc(2); b.writeInt16LE(n); return b; };
const u64 = (n: bigint) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(n); return b; };
const pk = (a: Address) => new PublicKey(a);
const addr = (p: PublicKey) => address(p.toBase58());
const W = AccountRole.WRITABLE, R = AccountRole.READONLY, WS = AccountRole.WRITABLE_SIGNER, RS = AccountRole.READONLY_SIGNER;
type Meta = { address: Address; role: AccountRole };
type Result = Awaited<ReturnType<LiteSVM["sendTransaction"]>>;

function logs(r: Result) { return r instanceof FailedTransactionMetadata ? r.meta().logs().join("\n") : "success"; }
function ok(r: Result) { expect(r, logs(r)).not.to.be.instanceOf(FailedTransactionMetadata); }
function fails(r: Result, code: string) { expect(r).to.be.instanceOf(FailedTransactionMetadata); expect(logs(r)).to.contain(code); }

type User = { signer: KeyPairSigner; token: Address; keeper: Address };

class Harness {
  svm = new LiteSVM(); admin!: KeyPairSigner; verifier!: KeyPairSigner; users: User[] = [];
  config!: Address; mint!: Address; treasury!: Address; reserve!: Address;
  oath!: Address; vault!: Address; oathId = 0n;

  static async create(members = 4) {
    const h = new Harness();
    h.svm.addProgramFromFile(PROGRAM_ADDR, SO);
    h.admin = await generateKeyPairSigner(); h.verifier = await generateKeyPairSigner();
    h.svm.airdrop(h.admin.address, lamports(10_000_000_000n)); h.svm.airdrop(h.verifier.address, lamports(1_000_000_000n));
    const mint = new PublicKey(randomBytes(32)); h.mint = addr(mint);
    const mintData = Buffer.alloc(82);
    MintLayout.encode({ mintAuthorityOption: 1, mintAuthority: pk(h.admin.address), supply: 1_000_000n, decimals: 6, isInitialized: true, freezeAuthorityOption: 0, freezeAuthority: PublicKey.default }, mintData);
    h.put(h.mint, mintData, TOKEN);
    h.treasury = addr(new PublicKey(randomBytes(32))); h.put(h.treasury, h.tokenData(pk(h.admin.address), 0n), TOKEN);
    for (let i = 0; i < members; i++) {
      const signer = await generateKeyPairSigner(); h.svm.airdrop(signer.address, lamports(5_000_000_000n));
      const token = addr(new PublicKey(randomBytes(32))); h.put(token, h.tokenData(pk(signer.address), START_BALANCE), TOKEN);
      h.users.push({ signer, token, keeper: addr(PublicKey.findProgramAddressSync([Buffer.from("keeper"), pk(signer.address).toBuffer()], PROGRAM)[0]) });
    }
    h.config = addr(PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM)[0]);
    h.reserve = addr(PublicKey.findProgramAddressSync([Buffer.from("carryover"), mint.toBuffer()], PROGRAM)[0]);
    const [programData] = PublicKey.findProgramAddressSync([PROGRAM.toBuffer()], new PublicKey(LOADER));
    const loaderData = Buffer.alloc(45); loaderData.writeUInt32LE(3, 0); loaderData.writeBigUInt64LE(1n, 4); loaderData[12] = 1; pk(h.admin.address).toBuffer().copy(loaderData, 13);
    h.put(addr(programData), loaderData, address(LOADER));
    ok(await h.send(h.admin, [{ address: h.config, role: W }, { address: h.admin.address, role: WS }, { address: addr(programData), role: R }, { address: h.mint, role: R }, { address: h.treasury, role: W }, { address: TOKEN, role: R }, { address: SYSTEM, role: R }],
      Buffer.concat([disc("initialize_config"), pk(h.verifier.address).toBuffer(), u16(LEGACY_FEE_BPS)])));
    h.setTime(T0);
    return h;
  }

  tokenData(owner: PublicKey, amount: bigint) {
    const b = Buffer.alloc(165);
    AccountLayout.encode({ mint: pk(this.mint), owner, amount, delegateOption: 0, delegate: PublicKey.default, state: AccountState.Initialized, isNativeOption: 0, isNative: 0n, delegatedAmount: 0n, closeAuthorityOption: 0, closeAuthority: PublicKey.default }, b);
    return b;
  }
  put(a: Address, data: Buffer, owner: Address = PROGRAM_ADDR) { this.svm.setAccount({ address: a, data, lamports: lamports(2_000_000_000n), programAddress: owner, executable: false, space: BigInt(data.length) }); }
  setTime(unix: bigint) { const c = this.svm.getClock(); this.svm.setClock(new Clock(c.slot, c.epochStartTimestamp, c.epoch, c.leaderScheduleEpoch, unix)); }
  async send(signer: KeyPairSigner, metas: Meta[], data: Buffer, remaining: Meta[] = []) {
    this.svm.expireBlockhash();
    const tx = await pipe(createTransactionMessage({ version: 0 }), (m) => setTransactionMessageFeePayerSigner(signer, m), (m) => this.svm.setTransactionMessageLifetimeUsingLatestBlockhash(m),
      (m) => appendTransactionMessageInstruction({ programAddress: PROGRAM_ADDR, accounts: [...metas, ...remaining], data: new Uint8Array(data) }, m), (m) => signTransactionMessageWithSigners(m));
    return this.svm.sendTransaction(tx);
  }
  token(a: Address) { return AccountLayout.decode(Buffer.from(this.svm.getAccount(a).data)).amount; }
  data(a: Address) { return Buffer.from(this.svm.getAccount(a).data); }

  configure(feeBps = FEE_BPS, price = FREEZE_PRICE, signer = this.admin) {
    return this.send(signer, [{ address: this.config, role: W }, { address: signer.address, role: WS }, { address: this.mint, role: R }, { address: this.reserve, role: W }, { address: TOKEN, role: R }, { address: SYSTEM, role: R }],
      Buffer.concat([disc("configure_economics"), u16(feeBps), u64(price)]));
  }
  useOath(creator: User, id: bigint) {
    this.oathId = id;
    const oath = PublicKey.findProgramAddressSync([Buffer.from("oath"), pk(creator.signer.address).toBuffer(), u64(id)], PROGRAM)[0];
    this.oath = addr(oath); this.vault = addr(PublicKey.findProgramAddressSync([Buffer.from("vault"), oath.toBuffer()], PROGRAM)[0]);
  }
  createOath(creator: User, stake: bigint, numDays = 3) {
    this.useOath(creator, BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 1e6)));
    return this.send(creator.signer, [{ address: this.config, role: R }, { address: this.oath, role: W }, { address: this.vault, role: W }, { address: creator.keeper, role: W }, { address: creator.signer.address, role: WS }, { address: this.mint, role: R }, { address: creator.token, role: W }, { address: this.treasury, role: R }, { address: TOKEN, role: R }, { address: SYSTEM, role: R }],
      Buffer.concat([disc("create_oath"), u64(this.oathId), Buffer.alloc(32, 8), Buffer.from([0, numDays]), u32(Number(DAY)), i16(330), u64(stake), Buffer.from([0])]));
  }
  join(u: User) {
    return this.send(u.signer, [{ address: this.config, role: R }, { address: this.oath, role: W }, { address: this.vault, role: W }, { address: u.keeper, role: W }, { address: u.signer.address, role: WS }, { address: this.mint, role: R }, { address: u.token, role: W }, { address: this.treasury, role: R }, { address: TOKEN, role: R }, { address: SYSTEM, role: R }], disc("join_oath"));
  }
  creatorIx(u: User, name: "start_oath" | "cancel_oath") { return this.send(u.signer, [{ address: this.oath, role: W }, { address: u.signer.address, role: RS }], disc(name)); }
  settle(payer: User) {
    const keepers = Array.from({ length: this.memberCount() }, (_, i) => ({ address: this.memberKeeper(i), role: W }));
    return this.send(payer.signer, [{ address: this.config, role: R }, { address: this.oath, role: W }, { address: this.vault, role: W }, { address: this.treasury, role: W }, { address: this.mint, role: R }, { address: TOKEN, role: R }], disc("settle_oath"), keepers);
  }
  claim(u: User) { return this.send(u.signer, [{ address: this.oath, role: W }, { address: this.vault, role: W }, { address: this.mint, role: R }, { address: u.token, role: W }, { address: u.signer.address, role: RS }, { address: TOKEN, role: R }], disc("claim")); }
  buyFreeze(u: User) { return this.send(u.signer, [{ address: this.oath, role: W }, { address: this.vault, role: W }, { address: this.mint, role: R }, { address: u.token, role: W }, { address: u.signer.address, role: RS }, { address: TOKEN, role: R }], disc("buy_freeze")); }
  useFreeze(u: User, day: number) { return this.send(u.signer, [{ address: this.oath, role: W }, { address: u.signer.address, role: RS }], Buffer.concat([disc("use_freeze"), Buffer.from([day])])); }
  sweep(payer: User) { return this.send(payer.signer, [{ address: this.config, role: W }, { address: this.oath, role: W }, { address: this.vault, role: W }, { address: this.reserve, role: W }, { address: this.mint, role: R }, { address: TOKEN, role: R }], disc("sweep_carryover")); }

  memberCount() { return this.data(this.oath)[138]; }
  memberKeeper(i: number) { return addr(PublicKey.findProgramAddressSync([Buffer.from("keeper"), this.data(this.oath).subarray(MEMBER(i), MEMBER(i) + 32)], PROGRAM)[0]); }
  payouts() { const d = this.data(this.oath); return Array.from({ length: d[138] }, (_, i) => d.readBigUInt64LE(MEMBER(i) + 36)); }
  status() { return this.data(this.oath)[136]; }
  /** Stand-in for verifier check-ins: sets each member's days_kept bitmask directly. */
  setDaysKept(masks: number[]) { const d = this.data(this.oath); masks.forEach((m, i) => d.writeUInt16LE(m, MEMBER(i) + 33)); this.put(this.oath, d); }
  daysKept(i: number) { return this.data(this.oath).readUInt16LE(MEMBER(i) + 33); }
  terms() {
    const d = this.data(this.oath);
    if (d.length === OATH_BASE) return null;
    const t = d.subarray(OATH_BASE);
    return { tag: t.subarray(0, 8).toString("latin1"), version: t[8], feeBps: t.readUInt16LE(9), feePerMember: t.readBigUInt64LE(11), freezePrice: t.readBigUInt64LE(19),
      feesCollected: t.readBigUInt64LE(27), freezeProceeds: t.readBigUInt64LE(35), bought: t[43], used: t[44], frozen: [0, 1, 2, 3].map((i) => t.readUInt16LE(45 + i * 2)),
      treasuryPaid: t.readBigUInt64LE(53), carryover: t.readBigUInt64LE(61), swept: t[69] === 1, dust: t.readBigUInt64LE(70) };
  }
  reserveTotal() { return this.data(this.config).readBigUInt64LE(139 + 50); }

  /** Creates a group Oath with `n` members, starts it at T0 and returns them. */
  async activeOath(n: number, stake: bigint) {
    this.setTime(T0);
    ok(await this.createOath(this.users[0], stake));
    for (let i = 1; i < n; i++) ok(await this.join(this.users[i]));
    ok(await this.creatorIx(this.users[0], "start_oath"));
    return this.users.slice(0, n);
  }
  afterGrace(numDays = 3n) { this.setTime(T0 + numDays * DAY + DAY); }
}

const fee = (stake: bigint) => shared.feeForStake(stake, FEE_BPS)!;

describe("KEPT rules v2 economics", () => {
  it("IDL has the economics instructions", () => {
    const names = idlJson.instructions.map((i: any) => i.name);
    for (const name of ["configure_economics", "buy_freeze", "use_freeze", "sweep_carryover"]) expect(names).to.include(name);
  });

  it("only the config admin can activate rules v2, and the fee/freeze price are validated", async () => {
    const h = await Harness.create(1);
    fails(await h.configure(FEE_BPS, FREEZE_PRICE, h.users[0].signer), "ConstraintHasOne");
    fails(await h.configure(10_001, FREEZE_PRICE), "InvalidFee");
    fails(await h.configure(FEE_BPS, 0n), "InvalidFreezePrice");
    ok(await h.configure());
    expect(h.token(h.reserve)).to.equal(0n, "locked carryover reserve created");
    ok(await h.configure(2_000, 99n)); // re-configuring keeps the same reserve
  });

  it("charges 15% on top of each stake at create and join and snapshots the terms", async () => {
    const h = await Harness.create(2); ok(await h.configure());
    const [alice, bob] = h.users;
    ok(await h.createOath(alice, 1_000n));
    expect(h.token(alice.token)).to.equal(START_BALANCE - 1_150n);
    expect(h.terms()).to.include({ tag: "KEPTTRM1", version: 2, feeBps: FEE_BPS, feePerMember: 150n, freezePrice: FREEZE_PRICE, feesCollected: 150n });
    // A later config change must not alter this Oath's fee or freeze price.
    ok(await h.configure(2_000, 99n));
    ok(await h.join(bob));
    expect(h.token(bob.token)).to.equal(START_BALANCE - 1_150n, "joiner pays the fee fixed at creation");
    expect(h.token(h.vault)).to.equal(2_300n, "stake and fee escrowed; nothing sent to treasury yet");
    expect(h.token(h.treasury)).to.equal(0n);
    expect(h.terms()).to.include({ feeBps: FEE_BPS, freezePrice: FREEZE_PRICE, feesCollected: 300n });
  });

  it("refunds stake and fee when the creator cancels while Open; claims are once only", async () => {
    const h = await Harness.create(3); ok(await h.configure());
    const [alice, bob, carol] = h.users;
    ok(await h.createOath(alice, 1_000n)); ok(await h.join(bob));
    fails(await h.buyFreeze(bob), "NotActive"); // no freeze purchases while Open, so nothing else to refund
    fails(await h.creatorIx(bob, "cancel_oath"), "ConstraintHasOne");
    ok(await h.creatorIx(alice, "cancel_oath"));
    expect(h.payouts()).to.deep.equal([1_150n, 1_150n]);
    ok(await h.claim(alice)); ok(await h.claim(bob));
    expect(h.token(alice.token)).to.equal(START_BALANCE); expect(h.token(bob.token)).to.equal(START_BALANCE);
    expect(h.token(h.vault)).to.equal(0n); expect(h.token(h.treasury)).to.equal(0n);
    fails(await h.claim(alice), "AlreadyClaimed");
    fails(await h.claim(carol), "NotMember");
    fails(await h.creatorIx(alice, "cancel_oath"), "NotOpen");
  });

  it("freeze credits: one per member, bought with un-staked SKR, at the snapshotted price", async () => {
    const h = await Harness.create(3); ok(await h.configure());
    const [alice, bob] = await h.activeOath(2, 1_000n);
    const outsider = h.users[2];
    fails(await h.buyFreeze(outsider), "NotMember");
    ok(await h.buyFreeze(bob));
    expect(h.token(bob.token)).to.equal(START_BALANCE - 1_150n - FREEZE_PRICE);
    fails(await h.buyFreeze(bob), "FreezeAlreadyBought");
    expect(h.terms()).to.include({ bought: 0b10, freezeProceeds: FREEZE_PRICE });
    expect(h.token(h.vault)).to.equal(2_300n + FREEZE_PRICE);
    void alice;
  });

  it("freeze use: only for a closed, unkept day, only once, only by its owner", async () => {
    const h = await Harness.create(2); ok(await h.configure());
    const [alice, bob] = await h.activeOath(2, 1_000n);
    ok(await h.buyFreeze(bob));
    h.setTime(T0 + DAY / 2n);
    fails(await h.useFreeze(bob, 0), "DayNotClosed"); // current day
    fails(await h.useFreeze(bob, 2), "DayNotClosed"); // future day
    fails(await h.useFreeze(bob, 3), "InvalidDay");
    h.setDaysKept([0b001, 0b001]); h.setTime(T0 + 2n * DAY + 1n); // days 0 and 1 closed; bob kept day 0, missed day 1
    fails(await h.useFreeze(bob, 0), "DayAlreadyKept");
    fails(await h.useFreeze(alice, 1), "NoFreezeCredit"); // bob's credit is wallet-bound
    ok(await h.useFreeze(bob, 1));
    expect(h.terms()).to.include({ used: 0b10 }); expect(h.terms()!.frozen).to.deep.equal([0, 0b010, 0, 0]);
    expect(h.daysKept(1)).to.equal(0b001, "proof bits are not rewritten; the freeze is tracked separately");
    fails(await h.useFreeze(bob, 1), "FreezeAlreadyUsed");
    fails(await h.buyFreeze(bob), "FreezeAlreadyBought"); // no second credit to cover another day
  });

  it("all succeed (one day covered by a freeze): everyone recovers the full stake, treasury gets fees and freeze price", async () => {
    const h = await Harness.create(2); ok(await h.configure());
    const [alice, bob] = await h.activeOath(2, 1_000n);
    ok(await h.buyFreeze(bob));
    h.setDaysKept([0b111, 0b101]); h.setTime(T0 + 2n * DAY);
    ok(await h.useFreeze(bob, 1));
    h.setTime(T0 + 3n * DAY);
    fails(await h.settle(alice), "TooEarly"); // the last day's freeze window is still open
    h.afterGrace();
    ok(await h.settle(alice));
    const expected = shared.calculatePayoutsV2(1_000n, [true, true], 300n, FREEZE_PRICE)!;
    expect(h.payouts()).to.deep.equal(expected.payouts).and.deep.equal([1_000n, 1_000n]);
    expect(h.token(h.treasury)).to.equal(expected.toTreasury).and.equal(340n);
    ok(await h.claim(alice)); ok(await h.claim(bob));
    expect(h.token(alice.token)).to.equal(START_BALANCE - 150n, "full stake recovered; only the fee is spent");
    expect(h.token(h.vault)).to.equal(0n, "every escrowed token accounted for");
    const keeper = h.data(bob.keeper);
    expect(keeper.readUInt32LE(44)).to.equal(1, "a frozen day counts as kept for the Oath");
  });

  it("one unsuccessful member: 50% back once (despite two misses), the other 50% to successful members; dust to treasury", async () => {
    const h = await Harness.create(4); ok(await h.configure());
    const users = await h.activeOath(4, 1_001n);
    h.setDaysKept([0b111, 0b111, 0b111, 0b100]); h.afterGrace();
    ok(await h.settle(users[0]));
    const f = fee(1_001n);
    const expected = shared.calculatePayoutsV2(1_001n, [true, true, true, false], 4n * f, 0n)!;
    expect(h.payouts()).to.deep.equal(expected.payouts).and.deep.equal([1_167n, 1_167n, 1_167n, 501n]);
    expect(h.token(h.treasury)).to.equal(expected.toTreasury).and.equal(4n * f + 2n);
    expect(h.terms()).to.include({ dust: 2n, carryover: 0n, treasuryPaid: 4n * f + 2n });
    for (const u of users) ok(await h.claim(u));
    expect(h.token(h.vault)).to.equal(0n);
    expect(h.data(users[3].keeper).readUInt32LE(48)).to.equal(1, "oaths_missed");
  });

  it("no successful member: slashed half is carryover in the locked reserve, not treasury; sweep runs once", async () => {
    const h = await Harness.create(2); ok(await h.configure());
    const [alice, bob] = await h.activeOath(2, 1_000n);
    h.setDaysKept([0b011, 0b000]); h.afterGrace();
    fails(await h.sweep(alice), "NotSettled");
    ok(await h.settle(bob));
    expect(h.payouts()).to.deep.equal([500n, 500n]);
    expect(h.token(h.treasury)).to.equal(300n, "treasury gets only the fees");
    expect(h.terms()).to.include({ carryover: 1_000n, swept: false });
    expect(h.token(h.vault)).to.equal(2_000n, "payouts and carryover still escrowed");
    ok(await h.sweep(alice));
    expect(h.token(h.reserve)).to.equal(1_000n); expect(h.reserveTotal()).to.equal(1_000n);
    fails(await h.sweep(alice), "NothingToSweep");
    expect(h.token(h.reserve)).to.equal(1_000n, "retry moved nothing");
    ok(await h.claim(alice)); ok(await h.claim(bob));
    expect(h.token(h.vault)).to.equal(0n);
    expect(h.token(alice.token) + h.token(bob.token) + h.token(h.treasury) + h.token(h.reserve)).to.equal(2n * START_BALANCE, "conservation");
  });

  it("settlement and claim retries are rejected without moving tokens", async () => {
    const h = await Harness.create(2); ok(await h.configure());
    const [alice, bob] = await h.activeOath(2, 1_000n);
    h.setDaysKept([0b111, 0b011]); h.afterGrace();
    ok(await h.settle(alice));
    const treasury = h.token(h.treasury), vault = h.token(h.vault);
    fails(await h.settle(bob), "NotActive");
    expect(h.token(h.treasury)).to.equal(treasury); expect(h.token(h.vault)).to.equal(vault);
    fails(await h.useFreeze(bob, 2), "NotActive"); // nothing changes after settlement
    ok(await h.claim(bob)); fails(await h.claim(bob), "AlreadyClaimed");
    expect(h.token(bob.token)).to.equal(START_BALANCE - 1_150n + 500n);
  });

  it("on-chain payouts equal the TypeScript preview for every 3-member outcome", async () => {
    for (let mask = 0; mask < 8; mask++) {
      const h = await Harness.create(3); ok(await h.configure());
      const users = await h.activeOath(3, 2_500_000_001n);
      const successes = [0, 1, 2].map((i) => (mask & (1 << i)) !== 0);
      h.setDaysKept(successes.map((s) => (s ? 0b111 : 0b010))); h.afterGrace();
      ok(await h.settle(users[0]));
      const expected = shared.calculatePayoutsV2(2_500_000_001n, successes, 3n * fee(2_500_000_001n), 0n)!;
      expect(h.payouts(), `mask ${mask}`).to.deep.equal(expected.payouts);
      expect(h.token(h.treasury)).to.equal(expected.toTreasury);
      expect(h.terms()).to.include({ carryover: expected.carryover, dust: expected.dust });
    }
  });

  it("an Oath created before activation keeps rules v1: no fee for later joiners, no freezes, old payout", async () => {
    const h = await Harness.create(2);
    const [alice, bob] = h.users;
    ok(await h.createOath(alice, 1_000n));
    expect(h.terms()).to.include({ version: 1, feePerMember: 0n });
    ok(await h.configure());
    ok(await h.join(bob));
    expect(h.token(bob.token)).to.equal(START_BALANCE - 1_000n, "no fee after activation for an Oath created before it");
    ok(await h.creatorIx(alice, "start_oath"));
    fails(await h.buyFreeze(bob), "LegacyRules");
    h.setDaysKept([0b111, 0b011]); h.setTime(T0 + 3n * DAY);
    ok(await h.settle(alice)); // v1 has no grace day
    expect(h.payouts()).to.deep.equal(shared.calculatePayouts(1_000n, LEGACY_FEE_BPS, [true, false])!.payouts).and.deep.equal([1_900n, 0n]);
    expect(h.token(h.treasury)).to.equal(100n);
  });

  it("a pre-upgrade 316-byte Active Oath is still read and settled under rules v1 after activation", async () => {
    const h = await Harness.create(2); ok(await h.configure());
    const [alice, bob] = h.users;
    h.useOath(alice, 77n);
    const [, bump] = PublicKey.findProgramAddressSync([Buffer.from("oath"), pk(alice.signer.address).toBuffer(), u64(77n)], PROGRAM);
    const o = Buffer.alloc(OATH_BASE); createHash("sha256").update("account:Oath").digest().subarray(0, 8).copy(o);
    pk(alice.signer.address).toBuffer().copy(o, 8); o.writeBigUInt64LE(77n, 40); o.writeBigUInt64LE(1_250n, 48); pk(h.mint).toBuffer().copy(o, 56);
    o[120] = 0; o[121] = 3; o.writeUInt32LE(Number(DAY), 122); o.writeBigInt64LE(T0, 126); o.writeInt16LE(330, 134); o[136] = 1; o[137] = 0; o[138] = 2;
    [alice, bob].forEach((u, i) => { pk(u.signer.address).toBuffer().copy(o, MEMBER(i)); o[MEMBER(i) + 32] = 1; });
    o.writeUInt16LE(0b111, MEMBER(0) + 33); o.writeUInt16LE(0b001, MEMBER(1) + 33); o[315] = bump;
    h.put(h.oath, o); h.put(h.vault, h.tokenData(pk(h.oath), 2_500n), TOKEN);
    for (const u of [alice, bob]) { const k = Buffer.alloc(126); createHash("sha256").update("account:Keeper").digest().subarray(0, 8).copy(k); pk(u.signer.address).toBuffer().copy(k, 8); k.write("KEPTV4!!", 61, "latin1"); h.put(u.keeper, k); }
    h.setTime(T0 + 3n * DAY + 1n);
    fails(await h.buyFreeze(bob), "LegacyRules");
    fails(await h.useFreeze(bob, 1), "LegacyRules");
    ok(await h.settle(alice));
    expect(h.data(h.oath).length).to.equal(OATH_BASE, "legacy account is not resized or rewritten");
    expect(h.payouts()).to.deep.equal([2_375n, 0n], "v1: 10% of the forfeited stake to treasury, 90% to the keeper");
    expect(h.token(h.treasury)).to.equal(125n);
    ok(await h.claim(alice)); expect(h.token(h.vault)).to.equal(0n);
    fails(await h.sweep(alice), "LegacyRules");
  });
});
