ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'RWF' NOT NULL;-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_currency" ON "products" USING btree ("currency");