DO $$ BEGIN
 CREATE TYPE "public"."collection" AS ENUM('onsite', 'home', 'both');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "role" ADD VALUE 'lab';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"phone" varchar,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "admin_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" varchar NOT NULL,
	"patient_id" varchar NOT NULL,
	"doctor_id" varchar,
	"appointment_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"patient_notes" varchar,
	"doctor_notes" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" varchar NOT NULL,
	"day_of_week" "week_day" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_tests_available" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" varchar NOT NULL,
	"test_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"collection" "collection" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labs" (
	"place_id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"location" jsonb,
	"address" varchar NOT NULL,
	"county" varchar NOT NULL,
	"town" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	CONSTRAINT "labs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loinc_test_id" varchar(100),
	"specific_category" varchar(255),
	"sample_type" varchar(255),
	"name" varchar NOT NULL,
	"general_category" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_appointments" ADD CONSTRAINT "lab_appointments_place_id_labs_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."labs"("place_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_appointments" ADD CONSTRAINT "lab_appointments_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_appointments" ADD CONSTRAINT "lab_appointments_doctor_id_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctor"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_availability" ADD CONSTRAINT "lab_availability_place_id_labs_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."labs"("place_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_tests_available" ADD CONSTRAINT "lab_tests_available_place_id_labs_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."labs"("place_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_tests_available" ADD CONSTRAINT "lab_tests_available_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labs" ADD CONSTRAINT "labs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
