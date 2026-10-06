ALTER TABLE "supplier_companies"
ADD COLUMN IF NOT EXISTS "quote_seal_image_key" TEXT;

                                                                           
                                                                            
                                                                          
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
  ELSIF NEW."name" IS DISTINCT FROM OLD."name" THEN
    NEW."quote_seal_company_name" := normalized_company_name;
    NEW."quote_seal_image_key" := NULL;
  ELSIF NEW."quote_seal_company_name" IS NULL
    OR BTRIM(NEW."quote_seal_company_name") = '' THEN
    NEW."quote_seal_company_name" := normalized_company_name;
  END IF;

  RETURN NEW;
END;
$$;
