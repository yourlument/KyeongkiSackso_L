ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'ACTIVE';

CREATE TYPE "SubscriptionCycle" AS ENUM ('MONTHLY', 'ANNUAL');
CREATE TYPE "SubscriptionPaymentKind" AS ENUM ('INITIAL', 'RENEWAL');
CREATE TYPE "SubscriptionBillingRegistrationStatus" AS ENUM ('READY', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "SubscriptionBillingRegistrationMode" AS ENUM ('ACTIVATE', 'REPLACE');

ALTER TABLE "subscriptions"
ADD COLUMN "cycle" "SubscriptionCycle" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN "card_code" TEXT,
ADD COLUMN "card_name" TEXT,
ADD COLUMN "billing_provider" TEXT,
ADD COLUMN "billing_key_encrypted" TEXT,
ADD COLUMN "billing_key_issued_tid" TEXT,
ADD COLUMN "billing_anchor_day" INTEGER,
ADD COLUMN "current_period_start" TIMESTAMP(3),
ADD COLUMN "current_period_end" TIMESTAMP(3),
ADD COLUMN "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "cancel_effective_at" TIMESTAMP(3),
ADD COLUMN "cancelled_at" TIMESTAMP(3),
ADD COLUMN "billing_failure_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "next_retry_at" TIMESTAMP(3),
ADD COLUMN "last_billing_attempt_at" TIMESTAMP(3),
ADD COLUMN "last_billing_error" TEXT,
ADD COLUMN "billing_lock_until" TIMESTAMP(3);

ALTER TABLE "subscription_payments"
ADD COLUMN "kind" "SubscriptionPaymentKind" NOT NULL DEFAULT 'RENEWAL',
ADD COLUMN "provider" "PaymentProvider" NOT NULL DEFAULT 'MOCK',
ADD COLUMN "transaction_id" TEXT,
ADD COLUMN "merchant_order_id" TEXT,
ADD COLUMN "period_start" TIMESTAMP(3),
ADD COLUMN "period_end" TIMESTAMP(3),
ADD COLUMN "attempted_at" TIMESTAMP(3),
ADD COLUMN "attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "failure_reason" TEXT,
ADD COLUMN "metadata" JSONB;

CREATE TABLE "subscription_billing_registrations" (
    "id" TEXT NOT NULL,
    "request_key" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "cycle" "SubscriptionCycle" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "mode" "SubscriptionBillingRegistrationMode" NOT NULL,
    "status" "SubscriptionBillingRegistrationStatus" NOT NULL DEFAULT 'READY',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "result_code" TEXT,
    "result_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscription_billing_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscription_payments_transaction_id_key" ON "subscription_payments"("transaction_id");
CREATE UNIQUE INDEX "subscription_payments_merchant_order_id_key" ON "subscription_payments"("merchant_order_id");
CREATE UNIQUE INDEX "subscription_payments_subscription_id_billing_month_key" ON "subscription_payments"("subscription_id", "billing_month");
CREATE INDEX "subscriptions_next_billing_date_status_idx" ON "subscriptions"("next_billing_date", "status");
CREATE UNIQUE INDEX "subscription_billing_registrations_request_key_key" ON "subscription_billing_registrations"("request_key");
CREATE INDEX "subscription_billing_registrations_supplier_company_id_status_idx" ON "subscription_billing_registrations"("supplier_company_id", "status");
CREATE INDEX "subscription_billing_registrations_subscription_id_idx" ON "subscription_billing_registrations"("subscription_id");

ALTER TABLE "subscription_billing_registrations" ADD CONSTRAINT "subscription_billing_registrations_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_billing_registrations" ADD CONSTRAINT "subscription_billing_registrations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
