CREATE TABLE "customer_order_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "customer_orders" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status" DEFAULT 'DRAFT' NOT NULL,
	"business_id" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"shipping_address" json NOT NULL,
	"billing_address" json NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_payment_status" text,
	"guest_checkout" boolean DEFAULT true NOT NULL,
	"user_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"priority" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" json,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_customer_order_id_customer_orders_id_fk" FOREIGN KEY ("customer_order_id") REFERENCES "public"."customer_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_order_items_customer_order_id" ON "customer_order_items" USING btree ("customer_order_id");--> statement-breakpoint
CREATE INDEX "customer_order_items_product_id" ON "customer_order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_orders_business_id_order_number" ON "customer_orders" USING btree ("business_id","order_number");--> statement-breakpoint
CREATE INDEX "customer_orders_business_id" ON "customer_orders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "customer_orders_customer_email" ON "customer_orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "customer_orders_status" ON "customer_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customer_orders_created_at" ON "customer_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "customer_orders_stripe_payment_intent_id" ON "customer_orders" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "notifications_business_id" ON "notifications" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_priority" ON "notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "notifications_read" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notifications_created_at" ON "notifications" USING btree ("created_at");