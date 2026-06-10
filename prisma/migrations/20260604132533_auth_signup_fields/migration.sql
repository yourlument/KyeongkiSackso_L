-- AlterEnum
ALTER TYPE "TermType" ADD VALUE 'SUPPLIER';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "address" TEXT,
ADD COLUMN     "representative_name" TEXT,
ADD COLUMN     "tax_email" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "position" TEXT;
