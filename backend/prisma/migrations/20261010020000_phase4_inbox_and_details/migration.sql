-- AlterTable
ALTER TABLE "OathDetails" ADD COLUMN     "name" TEXT,
ADD COLUMN     "reviewMode" TEXT NOT NULL DEFAULT 'ai',
ADD COLUMN     "rematchOf" TEXT;

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actor" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "needsAction" BOOLEAN NOT NULL DEFAULT false,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "refOath" TEXT,
    "refCode" TEXT,
    "refBounty" TEXT,
    "refReview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InboxMessage_wallet_createdAt_idx" ON "InboxMessage"("wallet", "createdAt" DESC);
