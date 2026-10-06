             
CREATE TYPE "CategoryItemType" AS ENUM ('GOODS', 'SERVICE');

                                                                    
ALTER TABLE "categories" ADD COLUMN     "code" TEXT,
ADD COLUMN     "item_type" "CategoryItemType",
ADD COLUMN     "level" INTEGER;

                                                                                   
                                                                                         
UPDATE "categories" SET "level" = 1 WHERE "level" IS NULL;
UPDATE "categories"
  SET "code" = CASE
    WHEN "id" LIKE 'cat-%' THEN 'c' || substring("id" FROM 5)
    ELSE 'c-' || "id"
  END
  WHERE "code" IS NULL;

                                               
ALTER TABLE "categories" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "level" SET NOT NULL;

              
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

              
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

              
CREATE INDEX "categories_level_idx" ON "categories"("level");
