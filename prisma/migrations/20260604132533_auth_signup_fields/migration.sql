            
ALTER TYPE "TermType" ADD VALUE 'SUPPLIER';

             
ALTER TABLE "organizations" ADD COLUMN     "address" TEXT,
ADD COLUMN     "representative_name" TEXT,
ADD COLUMN     "tax_email" TEXT;

             
ALTER TABLE "users" ADD COLUMN     "position" TEXT;
