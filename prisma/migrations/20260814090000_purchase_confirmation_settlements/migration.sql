ALTER TABLE "settlements"
ADD COLUMN "source_order_id" TEXT,
ADD COLUMN "pg_fee" DECIMAL(14,2);

CREATE INDEX "settlements_source_order_id_idx" ON "settlements"("source_order_id");
CREATE UNIQUE INDEX "settlements_source_order_id_supplier_company_id_key"
ON "settlements"("source_order_id", "supplier_company_id");

ALTER TABLE "settlements"
ADD CONSTRAINT "settlements_source_order_id_fkey"
FOREIGN KEY ("source_order_id") REFERENCES "orders"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
