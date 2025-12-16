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
ALTER TABLE "appointment" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "doctor" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "message" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "patient" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN "doctor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "cancelled_by" varchar;--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "cancellation_reason" varchar;--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "reminder_24h_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "reminder_1h_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "office_id" varchar;--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "type" varchar;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "link" varchar;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "patient_id" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "doctor" ADD CONSTRAINT "doctor_office_id_office_location_place_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."office_location"("place_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review" ADD CONSTRAINT "review_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_doctor_id_idx" ON "appointment" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_patient_id_idx" ON "appointment" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_date_idx" ON "appointment" USING btree ("appointment_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointment" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_specialty_idx" ON "doctor" USING btree ("specialty_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_status_idx" ON "doctor" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_facility_idx" ON "doctor" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_user_id_idx" ON "doctor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notification" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patients_user_id_idx" ON "patient" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_doctor_id_idx" ON "review" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_appointment_id_idx" ON "review" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");