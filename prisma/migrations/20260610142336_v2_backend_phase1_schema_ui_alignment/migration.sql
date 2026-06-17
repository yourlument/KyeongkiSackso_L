-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('REVIEWING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductImageType" AS ENUM ('THUMBNAIL', 'DETAIL');

-- CreateEnum
CREATE TYPE "QuoteRequestKind" AS ENUM ('OPEN_BID', 'DIRECT');

-- CreateEnum
CREATE TYPE "TaxInvoiceStatus" AS ENUM ('NONE', 'REQUESTED', 'ISSUED');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('QUOTE_RESPONSE', 'BOARD_REPLY', 'INFO_COMMENT', 'QUOTE_AWARDED', 'ORDER_STATUS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('DEMAND', 'INFO');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('NOTICE', 'EVENT');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InquiryStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "InquiryStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'SHIPPING';

-- AlterEnum
ALTER TYPE "QuoteRequestStatus" ADD VALUE 'REVIEWING';

-- AlterEnum
ALTER TYPE "QuoteResponseStatus" ADD VALUE 'UNDER_REVIEW';

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_quote_request_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_quote_response_id_fkey";

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_id" TEXT;

-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "answered_by" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "contact_org" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "supplier_company_id" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "buyer_id" TEXT NOT NULL,
ADD COLUMN     "courier" TEXT,
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "delivery_address" TEXT,
ADD COLUMN     "delivery_address_detail" TEXT,
ADD COLUMN     "delivery_deadline" TIMESTAMP(3),
ADD COLUMN     "delivery_memo" TEXT,
ADD COLUMN     "delivery_place" TEXT,
ADD COLUMN     "order_no" TEXT NOT NULL,
ADD COLUMN     "recipient_department" TEXT,
ADD COLUMN     "recipient_name" TEXT,
ADD COLUMN     "recipient_org_name" TEXT,
ADD COLUMN     "recipient_phone" TEXT,
ADD COLUMN     "site_contact_phone" TEXT,
ADD COLUMN     "tax_invoice_status" "TaxInvoiceStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "tracking_no" TEXT,
ALTER COLUMN "quote_request_id" DROP NOT NULL,
ALTER COLUMN "quote_response_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "board_type" "BoardType" NOT NULL,
ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "video_url" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "type" "ProductImageType" NOT NULL DEFAULT 'THUMBNAIL';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sales_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quote_request_items" ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "quote_requests" ADD COLUMN     "budget" DECIMAL(14,2),
ADD COLUMN     "budget_tbd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "contact_department" TEXT,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_org_name" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "delivery_address" TEXT,
ADD COLUMN     "delivery_address_detail" TEXT,
ADD COLUMN     "delivery_condition" TEXT,
ADD COLUMN     "delivery_place" TEXT,
ADD COLUMN     "desired_delivery_date" TIMESTAMP(3),
ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "kind" "QuoteRequestKind" NOT NULL DEFAULT 'OPEN_BID',
ADD COLUMN     "nps_code" TEXT,
ADD COLUMN     "quote_type" "CategoryItemType",
ADD COLUMN     "target_supplier_company_id" TEXT;

-- AlterTable
ALTER TABLE "quote_responses" ADD COLUMN     "delivery_date" TIMESTAMP(3),
ADD COLUMN     "quote_no" TEXT,
ADD COLUMN     "spec_summary" TEXT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "answered_at" TIMESTAMP(3),
ADD COLUMN     "answered_by" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "contact_org" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "title" TEXT,
ALTER COLUMN "target_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "settlements" ADD COLUMN     "fee" DECIMAL(14,2),
ADD COLUMN     "gross_amount" DECIMAL(14,2),
ADD COLUMN     "scheduled_payout_date" TIMESTAMP(3),
ADD COLUMN     "settle_note" TEXT;

-- AlterTable
ALTER TABLE "supplier_companies" ADD COLUMN     "bank_account_holder" TEXT,
ADD COLUMN     "bank_account_no" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "bank_verified_at" TIMESTAMP(3),
ADD COLUMN     "bankbook_file_url" TEXT,
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "is_restricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manager_email" TEXT,
ADD COLUMN     "manager_name" TEXT,
ADD COLUMN     "manager_phone" TEXT,
ADD COLUMN     "manager_position" TEXT,
ADD COLUMN     "tax_email" TEXT;

-- AlterTable
ALTER TABLE "user_term_agreements" ADD COLUMN     "revoked_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "notices";

-- CreateTable
CREATE TABLE "supplier_certifications" (
    "id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT,
    "file_name" TEXT,
    "status" "CertificationStatus" NOT NULL DEFAULT 'REVIEWING',
    "reject_reason" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "supplier_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_performances" (
    "id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "client" TEXT,
    "year" INTEGER,
    "amount" DECIMAL(14,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "supplier_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_equipments" (
    "id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "supplier_equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "user_id" TEXT NOT NULL,
    "order_payment" BOOLEAN NOT NULL DEFAULT true,
    "quote_notice" BOOLEAN NOT NULL DEFAULT true,
    "delivery" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nara_items" (
    "id" TEXT NOT NULL,
    "nps_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "category" TEXT,

    CONSTRAINT "nara_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_response_attachments" (
    "id" TEXT NOT NULL,
    "quote_response_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "quote_response_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "body" TEXT,
    "file_url" TEXT,
    "file_name" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "requester_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reject_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "processed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "supplier_company_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL,
    "next_billing_date" TIMESTAMP(3),
    "pay_method" TEXT,
    "card_no" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "billing_month" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_attachments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,

    CONSTRAINT "post_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_reactions" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "type" "NewsType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "NewsStatus" NOT NULL DEFAULT 'PUBLISHED',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "author_name" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "video_url" TEXT,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_attachments" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,

    CONSTRAINT "news_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supplier_certifications_supplier_company_id_idx" ON "supplier_certifications"("supplier_company_id");

-- CreateIndex
CREATE INDEX "supplier_certifications_status_idx" ON "supplier_certifications"("status");

-- CreateIndex
CREATE INDEX "supplier_performances_supplier_company_id_idx" ON "supplier_performances"("supplier_company_id");

-- CreateIndex
CREATE INDEX "supplier_equipments_supplier_company_id_idx" ON "supplier_equipments"("supplier_company_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nara_items_nps_code_key" ON "nara_items"("nps_code");

-- CreateIndex
CREATE INDEX "quote_response_attachments_quote_response_id_idx" ON "quote_response_attachments"("quote_response_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_threads_quote_request_id_supplier_company_id_key" ON "chat_threads"("quote_request_id", "supplier_company_id");

-- CreateIndex
CREATE INDEX "chat_messages_thread_id_idx" ON "chat_messages"("thread_id");

-- CreateIndex
CREATE INDEX "refund_requests_status_idx" ON "refund_requests"("status");

-- CreateIndex
CREATE INDEX "refund_requests_order_id_idx" ON "refund_requests"("order_id");

-- CreateIndex
CREATE INDEX "subscriptions_supplier_company_id_idx" ON "subscriptions"("supplier_company_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscription_payments_subscription_id_idx" ON "subscription_payments"("subscription_id");

-- CreateIndex
CREATE INDEX "post_attachments_post_id_idx" ON "post_attachments"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_post_id_user_id_key" ON "post_reactions"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reactions_comment_id_user_id_key" ON "comment_reactions"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX "news_type_status_idx" ON "news"("type", "status");

-- CreateIndex
CREATE INDEX "news_attachments_news_id_idx" ON "news_attachments"("news_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "posts_board_type_created_at_idx" ON "posts"("board_type", "created_at");

-- CreateIndex
CREATE INDEX "quote_requests_category_id_idx" ON "quote_requests"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "quote_responses_quote_no_key" ON "quote_responses"("quote_no");

-- AddForeignKey
ALTER TABLE "supplier_companies" ADD CONSTRAINT "supplier_companies_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_certifications" ADD CONSTRAINT "supplier_certifications_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_performances" ADD CONSTRAINT "supplier_performances_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_equipments" ADD CONSTRAINT "supplier_equipments_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_target_supplier_company_id_fkey" FOREIGN KEY ("target_supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_response_attachments" ADD CONSTRAINT "quote_response_attachments_quote_response_id_fkey" FOREIGN KEY ("quote_response_id") REFERENCES "quote_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_response_id_fkey" FOREIGN KEY ("quote_response_id") REFERENCES "quote_responses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_supplier_company_id_fkey" FOREIGN KEY ("supplier_company_id") REFERENCES "supplier_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_attachments" ADD CONSTRAINT "post_attachments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_attachments" ADD CONSTRAINT "news_attachments_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

