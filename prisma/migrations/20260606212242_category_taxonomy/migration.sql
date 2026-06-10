-- CreateEnum
CREATE TYPE "CategoryItemType" AS ENUM ('GOODS', 'SERVICE');

-- AlterTable: add nullable first to allow backfill of existing rows
ALTER TABLE "categories" ADD COLUMN     "code" TEXT,
ADD COLUMN     "item_type" "CategoryItemType",
ADD COLUMN     "level" INTEGER;

-- Backfill existing seed rows (ids cat-1..cat-N) → top-level (level 1), code c{N}.
-- Existing rows were flat 7 대분류; the seed re-upserts them with the official Figma names.
UPDATE "categories" SET "level" = 1 WHERE "level" IS NULL;
UPDATE "categories"
  SET "code" = CASE
    WHEN "id" LIKE 'cat-%' THEN 'c' || substring("id" FROM 5)
    ELSE 'c-' || "id"
  END
  WHERE "code" IS NULL;

-- Enforce NOT NULL now that data is backfilled
ALTER TABLE "categories" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "level" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_level_idx" ON "categories"("level");
