-- CreateTable
CREATE TABLE "ProofVerification" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "proofHash" TEXT NOT NULL,
    "expectedObject" TEXT NOT NULL,
    "expectedGesture" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "objectPresent" BOOLEAN NOT NULL DEFAULT false,
    "objectConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gestureSeen" TEXT NOT NULL DEFAULT '',
    "gestureMatches" BOOLEAN NOT NULL DEFAULT false,
    "looksLikeScreen" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL DEFAULT '',
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProofVerification_wallet_createdAt_idx" ON "ProofVerification"("wallet", "createdAt");

