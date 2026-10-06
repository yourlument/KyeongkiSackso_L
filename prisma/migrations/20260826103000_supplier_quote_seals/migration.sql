                                                                              
                                                                           
                
ALTER TABLE "supplier_companies"
ADD COLUMN IF NOT EXISTS "quote_seal_company_name" TEXT;

UPDATE "supplier_companies"
SET "quote_seal_company_name" = "name"
WHERE (
  "quote_seal_company_name" IS NULL
  OR BTRIM("quote_seal_company_name") = ''
)
  AND NULLIF(BTRIM("name"), '') IS NOT NULL;
