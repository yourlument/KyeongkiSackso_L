                                                                               
                                                                        
WITH combined_certifications AS (
  SELECT *
  FROM supplier_certifications
  WHERE regexp_replace(name, '[[:space:]]', '', 'g') IN (
    '사회적기업/여성기업',
    '여성기업/사회적기업'
  )
)
INSERT INTO supplier_certifications (
  id,
  supplier_company_id,
  name,
  description,
  file_url,
  file_name,
  status,
  reject_reason,
  submitted_at,
  reviewed_at
)
SELECT
  combined.id || '-women',
  combined.supplier_company_id,
  '여성기업',
  combined.description,
  combined.file_url,
  CASE
    WHEN regexp_replace(COALESCE(combined.file_name, ''), '[[:space:]]', '', 'g') IN (
      '사회적기업/여성기업인증서',
      '여성기업/사회적기업인증서'
    ) THEN '여성기업 인증서'
    ELSE combined.file_name
  END,
  combined.status,
  combined.reject_reason,
  combined.submitted_at,
  combined.reviewed_at
FROM combined_certifications AS combined
WHERE NOT EXISTS (
  SELECT 1
  FROM supplier_certifications AS existing
  WHERE existing.supplier_company_id = combined.supplier_company_id
    AND regexp_replace(existing.name, '[[:space:]]', '', 'g') = '여성기업'
)
ON CONFLICT (id) DO NOTHING;

UPDATE supplier_certifications
SET
  name = '사회적기업',
  file_name = CASE
    WHEN regexp_replace(COALESCE(file_name, ''), '[[:space:]]', '', 'g') IN (
      '사회적기업/여성기업인증서',
      '여성기업/사회적기업인증서'
    ) THEN '사회적기업 인증서'
    ELSE file_name
  END
WHERE regexp_replace(name, '[[:space:]]', '', 'g') IN (
  '사회적기업/여성기업',
  '여성기업/사회적기업'
);

                                                                            
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
SET certifications = approved_marks.marks
FROM approved_marks
WHERE company.id = approved_marks.supplier_company_id;

UPDATE products AS product
SET badges = company.certifications
FROM supplier_companies AS company
WHERE product.supplier_company_id = company.id
  AND EXISTS (
    SELECT 1
    FROM supplier_certifications AS cert
    WHERE cert.supplier_company_id = company.id
  );
