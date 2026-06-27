-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CHAT';

-- DropIndex
DROP INDEX "products_name_trgm_idx";

-- DropIndex
DROP INDEX "products_nps_code_trgm_idx";
