-- AlterTable
ALTER TABLE "OathDetails" ADD COLUMN     "minMinutes" INTEGER;

-- AlterTable
ALTER TABLE "Bounty" ADD COLUMN     "minMinutes" INTEGER NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE "ProofSession" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "startHash" TEXT NOT NULL,
    "startGesture" TEXT NOT NULL,
    "startVerificationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAllowedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProofSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProofSession_key_wallet_dayIndex_key" ON "ProofSession"("key", "wallet", "dayIndex");

