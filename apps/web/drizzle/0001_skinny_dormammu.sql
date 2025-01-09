DO $$ BEGIN
 CREATE TYPE "public"."gender" AS ENUM('male', 'female');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "facility" ADD COLUMN "type" varchar;