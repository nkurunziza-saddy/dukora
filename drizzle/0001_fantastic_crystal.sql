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
	"deleted_at" timestamp with time zone,
	CONSTRAINT "email_format" CHECK ("invitations"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$')
);
--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "domain" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "registration_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_type" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "value" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_business_id_email" ON "invitations" USING btree ("business_id","email");--> statement-breakpoint
CREATE INDEX "invitations_business_id" ON "invitations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "invitations_email" ON "invitations" USING btree ("email");