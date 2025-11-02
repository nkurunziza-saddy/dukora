-- CreateEnum
CREATE TYPE "public"."order_status" AS ENUM('DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "customer_orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "order_number" TEXT NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'DRAFT',
    "business_id" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT,
    "shipping_address" JSONB NOT NULL,
    "billing_address" JSONB NOT NULL,
    "total_amount" NUMERIC(12,2) NOT NULL,
    "discount_amount" NUMERIC(12,2) NOT NULL DEFAULT '0',
    "tax_amount" NUMERIC(12,2) NOT NULL DEFAULT '0',
    "shipping_amount" NUMERIC(12,2) NOT NULL DEFAULT '0',
    "stripe_payment_intent_id" TEXT,
    "stripe_payment_status" TEXT,
    "guest_checkout" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_order_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "customer_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" NUMERIC(10,2) NOT NULL,
    "discount" NUMERIC(10,2) NOT NULL DEFAULT '0',
    "notes" TEXT,

    CONSTRAINT "customer_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_orders_business_id_order_number_key" ON "customer_orders"("business_id", "order_number");

-- CreateIndex
CREATE INDEX "customer_orders_business_id_idx" ON "customer_orders"("business_id");

-- CreateIndex
CREATE INDEX "customer_orders_customer_email_idx" ON "customer_orders"("customer_email");

-- CreateIndex
CREATE INDEX "customer_orders_status_idx" ON "customer_orders"("status");

-- CreateIndex
CREATE INDEX "customer_orders_created_at_idx" ON "customer_orders"("created_at");

-- CreateIndex
CREATE INDEX "customer_orders_stripe_payment_intent_id_idx" ON "customer_orders"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "customer_order_items_customer_order_id_idx" ON "customer_order_items"("customer_order_id");

-- CreateIndex
CREATE INDEX "customer_order_items_product_id_idx" ON "customer_order_items"("product_id");

-- AddForeignKey
ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_customer_order_id_fkey" FOREIGN KEY ("customer_order_id") REFERENCES "customer_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
