-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "nara_dtil_code" TEXT,
ADD COLUMN     "nara_query" TEXT;

-- CreateTable
CREATE TABLE "nara_item_categories" (
    "category_id" TEXT NOT NULL,
    "nps_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nara_item_categories_pkey" PRIMARY KEY ("category_id","nps_code")
);

-- CreateTable
CREATE TABLE "nara_category_syncs" (
    "category_id" TEXT NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nara_category_syncs_pkey" PRIMARY KEY ("category_id")
);

-- CreateIndex
CREATE INDEX "nara_item_categories_category_id_idx" ON "nara_item_categories"("category_id");
