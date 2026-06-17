-- 유사도(오타 허용) 검색: PostgreSQL pg_trgm 트라이그램
-- 상품 검색에서 similarity(name, q) 로 오타/근사 매칭 지원.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 트라이그램 GIN 인덱스 (유사도/ILIKE 가속)
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON "products" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_nps_code_trgm_idx ON "products" USING gin ("nps_code" gin_trgm_ops);
