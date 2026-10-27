CREATE TYPE "PaymentAuditAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

ALTER TABLE "Payment"
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewReason" TEXT;

CREATE TABLE "PaymentAudit" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "PaymentAuditAction" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentAudit_paymentId_createdAt_idx" ON "PaymentAudit"("paymentId", "createdAt");

ALTER TABLE "PaymentAudit"
ADD CONSTRAINT "PaymentAudit_paymentId_fkey"
FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "PaymentAudit_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
