ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'NICEPAY';

ALTER TABLE "supplier_companies"
ADD COLUMN "bank_code" TEXT,
ADD COLUMN "nicepay_sub_id" TEXT,
ADD COLUMN "nicepay_submall_synced_at" TIMESTAMP(3),
ADD COLUMN "nicepay_submall_last_error" TEXT;

ALTER TABLE "payments"
ADD COLUMN "request_key" TEXT;

ALTER TABLE "settlements"
ADD COLUMN "nicepay_payout_seq" TEXT,
ADD COLUMN "nicepay_payout_status" TEXT,
ADD COLUMN "nicepay_payout_requested_at" TIMESTAMP(3),
ADD COLUMN "nicepay_payout_error" TEXT;

CREATE UNIQUE INDEX "supplier_companies_nicepay_sub_id_key"
ON "supplier_companies"("nicepay_sub_id");

CREATE UNIQUE INDEX "payments_request_key_key"
ON "payments"("request_key");
