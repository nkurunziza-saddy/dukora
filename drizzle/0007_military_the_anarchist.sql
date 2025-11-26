ALTER TYPE "public"."transaction_type" ADD VALUE 'TRANSFER_IN';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'TRANSFER_OUT';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'STOCK_ADJUSTMENT';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'ONLINE_SALE';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'ONLINE_RETURN';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'INVENTORY_RESERVE';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'INVENTORY_RELEASE';--> statement-breakpoint
CREATE TABLE "shopping_carts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"user_id" text,
	"session_id" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"items" json DEFAULT '[]'::json NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"expires_at" timestamp with time zone,
	"converted_to_order_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subtotal_non_negative" CHECK ("shopping_carts"."subtotal" >= 0),
	CONSTRAINT "total_amount_non_negative" CHECK ("shopping_carts"."total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "store_metrics" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"store_product_id" text,
	"metric_date" timestamp with time zone NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"added_to_cart" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"refunds" numeric(12, 2) DEFAULT '0' NOT NULL,
	"conversion_rate" numeric(5, 2),
	"average_order_value" numeric(10, 2),
	"cart_abandonment_rate" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "impressions_non_negative" CHECK ("store_metrics"."impressions" >= 0),
	CONSTRAINT "clicks_non_negative" CHECK ("store_metrics"."clicks" >= 0),
	CONSTRAINT "revenue_non_negative" CHECK ("store_metrics"."revenue" >= 0),
	CONSTRAINT "refunds_non_negative" CHECK ("store_metrics"."refunds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "store_products" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"business_id" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"store_price" numeric(10, 2),
	"compare_at_price" numeric(10, 2),
	"store_sku" text,
	"store_title" text,
	"store_description" text,
	"short_description" text,
	"images" json,
	"meta_title" text,
	"meta_description" text,
	"slug" text,
	"tags" json,
	"featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"requires_shipping" boolean DEFAULT true NOT NULL,
	"weight" numeric(8, 3),
	"max_quantity_per_order" integer,
	"min_quantity_per_order" integer DEFAULT 1 NOT NULL,
	"inventory_tracking" boolean DEFAULT true NOT NULL,
	"allow_backorder" boolean DEFAULT false NOT NULL,
	"stock_display" text DEFAULT 'SHOW_QUANTITY' NOT NULL,
	"cached_stock" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "store_price_positive" CHECK ("store_products"."store_price" IS NULL OR "store_products"."store_price" >= 0),
	CONSTRAINT "compare_at_price_positive" CHECK ("store_products"."compare_at_price" IS NULL OR "store_products"."compare_at_price" >= 0),
	CONSTRAINT "min_quantity_positive" CHECK ("store_products"."min_quantity_per_order" > 0),
	CONSTRAINT "max_quantity_valid" CHECK ("store_products"."max_quantity_per_order" IS NULL OR "store_products"."max_quantity_per_order" >= "store_products"."min_quantity_per_order")
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"is_store_enabled" boolean DEFAULT false NOT NULL,
	"store_name" text,
	"store_description" text,
	"store_logo" text,
	"default_warehouse_id" text,
	"auto_publish_new_products" boolean DEFAULT false NOT NULL,
	"require_inventory" boolean DEFAULT true NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"enable_guest_checkout" boolean DEFAULT true NOT NULL,
	"enable_product_reviews" boolean DEFAULT true NOT NULL,
	"enable_wishlist" boolean DEFAULT true NOT NULL,
	"tax_included_in_price" boolean DEFAULT false NOT NULL,
	"shipping_calculation" text DEFAULT 'FLAT_RATE' NOT NULL,
	"flat_shipping_rate" numeric(10, 2),
	"free_shipping_threshold" numeric(10, 2),
	"currency" text,
	"checkout_success_url" text,
	"checkout_cancel_url" text,
	"custom_domain" text,
	"enable_seo" boolean DEFAULT true NOT NULL,
	"sync_mode" text DEFAULT 'AUTO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_settings_business_id_unique" UNIQUE("business_id"),
	CONSTRAINT "flat_shipping_rate_positive" CHECK ("store_settings"."flat_shipping_rate" IS NULL OR "store_settings"."flat_shipping_rate" >= 0),
	CONSTRAINT "free_shipping_threshold_positive" CHECK ("store_settings"."free_shipping_threshold" IS NULL OR "store_settings"."free_shipping_threshold" > 0)
);
--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "fulfillment_warehouse_id" text;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "fulfillment_status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "tracking_number" text;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "tracking_url" text;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "estimated_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "actual_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "refund_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "refund_status" text;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD COLUMN "is_store_order" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "customer_order_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "source" text DEFAULT 'MANUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_converted_to_order_id_customer_orders_id_fk" FOREIGN KEY ("converted_to_order_id") REFERENCES "public"."customer_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_metrics" ADD CONSTRAINT "store_metrics_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_default_warehouse_id_warehouses_id_fk" FOREIGN KEY ("default_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shopping_carts_business_id" ON "shopping_carts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "shopping_carts_user_id" ON "shopping_carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shopping_carts_session_id" ON "shopping_carts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "shopping_carts_status" ON "shopping_carts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shopping_carts_expires_at" ON "shopping_carts" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "store_metrics_business_id" ON "store_metrics" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "store_metrics_store_product_id" ON "store_metrics" USING btree ("store_product_id");--> statement-breakpoint
CREATE INDEX "store_metrics_metric_date" ON "store_metrics" USING btree ("metric_date");--> statement-breakpoint
CREATE UNIQUE INDEX "store_metrics_business_product_date" ON "store_metrics" USING btree ("business_id","store_product_id","metric_date");--> statement-breakpoint
CREATE UNIQUE INDEX "store_products_business_id_product_id" ON "store_products" USING btree ("business_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "store_products_business_id_slug" ON "store_products" USING btree ("business_id","slug");--> statement-breakpoint
CREATE INDEX "store_products_business_id" ON "store_products" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "store_products_product_id" ON "store_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "store_products_is_published" ON "store_products" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "store_products_featured" ON "store_products" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "store_settings_business_id" ON "store_settings" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_settings_key" ON "business_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "customer_orders_fulfillment_warehouse_id" ON "customer_orders" USING btree ("fulfillment_warehouse_id");--> statement-breakpoint
CREATE INDEX "customer_orders_fulfillment_status" ON "customer_orders" USING btree ("fulfillment_status");--> statement-breakpoint
CREATE INDEX "customer_orders_is_store_order" ON "customer_orders" USING btree ("is_store_order");--> statement-breakpoint
CREATE INDEX "transactions_customer_order_id" ON "transactions" USING btree ("customer_order_id");--> statement-breakpoint
CREATE INDEX "transactions_source" ON "transactions" USING btree ("source");