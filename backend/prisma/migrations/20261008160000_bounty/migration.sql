-- CreateTable
CREATE TABLE "Bounty" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,
    "numDays" INTEGER NOT NULL,
    "daySeconds" INTEGER NOT NULL,
    "startTs" INTEGER NOT NULL,
    "poolAmount" BIGINT NOT NULL,
    "mint" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "missedThrough" INTEGER NOT NULL DEFAULT -1,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BountyEntry" (
    "id" SERIAL NOT NULL,
    "bountyId" INTEGER NOT NULL,
    "wallet" TEXT NOT NULL,
    "daysKept" INTEGER NOT NULL DEFAULT 0,
    "out" BOOLEAN NOT NULL DEFAULT false,
    "outDay" INTEGER,
    "payoutAmount" BIGINT,
    "payoutSignature" TEXT NOT NULL DEFAULT '',
    "payoutValidHeight" INTEGER,
    "paidAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BountyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BountyProof" (
    "id" SERIAL NOT NULL,
    "bountyId" INTEGER NOT NULL,
    "wallet" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "proofHash" TEXT NOT NULL,
    "objectLabel" TEXT NOT NULL,
    "objectConfidence" DOUBLE PRECISION NOT NULL,
    "gestureLabel" TEXT NOT NULL,
    "gestureConfidence" DOUBLE PRECISION NOT NULL,
    "challengeGesture" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BountyProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BountyEntry_bountyId_wallet_key" ON "BountyEntry"("bountyId", "wallet");

-- CreateIndex
CREATE UNIQUE INDEX "BountyProof_bountyId_wallet_dayIndex_key" ON "BountyProof"("bountyId", "wallet", "dayIndex");

