                                                                           
                                                                      
WITH first_approved_names AS (
  SELECT DISTINCT ON (
    cert.supplier_company_id,
    upper(btrim(cert.name))
  )
    cert.supplier_company_id,
    btrim(cert.name) AS mark,
    cert.submitted_at
  FROM supplier_certifications AS cert
  WHERE cert.status = 'APPROVED'
    AND btrim(cert.name) <> ''
  ORDER BY
    cert.supplier_company_id,
    upper(btrim(cert.name)),
    cert.submitted_at,
    cert.id
), approved_marks AS (
  SELECT
    supplier_company_id,
    array_agg(mark ORDER BY submitted_at, mark) AS marks
  FROM first_approved_names
  GROUP BY supplier_company_id
)
UPDATE supplier_companies AS company
SET certifications = COALESCE(approved_marks.marks, ARRAY[]::text[])
FROM (
  SELECT DISTINCT supplier_company_id
  FROM supplier_certifications
) AS submitted_companies
LEFT JOIN approved_marks
  ON approved_marks.supplier_company_id = submitted_companies.supplier_company_id
WHERE company.id = submitted_companies.supplier_company_id;

                                                                              
                                                                     
UPDATE products AS product
SET badges = company.certifications
FROM supplier_companies AS company
WHERE EXISTS (
  SELECT 1
  FROM supplier_certifications AS cert
  WHERE cert.supplier_company_id = company.id
)
  AND product.supplier_company_id = company.id;
