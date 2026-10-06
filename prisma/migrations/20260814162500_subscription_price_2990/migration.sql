UPDATE "subscriptions"
SET "price" = CASE
    WHEN "cycle" = 'MONTHLY' THEN 2990
    WHEN "cycle" = 'ANNUAL' THEN 29900
    ELSE "price"
END
WHERE "status" <> 'CANCELLED';

UPDATE "subscription_billing_registrations"
SET "amount" = CASE
    WHEN "cycle" = 'MONTHLY' THEN 2990
    WHEN "cycle" = 'ANNUAL' THEN 29900
    ELSE "amount"
END
WHERE "status" = 'READY';

UPDATE "subscription_payments" AS payment
SET "amount" = CASE
    WHEN subscription."cycle" = 'MONTHLY' THEN 2990
    WHEN subscription."cycle" = 'ANNUAL' THEN 29900
    ELSE payment."amount"
END
FROM "subscriptions" AS subscription
WHERE payment."subscription_id" = subscription."id"
  AND payment."provider" = 'MOCK'
  AND payment."transaction_id" IS NULL;
