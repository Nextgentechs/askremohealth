DO $$ BEGIN
 CREATE TYPE "public"."appointment_type" AS ENUM('online', 'physical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "type" "appointment_type" NOT NULL;