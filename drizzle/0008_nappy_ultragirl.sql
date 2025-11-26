ALTER TABLE "shopping_carts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "shopping_carts" CASCADE;--> statement-breakpoint
ALTER TABLE "store_metrics" DROP CONSTRAINT "impressions_non_negative";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP CONSTRAINT "clicks_non_negative";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP CONSTRAINT "refunds_non_negative";--> statement-breakpoint
ALTER TABLE "store_products" DROP CONSTRAINT "min_quantity_positive";--> statement-breakpoint
ALTER TABLE "store_products" DROP CONSTRAINT "max_quantity_valid";--> statement-breakpoint
ALTER TABLE "store_settings" DROP CONSTRAINT "flat_shipping_rate_positive";--> statement-breakpoint
ALTER TABLE "store_settings" DROP CONSTRAINT "free_shipping_threshold_positive";--> statement-breakpoint
ALTER TABLE "store_metrics" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_metrics" ADD COLUMN "orders" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "impressions";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "clicks";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "purchases";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "refunds";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "conversion_rate";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "average_order_value";--> statement-breakpoint
ALTER TABLE "store_metrics" DROP COLUMN "cart_abandonment_rate";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "store_sku";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "meta_title";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "meta_description";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "requires_shipping";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "max_quantity_per_order";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "min_quantity_per_order";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "inventory_tracking";--> statement-breakpoint
ALTER TABLE "store_products" DROP COLUMN "allow_backorder";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "enable_guest_checkout";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "enable_product_reviews";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "enable_wishlist";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "tax_included_in_price";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "shipping_calculation";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "flat_shipping_rate";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "free_shipping_threshold";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "checkout_success_url";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "checkout_cancel_url";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "custom_domain";--> statement-breakpoint
ALTER TABLE "store_settings" DROP COLUMN "enable_seo";--> statement-breakpoint
ALTER TABLE "store_metrics" ADD CONSTRAINT "views_non_negative" CHECK ("store_metrics"."views" >= 0);--> statement-breakpoint
ALTER TABLE "store_metrics" ADD CONSTRAINT "orders_non_negative" CHECK ("store_metrics"."orders" >= 0);