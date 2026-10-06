             
CREATE TYPE "UserRole" AS ENUM ('OFFICIAL', 'SUPPLIER', 'ADMIN');

             
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'WITHDRAWN');

             
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

             
CREATE TYPE "TermType" AS ENUM ('SERVICE', 'PRIVACY', 'MARKETING');

             
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'SOLD_OUT');

             
CREATE TYPE "QuoteRequestStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'AWARDED', 'CANCELLED');

             
CREATE TYPE "QuoteResponseStatus" AS ENUM ('SUBMITTED', 'AWARDED', 'REJECTED', 'WITHDRAWN');

             
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CONTRACTED', 'DELIVERED', 'COMPLETED', 'CANCELLED');

             
CREATE TYPE "PaymentProvider" AS ENUM ('MOCK', 'TOSS');

             
CREATE TYPE "PaymentStatus" AS ENUM ('READY', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

             
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PAID');

             
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');

             
CREATE TYPE "InquiryStatus" AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');

              
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "organization_id" TEXT,
    "department_name" TEXT,
    "supplier_company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "business_registration_no" TEXT,
    "type" TEXT,
    "region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "supplier_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "representative_name" TEXT NOT NULL,
    "business_registration_no" TEXT NOT NULL,
    "business_license_file_url" TEXT,
    "corporate_registration_no" TEXT,
    "business_type" TEXT,
    "business_item" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approval_memo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_companies_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "type" "TermType" NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "user_term_agreements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "term_id" TEXT NOT NULL,
    "agreed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_term_agreements_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(14,2) NOT NULL,
    "unit" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "inventories" (
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("product_id")
);

              
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL,
    "official_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "deadline" TIMESTAMP(3),
    "awarded_response_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "quote_request_items" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "product_id" TEXT,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "quote_request_items_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "quote_request_attachments" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "quote_request_attachments_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "quote_responses" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" "QuoteResponseStatus" NOT NULL DEFAULT 'SUBMITTED',
    "valid_until" TIMESTAMP(3),
    "memo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_responses_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "quote_response_items" (
    "id" TEXT NOT NULL,
    "quote_response_id" TEXT NOT NULL,
    "quote_request_item_id" TEXT NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "quote_response_items_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "quote_response_id" TEXT NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "settlement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "terms" TEXT,
    "signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MOCK',
    "status" "PaymentStatus" NOT NULL DEFAULT 'READY',
    "amount" DECIMAL(14,2) NOT NULL,
    "method" TEXT,
    "transaction_id" TEXT,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

              
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answered_at" TIMESTAMP(3),

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

              
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

              
CREATE INDEX "users_role_idx" ON "users"("role");

              
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

              
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

              
CREATE UNIQUE INDEX "organizations_business_registration_no_key" ON "organizations"("business_registration_no");

              
CREATE UNIQUE INDEX "supplier_companies_business_registration_no_key" ON "supplier_companies"("business_registration_no");

              
CREATE INDEX "supplier_companies_approval_status_idx" ON "supplier_companies"("approval_status");

              
CREATE UNIQUE INDEX "terms_type_version_key" ON "terms"("type", "version");

              
CREATE UNIQUE INDEX "user_term_agreements_user_id_term_id_key" ON "user_term_agreements"("user_id", "term_id");

              
CREATE INDEX "products_supplier_company_id_idx" ON "products"("supplier_company_id");

              
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

              
CREATE INDEX "products_status_idx" ON "products"("status");

              
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

              
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

              
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "cart_items"("cart_id", "product_id");

              
CREATE UNIQUE INDEX "quote_requests_awarded_response_id_key" ON "quote_requests"("awarded_response_id");

              
CREATE INDEX "quote_requests_official_id_idx" ON "quote_requests"("official_id");

              
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

              
CREATE INDEX "quote_request_items_quote_request_id_idx" ON "quote_request_items"("quote_request_id");

              
CREATE INDEX "quote_request_attachments_quote_request_id_idx" ON "quote_request_attachments"("quote_request_id");

              
CREATE INDEX "quote_responses_supplier_company_id_idx" ON "quote_responses"("supplier_company_id");

              
CREATE UNIQUE INDEX "quote_responses_quote_request_id_supplier_company_id_key" ON "quote_responses"("quote_request_id", "supplier_company_id");

              
CREATE INDEX "quote_response_items_quote_response_id_idx" ON "quote_response_items"("quote_response_id");

              
CREATE UNIQUE INDEX "orders_quote_request_id_key" ON "orders"("quote_request_id");

              
CREATE UNIQUE INDEX "orders_quote_response_id_key" ON "orders"("quote_response_id");

              
CREATE INDEX "orders_status_idx" ON "orders"("status");

              
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

              
CREATE UNIQUE INDEX "contracts_order_id_key" ON "contracts"("order_id");

              
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

              
CREATE INDEX "payments_status_idx" ON "payments"("status");

              
CREATE INDEX "settlements_supplier_company_id_idx" ON "settlements"("supplier_company_id");

              
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

              
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

              
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");

              
CREATE INDEX "reports_status_idx" ON "reports"("status");

              
CREATE INDEX "inquiries_user_id_idx" ON "inquiries"("user_id");

              
CREATE INDEX "inquiries_status_idx" ON "inquiries"("status");

                
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

                
ALTER TABLE "users" ADD CONSTRAINT "users_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

                
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "user_term_agreements" ADD CONSTRAINT "user_term_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "user_term_agreements" ADD CONSTRAINT "user_term_agreements_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

                
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

                
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_official_id_fkey" FOREIGN KEY ("official_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_awarded_response_id_fkey" FOREIGN KEY ("awarded_response_id") REFERENCES "quote_responses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

                
ALTER TABLE "quote_request_items" ADD CONSTRAINT "quote_request_items_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "quote_request_attachments" ADD CONSTRAINT "quote_request_attachments_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "quote_responses" ADD CONSTRAINT "quote_responses_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "quote_responses" ADD CONSTRAINT "quote_responses_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "quote_response_items" ADD CONSTRAINT "quote_response_items_quote_response_id_fkey" FOREIGN KEY ("quote_response_id") REFERENCES "quote_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "quote_response_items" ADD CONSTRAINT "quote_response_items_quote_request_item_id_fkey" FOREIGN KEY ("quote_request_item_id") REFERENCES "quote_request_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_response_id_fkey" FOREIGN KEY ("quote_response_id") REFERENCES "quote_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "orders" ADD CONSTRAINT "orders_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "settlements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

                
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

                
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

                
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
