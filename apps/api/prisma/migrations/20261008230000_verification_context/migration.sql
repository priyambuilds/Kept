-- AlterTable
ALTER TABLE "ProofVerification" ADD COLUMN     "dayIndex" INTEGER,
ADD COLUMN     "oath" TEXT,
ADD COLUMN     "sessionId" INTEGER;

-- CreateIndex
CREATE INDEX "ProofVerification_wallet_oath_dayIndex_idx" ON "ProofVerification"("wallet", "oath", "dayIndex");

