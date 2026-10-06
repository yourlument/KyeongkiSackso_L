                                                                                
                                                                               
                                                                    
WITH demo_leaf(product_id, leaf_name) AS (
  VALUES
    ('demo-1', '레미콘'),
    ('demo-2', '레미콘'),
    ('demo-3', '아스콘'),
    ('demo-4', '교통안전용품'),
    ('demo-5', '도로 분리대 및 난간'),
    ('demo-6', '컴퓨터'),
    ('demo-7', '프린터'),
    ('demo-8', '네트워크 장비'),
    ('demo-9', '소방장비'),
    ('demo-10', '소방장비'),
    ('demo-11', '보호용 피복 및 장비'),
    ('demo-12', '의료기기 및 용품'),
    ('demo-13', '사무용 가구'),
    ('demo-14', '교육기관용 가구'),
    ('demo-15', '냉난방기 및 보일러'),
    ('demo-16', '농산물')
)
UPDATE "products" AS p
SET "category_id" = c.id
FROM demo_leaf AS d
JOIN "categories" AS c
  ON c."level" = 3
 AND c."name" = d.leaf_name
WHERE p.id = d.product_id;
