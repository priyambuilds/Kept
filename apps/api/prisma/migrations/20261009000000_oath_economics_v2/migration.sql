-- AlterTable
ALTER TABLE "OathWatch" ADD COLUMN     "sweepSignature" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "MissedDay" ADD COLUMN     "frozen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OathSettlement" (
    "id" SERIAL NOT NULL,
    "oath" TEXT NOT NULL,
    "rulesVersion" INTEGER NOT NULL,
    "feeBps" INTEGER NOT NULL,
    "stakeAmount" BIGINT NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "feesCollected" BIGINT NOT NULL,
    "freezeProceeds" BIGINT NOT NULL,
    "payoutsTotal" BIGINT NOT NULL,
    "treasuryPaid" BIGINT NOT NULL,
    "dust" BIGINT NOT NULL,
    "carryover" BIGINT NOT NULL,
    "carryoverSwept" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OathSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OathSettlement_oath_key" ON "OathSettlement"("oath");

