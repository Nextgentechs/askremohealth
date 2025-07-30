CREATE TABLE IF NOT EXISTS "office_location" (
	"place_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"location" jsonb,
	"address" varchar NOT NULL,
	"county" varchar NOT NULL,
	"town" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" varchar
);
--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT "articles_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "office_id" varchar;--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "doctor" ADD CONSTRAINT "doctor_office_id_office_location_place_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."office_location"("place_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_phone_unique" UNIQUE("phone");