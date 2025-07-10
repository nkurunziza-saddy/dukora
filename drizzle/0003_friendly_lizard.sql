ALTER TABLE "categories" DROP CONSTRAINT "no_self_reference";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
--> statement-breakpoint
DROP INDEX "categories_parent_id";--> statement-breakpoint
CREATE INDEX "categories_id" ON "categories" USING btree ("id");--> statement-breakpoint
CREATE INDEX "categories_value" ON "categories" USING btree ("value");--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "parent_id";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_value_unique" UNIQUE("value");