-- AlterTable
ALTER TABLE "products" ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "delivery_condition" TEXT,
ADD COLUMN     "delivery_days" INTEGER,
ADD COLUMN     "min_order_qty" INTEGER,
ADD COLUMN     "nps_code" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "review_count" INTEGER;
