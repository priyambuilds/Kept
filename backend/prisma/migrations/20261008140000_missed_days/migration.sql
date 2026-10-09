-- AlterTable
ALTER TABLE "OathWatch" ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "missedThrough" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "settleSignature" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "MissedDay" (
    "id" SERIAL NOT NULL,
    "oath" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissedDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissedDay_wallet_idx" ON "MissedDay"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "MissedDay_oath_wallet_dayIndex_key" ON "MissedDay"("oath", "wallet", "dayIndex");

