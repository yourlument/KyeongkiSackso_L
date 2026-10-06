                                                                              
                                                                       
UPDATE "supplier_companies"
SET "quote_seal_company_name" = REGEXP_REPLACE(BTRIM("name"), '[[:space:]]+', ' ', 'g')
WHERE NULLIF(REGEXP_REPLACE(BTRIM("name"), '[[:space:]]+', ' ', 'g'), '') IS NOT NULL
  AND "quote_seal_company_name" IS DISTINCT FROM REGEXP_REPLACE(BTRIM("name"), '[[:space:]]+', ' ', 'g');

                                                                              
                                                                  
CREATE OR REPLACE FUNCTION sync_supplier_quote_seal_company_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_company_name TEXT;
BEGIN
  normalized_company_name := NULLIF(
    REGEXP_REPLACE(BTRIM(NEW."name"), '[[:space:]]+', ' ', 'g'),
    ''
  );

  IF TG_OP = 'INSERT' THEN
    NEW."quote_seal_company_name" := normalized_company_name;
  ELSIF NEW."name" IS DISTINCT FROM OLD."name"
    OR NEW."quote_seal_company_name" IS NULL
    OR BTRIM(NEW."quote_seal_company_name") = '' THEN
    NEW."quote_seal_company_name" := normalized_company_name;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_supplier_quote_seal_company_name_trigger
ON "supplier_companies";

CREATE TRIGGER sync_supplier_quote_seal_company_name_trigger
BEFORE INSERT OR UPDATE OF "name", "quote_seal_company_name"
ON "supplier_companies"
FOR EACH ROW
EXECUTE FUNCTION sync_supplier_quote_seal_company_name();
