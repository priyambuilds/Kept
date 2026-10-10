ALTER TABLE "OathProof" ADD COLUMN "challengeGesture" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OathProof" ADD COLUMN "failedAttempts" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "GestureChallenge" (
  "id" SERIAL NOT NULL,
  "oath" TEXT NOT NULL,
  "wallet" TEXT NOT NULL,
  "dayIndex" INTEGER NOT NULL,
  "gesture" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GestureChallenge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GestureChallenge_oath_wallet_dayIndex_idx" ON "GestureChallenge"("oath", "wallet", "dayIndex");

CREATE TABLE "ProofReview" (
  "id" SERIAL NOT NULL,
  "proofId" INTEGER NOT NULL,
  "reviewer" TEXT NOT NULL,
  "approve" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProofReview_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProofReview_proofId_reviewer_key" ON "ProofReview"("proofId", "reviewer");
