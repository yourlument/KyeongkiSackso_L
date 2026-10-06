ALTER TABLE "supplier_companies" ADD COLUMN IF NOT EXISTS "bank_otp_ref_id" TEXT;
ALTER TABLE "supplier_companies" ADD COLUMN IF NOT EXISTS "bank_otp_request_no" TEXT;
ALTER TABLE "supplier_companies" ADD COLUMN IF NOT EXISTS "bank_otp_requested_at" TIMESTAMP(3);
