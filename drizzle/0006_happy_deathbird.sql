ALTER TABLE "customer_order_items" DROP CONSTRAINT "customer_order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_product_id_warehouse_items_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."warehouse_items"("id") ON DELETE no action ON UPDATE no action;