DO $$ BEGIN
 CREATE TYPE "public"."doctor_status" AS ENUM('pending', 'verified', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "status" "doctor_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "doctor" DROP COLUMN IF EXISTS "is_verified";