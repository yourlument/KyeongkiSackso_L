-- AlterTable
ALTER TABLE "products" ADD COLUMN     "specs" JSONB;

-- AlterTable
ALTER TABLE "supplier_companies" ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deal_count" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "established_year" INTEGER,
ADD COLUMN     "intro" TEXT,
ADD COLUMN     "portfolio_file_name" TEXT,
ADD COLUMN     "region" TEXT;
