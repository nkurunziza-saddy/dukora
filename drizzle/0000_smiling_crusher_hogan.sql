CREATE TYPE "public"."order_status" AS ENUM('DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('PURCHASE', 'SALE', 'DAMAGE', 'RETURN_SALE', 'RETURN_PURCHASE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEW_ONLY');--> statement-breakpoint
CREATE TABLE "business_settings" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" json NOT NULL,
	"business_id" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"business_type" text,
	"logo_url" text,
	"registration_number" text,
	"stripe_account_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_domain_unique" UNIQUE("domain"),
	CONSTRAINT "businesses_registration_number_unique" UNIQUE("registration_number"),
	CONSTRAINT "domain_format" CHECK ("businesses"."domain" ~* '^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*.([a-zA-Z]{2,})+$')
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'VIEW_ONLY' NOT NULL,
	"business_id" text,
	"lang" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "email_format" CHECK ("users"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$')
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"business_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE "product_attribute_values" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribute_id" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"business_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_product_tags" (
	"product_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "product_product_tags_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"business_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"attribute_value_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sku" text NOT NULL,
	"barcode" text,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL,
	"category_id" text,
	"business_id" text NOT NULL,
	"status" "product_status" DEFAULT 'ACTIVE' NOT NULL,
	"reorder_point" integer DEFAULT 10 NOT NULL,
	"max_stock" integer DEFAULT 1000 NOT NULL,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"weight" numeric(8, 3),
	"length" numeric(8, 3),
	"width" numeric(8, 3),
	"height" numeric(8, 3),
	"image_url" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "price_positive" CHECK ("products"."price" >= 0),
	CONSTRAINT "cost_price_positive" CHECK ("products"."cost_price" >= 0),
	CONSTRAINT "reorder_point_positive" CHECK ("products"."reorder_point" >= 0),
	CONSTRAINT "max_stock_positive" CHECK ("products"."max_stock" > 0),
	CONSTRAINT "weight_positive" CHECK ("products"."weight" IS NULL OR "products"."weight" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_suppliers" (
	"product_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"business_id" text NOT NULL,
	"supplier_product_code" text,
	"note" text,
	"supplier_price" numeric(12, 2),
	"lead_time_days" integer,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "product_suppliers_product_id_supplier_id_pk" PRIMARY KEY("product_id","supplier_id"),
	CONSTRAINT "supplier_price_positive" CHECK ("product_suppliers"."supplier_price" IS NULL OR "product_suppliers"."supplier_price" >= 0),
	CONSTRAINT "lead_time_non_negative" CHECK ("product_suppliers"."lead_time_days" IS NULL OR "product_suppliers"."lead_time_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_price_history" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_positive" CHECK ("product_price_history"."price" >= 0),
	CONSTRAINT "cost_price_positive" CHECK ("product_price_history"."cost_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "warehouse_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"warehouse_id" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_qty" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "quantity_non_negative" CHECK ("warehouse_items"."quantity" >= 0),
	CONSTRAINT "reserved_qty_non_negative" CHECK ("warehouse_items"."reserved_qty" >= 0),
	CONSTRAINT "reserved_qty_lte_quantity" CHECK ("warehouse_items"."reserved_qty" <= "warehouse_items"."quantity")
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text,
	"business_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"note" text,
	"contact_name" text,
	"business_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "email_format" CHECK ("suppliers"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$')
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"note" text,
	CONSTRAINT "quantity_positive" CHECK ("purchase_order_items"."quantity" > 0),
	CONSTRAINT "unit_price_positive" CHECK ("purchase_order_items"."unit_price" > 0),
	CONSTRAINT "discount_non_negative" CHECK ("purchase_order_items"."discount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status" DEFAULT 'DRAFT' NOT NULL,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"business_id" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"supplier_id" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "total_amount_positive" CHECK ("purchase_orders"."total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sales_order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"note" text,
	CONSTRAINT "quantity_positive" CHECK ("sales_order_items"."quantity" > 0),
	CONSTRAINT "unit_price_positive" CHECK ("sales_order_items"."unit_price" > 0),
	CONSTRAINT "discount_non_negative" CHECK ("sales_order_items"."discount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status" DEFAULT 'DRAFT' NOT NULL,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"business_id" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "total_amount_positive" CHECK ("sales_orders"."total_amount" >= 0),
	CONSTRAINT "discount_amount_non_negative" CHECK ("sales_orders"."discount_amount" >= 0),
	CONSTRAINT "tax_amount_non_negative" CHECK ("sales_orders"."tax_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "profit_reports" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"period_type" text NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"revenue" numeric(12, 2) NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"profit" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "period_end_after_start" CHECK ("profit_reports"."period_end" > "profit_reports"."period_start")
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"period_type" text DEFAULT 'monthly' NOT NULL,
	"period" timestamp with time zone NOT NULL,
	"value" numeric(18, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model" text NOT NULL,
	"record_id" text NOT NULL,
	"action" text NOT NULL,
	"business_id" text NOT NULL,
	"changes" json NOT NULL,
	"performed_by" text NOT NULL,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reference" text,
	"business_id" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "quantity_not_zero" CHECK ("expenses"."amount" != 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"warehouse_id" text NOT NULL,
	"warehouse_item_id" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"reference" text,
	"business_id" text NOT NULL,
	"supplier_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "quantity_not_zero" CHECK ("transactions"."quantity" != 0)
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(255),
	"color" varchar(255) DEFAULT 'sky' NOT NULL,
	"all_day" boolean DEFAULT true NOT NULL,
	"location" varchar(255) DEFAULT 'here' NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"business_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'VIEW_ONLY' NOT NULL,
	"business_id" text,
	"invited_by" text,
	"code" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "email_format" CHECK ("invitations"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$')
);
--> statement-breakpoint
CREATE TABLE "inter_business_payments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payer_business_id" text NOT NULL,
	"receiver_business_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"stripe_charge_id" text,
	"stripe_payment_intent_id" text,
	"status" text NOT NULL,
	"application_fee_amount" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"initiated_by_user_id" text NOT NULL,
	CONSTRAINT "inter_business_payments_stripe_charge_id_unique" UNIQUE("stripe_charge_id"),
	CONSTRAINT "inter_business_payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_id_product_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."product_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_product_tags" ADD CONSTRAINT "product_product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_product_tags" ADD CONSTRAINT "product_product_tags_tag_id_product_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."product_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_attribute_value_id_product_attribute_values_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."product_attribute_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_reports" ADD CONSTRAINT "profit_reports_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_warehouse_item_id_warehouse_items_id_fk" FOREIGN KEY ("warehouse_item_id") REFERENCES "public"."warehouse_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_supplier_id_businesses_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inter_business_payments" ADD CONSTRAINT "inter_business_payments_payer_business_id_businesses_id_fk" FOREIGN KEY ("payer_business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inter_business_payments" ADD CONSTRAINT "inter_business_payments_receiver_business_id_businesses_id_fk" FOREIGN KEY ("receiver_business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inter_business_payments" ADD CONSTRAINT "inter_business_payments_initiated_by_user_id_users_id_fk" FOREIGN KEY ("initiated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_settings_business_id_key" ON "business_settings" USING btree ("business_id","key");--> statement-breakpoint
CREATE INDEX "business_settings_business_id" ON "business_settings" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings" USING btree ("user_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_business_id_email" ON "users" USING btree ("business_id","email");--> statement-breakpoint
CREATE INDEX "users_business_id" ON "users" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "categories_business_id" ON "categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "categories_id" ON "categories" USING btree ("id");--> statement-breakpoint
CREATE INDEX "categories_value" ON "categories" USING btree ("value");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attribute_values_attribute_id_value" ON "product_attribute_values" USING btree ("attribute_id","value");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attributes_business_id_name" ON "product_attributes" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "product_tags_business_id_name" ON "product_tags" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_id_attribute_value_id" ON "product_variants" USING btree ("product_id","attribute_value_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_business_id_sku" ON "products" USING btree ("business_id","sku");--> statement-breakpoint
CREATE INDEX "products_business_id" ON "products" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_sku" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_suppliers_product_id" ON "product_suppliers" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_suppliers_supplier_id" ON "product_suppliers" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "product_price_history_product_id" ON "product_price_history" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_price_history_effective_from" ON "product_price_history" USING btree ("effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_items_product_id_warehouse_id" ON "warehouse_items" USING btree ("product_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "warehouse_items_product_id" ON "warehouse_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "warehouse_items_warehouse_id" ON "warehouse_items" USING btree ("warehouse_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_business_id_code" ON "warehouses" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "warehouses_business_id" ON "warehouses" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_business_id_email" ON "suppliers" USING btree ("business_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_business_id_phone" ON "suppliers" USING btree ("business_id","phone");--> statement-breakpoint
CREATE INDEX "suppliers_business_id" ON "suppliers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "purchase_order_items_purchase_order_id" ON "purchase_order_items" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "purchase_order_items_product_id" ON "purchase_order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_orders_business_id_order_number" ON "purchase_orders" USING btree ("business_id","order_number");--> statement-breakpoint
CREATE INDEX "purchase_orders_business_id" ON "purchase_orders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_supplier_id" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "sales_order_items_sales_order_id" ON "sales_order_items" USING btree ("sales_order_id");--> statement-breakpoint
CREATE INDEX "sales_order_items_product_id" ON "sales_order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_orders_business_id_order_number" ON "sales_orders" USING btree ("business_id","order_number");--> statement-breakpoint
CREATE INDEX "sales_orders_business_id" ON "sales_orders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sales_orders_status" ON "sales_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_orders_order_date" ON "sales_orders" USING btree ("order_date");--> statement-breakpoint
CREATE UNIQUE INDEX "profit_reports_business_id_period_type_period_start" ON "profit_reports" USING btree ("business_id","period_type","period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "metrics_business_id_name_period_type_period" ON "metrics" USING btree ("business_id","name","period_type","period");--> statement-breakpoint
CREATE INDEX "audit_logs_model_record_id" ON "audit_logs" USING btree ("model","record_id");--> statement-breakpoint
CREATE INDEX "audit_logs_business_id" ON "audit_logs" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "audit_logs_performed_by" ON "audit_logs" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "audit_logs_performed_at" ON "audit_logs" USING btree ("performed_at");--> statement-breakpoint
CREATE INDEX "expenses_business_id" ON "expenses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "expenses_created_at" ON "expenses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_product_id" ON "transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "transactions_warehouse_id" ON "transactions" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "transactions_warehouse_item_id" ON "transactions" USING btree ("warehouse_item_id");--> statement-breakpoint
CREATE INDEX "transactions_business_id" ON "transactions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "transactions_supplier_id" ON "transactions" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "transactions_created_at" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "schedule_business_id_user_id" ON "schedules" USING btree ("business_id","user_id");--> statement-breakpoint
CREATE INDEX "schedule_business_id" ON "schedules" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "schedule_performed_by" ON "schedules" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_business_id_email" ON "invitations" USING btree ("business_id","email");--> statement-breakpoint
CREATE INDEX "invitations_business_id" ON "invitations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "invitations_email" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "inter_business_payments_payer_business_id" ON "inter_business_payments" USING btree ("payer_business_id");--> statement-breakpoint
CREATE INDEX "inter_business_payments_receiver_business_id" ON "inter_business_payments" USING btree ("receiver_business_id");--> statement-breakpoint
CREATE INDEX "inter_business_payments_status" ON "inter_business_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inter_business_payments_initiated_by_user_id" ON "inter_business_payments" USING btree ("initiated_by_user_id");