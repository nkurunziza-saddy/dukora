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
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transaction_type";--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('PURCHASE', 'SALE', 'DAMAGE', 'RETURN_SALE', 'RETURN_PURCHASE');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";--> statement-breakpoint
DROP INDEX "products_business_id_barcode";--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "stripe_account_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "supplier_id" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inter_business_payments" ADD CONSTRAINT "inter_business_payments_payer_business_id_businesses_id_fk" FOREIGN KEY ("payer_business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inter_business_payments" ADD CONSTRAINT "inter_business_payments_receiver_business_id_businesses_id_fk" FOREIGN KEY ("receiver_business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inter_business_payments" ADD CONSTRAINT "inter_business_payments_initiated_by_user_id_users_id_fk" FOREIGN KEY ("initiated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_business_id" ON "expenses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "expenses_created_at" ON "expenses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inter_business_payments_payer_business_id" ON "inter_business_payments" USING btree ("payer_business_id");--> statement-breakpoint
CREATE INDEX "inter_business_payments_receiver_business_id" ON "inter_business_payments" USING btree ("receiver_business_id");--> statement-breakpoint
CREATE INDEX "inter_business_payments_status" ON "inter_business_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inter_business_payments_initiated_by_user_id" ON "inter_business_payments" USING btree ("initiated_by_user_id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_supplier_id_businesses_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_supplier_id" ON "transactions" USING btree ("supplier_id");