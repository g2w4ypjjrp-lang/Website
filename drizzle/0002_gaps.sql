CREATE TYPE "public"."promotion_type" AS ENUM('featured', 'premium');--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"provider_id" uuid NOT NULL,
	"service_id" uuid,
	"type" "promotion_type" NOT NULL,
	"days" integer NOT NULL,
	"amount_kurus" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"provider" text,
	"provider_ref" text,
	"conversation_id" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promotions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "image_id" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "canonical_url" text;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD COLUMN "canonical_url" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "story_title" text;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "promotions_provider_idx" ON "promotions" USING btree ("provider_id");